"use server";

import { cookies } from "next/headers";
import { getCart, getVariantPricing, getCustomer } from "@/lib/shopifyQueries";
import { createDraftOrder } from "@/lib/shopifyAdmin";
import { validateCheckoutDetails } from "@/lib/checkoutDetails";
import { CUSTOMER_COOKIE } from "@/lib/session";

const HYP_BASE_URL = "https://pay.hyp.co.il/p/";
// Where Hyp sends the customer back. Override with SITE_URL in
// .env.local (e.g. http://localhost:3000) to test checkout locally.
const SITE_URL = process.env.SITE_URL || "https://thecontaineronline.com";
const TERMINAL = process.env.HYP_TERMINAL_NUMBER;
const API_KEY = process.env.HYP_API_KEY;
const PASS_P = process.env.HYP_PASS_P;

// ─── Currencies ───────────────────────────────────────────────
// Hebrew shoppers pay in ILS (Israel price), everyone else in USD
// (global price) — the same prices shown in the cart drawer.
const CURRENCIES = {
  ILS: { coin: "1", priceKey: "israelPrice" },
  USD: { coin: "2", priceKey: "globalPrice" },
};

// ─── Logged-in customer (optional) ────────────────────────────
// Links the order to the customer's account when they're logged in.
async function currentCustomerId() {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  try {
    return (await getCustomer(token))?.id || null;
  } catch {
    return null;
  }
}

// ─── Ask Hyp to sign the payment page ─────────────────────────
async function signWithHyp(params) {
  const response = await fetch(`${HYP_BASE_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  const responseText = (await response.text()).trim();
  const signed = new URLSearchParams(responseText);
  const ok = response.ok && (!signed.has("CCode") || signed.get("CCode") === "0");
  return { ok, status: response.status, code: signed.get("CCode"), responseText };
}

// ─── createHypPayment ─────────────────────────────────────────
// Called from the checkout page with the Shopify cart ID and the
// customer's shipping details. The server validates the details,
// loads and prices the cart, records a pending Shopify draft order
// (with the address), and returns a signed Hyp payment page URL.
export async function createHypPayment({ cartId, language, details: rawDetails } = {}) {
  try {
    if (typeof cartId !== "string" || !cartId.startsWith("gid://shopify/Cart/")) {
      return { success: false, error: "invalid_cart" };
    }

    const { details, errors } = validateCheckoutDetails(rawDetails);
    if (Object.keys(errors).length > 0) {
      return { success: false, error: "invalid_details", fields: errors };
    }

    const isHebrew = language === "Hebrew";
    const currency = isHebrew ? "ILS" : "USD";
    const { coin, priceKey } = CURRENCIES[currency];

    // ─── Load cart from Shopify (never trust client data) ──
    const cart = await getCart(cartId);
    const lines =
      cart?.lines?.edges
        ?.map(({ node }) => ({
          variantId: node.merchandise?.id,
          quantity: node.quantity,
        }))
        .filter((l) => l.variantId && l.quantity > 0) || [];

    if (lines.length === 0) {
      return { success: false, error: "empty_cart" };
    }

    // ─── Price every line on the server ────────────────────
    const pricing = await getVariantPricing(lines.map((l) => l.variantId));
    let amount = 0;
    const summary = [];
    for (const line of lines) {
      const price = pricing[line.variantId]?.[priceKey];
      if (!price || price <= 0) {
        return { success: false, error: "missing_price" };
      }
      amount += price * line.quantity;
      summary.push(`${line.quantity} × ${pricing[line.variantId].title}`);
    }

    // ─── Record pending order in Shopify ───────────────────
    const attributes = [
      { key: "hyp_amount", value: String(amount) },
      { key: "hyp_currency", value: currency },
      { key: "language", value: isHebrew ? "Hebrew" : "English" },
    ];
    // Kept as typed, in case Shopify drops an unknown state code
    if (details.region) attributes.push({ key: "region", value: details.region });

    const draftOrder = await createDraftOrder({
      lines,
      attributes,
      note: `Awaiting Hyp payment: ${amount} ${currency}`,
      details,
      customerId: await currentCustomerId(),
    });
    const orderId = draftOrder.id.split("/").pop();

    // ─── Ask Hyp to sign the payment request ───────────────
    // Customer fields pre-fill Hyp's page so nothing is typed twice.
    // (Hyp has no zip/country fields; the full address is in Shopify.)
    const customerFields = {
      ClientName: details.firstName,
      ClientLName: details.lastName,
      email: details.email,
      cell: details.phone,
      street: [details.address1, details.address2].filter(Boolean).join(", "),
      city: details.city,
    };
    const params = new URLSearchParams({
      action: "APISign",
      What: "SIGN",
      Sign: "True",
      Masof: TERMINAL,
      KEY: API_KEY,
      PassP: PASS_P,
      Amount: String(amount),
      Coin: coin,
      Order: orderId,
      Info: summary.join(", ").slice(0, 250),
      PageLang: isHebrew ? "HEB" : "ENG",
      sendemail: "True",
      tmp: "2",
      // Our values are UTF-8 (Hyp's page is windows-1255; Hyp converts).
      // UTF8out keeps Hebrew intact in the redirect back to us, so the
      // fields we forward to Hyp's VERIFY match what Hyp signed.
      UTF8: "True",
      UTF8out: "True",
      SuccessUrl: `${SITE_URL}/checkout/success`,
      ErrorUrl: `${SITE_URL}/checkout/success`,
    });
    for (const [key, value] of Object.entries(customerFields)) {
      if (value) params.set(key, value);
    }

    let signed = await signWithHyp(params);
    if (!signed.ok) {
      // Hyp may refuse some customer fields (e.g. Hebrew names on some
      // terminals). Pre-filling is only a convenience, so retry without.
      console.error("Hyp sign failed, retrying without customer fields:", signed.status, signed.code);
      for (const key of Object.keys(customerFields)) params.delete(key);
      signed = await signWithHyp(params);
    }
    if (!signed.ok) {
      console.error("Hyp sign failed:", signed.status, signed.code);
      return { success: false, error: "payment_unavailable" };
    }

    return { success: true, paymentUrl: `${HYP_BASE_URL}?${signed.responseText}` };
  } catch (error) {
    console.error("Checkout error:", error.message);
    return { success: false, error: "checkout_failed" };
  }
}
