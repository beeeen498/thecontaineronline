"use server";

import { getCart, getVariantPricing } from "@/lib/shopifyQueries";
import { createDraftOrder } from "@/lib/shopifyAdmin";

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

// ─── createHypPayment ─────────────────────────────────────────
// Called from the cart drawer with the Shopify cart ID only.
// The server loads the cart, prices it, records a pending Shopify
// draft order, and returns a signed Hyp payment page URL.
export async function createHypPayment({ cartId, language }) {
  try {
    if (typeof cartId !== "string" || !cartId.startsWith("gid://shopify/Cart/")) {
      return { success: false, error: "invalid_cart" };
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
    const draftOrder = await createDraftOrder({
      lines,
      attributes: [
        { key: "hyp_amount", value: String(amount) },
        { key: "hyp_currency", value: currency },
        { key: "language", value: isHebrew ? "Hebrew" : "English" },
      ],
      note: `Awaiting Hyp payment: ${amount} ${currency}`,
    });
    const orderId = draftOrder.id.split("/").pop();

    // ─── Ask Hyp to sign the payment request ───────────────
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
      SuccessUrl: `${SITE_URL}/checkout/success`,
      ErrorUrl: `${SITE_URL}/checkout/success`,
    });

    const response = await fetch(`${HYP_BASE_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    const responseText = (await response.text()).trim();

    const signed = new URLSearchParams(responseText);
    if (!response.ok || (signed.has("CCode") && signed.get("CCode") !== "0")) {
      console.error("Hyp sign failed:", response.status, signed.get("CCode"));
      return { success: false, error: "payment_unavailable" };
    }

    return { success: true, paymentUrl: `${HYP_BASE_URL}?${responseText}` };
  } catch (error) {
    console.error("Checkout error:", error.message);
    return { success: false, error: "checkout_failed" };
  }
}
