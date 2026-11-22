"use server";

import { getDraftOrder, completeDraftOrder } from "@/lib/shopifyAdmin";

const HYP_BASE_URL = "https://pay.hyp.co.il/p/";
const TERMINAL = process.env.HYP_TERMINAL_NUMBER;
const API_KEY = process.env.HYP_API_KEY;
const PASS_P = process.env.HYP_PASS_P;

// Params we set ourselves — never taken from the redirect URL
const RESERVED_PARAMS = new Set(["action", "What", "Masof", "KEY", "PassP"]);

// ─── Verify payment with Hyp Pay (not exported) ───────────────
// Sends the redirect params back to Hyp. Hyp checks the signature,
// so Amount/Order/CCode in the URL cannot be tampered with.
async function verifyWithHyp(redirectParams) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(redirectParams)) {
    if (!RESERVED_PARAMS.has(key)) params.set(key, String(value));
  }
  params.set("action", "APISign");
  params.set("What", "VERIFY");
  params.set("Masof", TERMINAL);
  params.set("KEY", API_KEY);
  params.set("PassP", PASS_P);

  const response = await fetch(`${HYP_BASE_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  if (!response.ok) return false;

  const result = new URLSearchParams((await response.text()).trim());
  return result.get("CCode") === "0";
}

// ─── confirmHypPayment ────────────────────────────────────────
// Called by the success page with the Hyp redirect params.
// 1. Hyp confirms the payment is genuine
// 2. The paid amount must match the pending Shopify draft order
// 3. The draft order is completed once → real order + inventory update
// Calling it again for the same order is harmless.
export async function confirmHypPayment(redirectParams) {
  try {
    if (!redirectParams || typeof redirectParams !== "object") {
      return { success: false };
    }

    const orderId = String(redirectParams.Order || "");
    if (redirectParams.CCode !== "0" || !/^\d+$/.test(orderId)) {
      return { success: false };
    }

    if (!(await verifyWithHyp(redirectParams))) {
      return { success: false };
    }

    // ─── Match payment to the stored order ─────────────────
    const draftOrderId = `gid://shopify/DraftOrder/${orderId}`;
    const draftOrder = await getDraftOrder(draftOrderId);
    if (!draftOrder) {
      console.error("Paid order not found:", orderId);
      return { success: false };
    }

    if (draftOrder.status === "COMPLETED") {
      return { success: true }; // already processed (page refresh)
    }

    const attrs = Object.fromEntries(
      draftOrder.customAttributes.map(({ key, value }) => [key, value]),
    );
    const expected = parseFloat(attrs.hyp_amount);
    const paid = parseFloat(redirectParams.Amount);
    if (!Number.isFinite(paid) || Math.abs(paid - expected) > 0.01) {
      console.error("Amount mismatch for order", orderId, { expected, paid });
      return { success: false };
    }

    // ─── Turn into a real Shopify order ────────────────────
    // Payment is genuine at this point, so the customer sees success
    // even if Shopify fails; the draft order stays open for follow-up.
    try {
      await completeDraftOrder(draftOrderId, {
        note: `Paid via Hyp: ${attrs.hyp_amount} ${attrs.hyp_currency} · transaction ${redirectParams.Id || "?"} · approval ${redirectParams.ACode || "?"}`,
      });
    } catch (error) {
      console.error("Could not complete paid order", orderId, error.message);
    }

    return { success: true };
  } catch (error) {
    console.error("Payment confirmation error:", error.message);
    return { success: false };
  }
}
