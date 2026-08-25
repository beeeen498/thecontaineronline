"use server";

import { decreaseInventory } from "@/lib/shopifyAdmin";

const HYP_BASE_URL = "https://pay.hyp.co.il/p/";
const TERMINAL = process.env.HYP_TERMINAL_NUMBER;
const API_KEY = process.env.HYP_API_KEY;
const PASS_P = process.env.HYP_PASS_P;

// ─── Verify payment with Hyp Pay ──────────────────────────────
// Sends VERIFY request to confirm payment is genuine
// Returns true if payment is valid

export async function verifyHypPayment(searchParamsObj) {
  try {
    const params = new URLSearchParams({
      action: "APISign",
      What: "VERIFY",
      Masof: TERMINAL,
      KEY: API_KEY,
      PassP: PASS_P,
      ...searchParamsObj,
    });

    const response = await fetch(`${HYP_BASE_URL}?${params.toString()}`);
    const text = await response.text();

    // ─── Hyp returns CCode=0 for valid payment ─────────
    return text.includes("CCode=0");
  } catch (error) {
    console.error("Verify error:", error);
    return false;
  }
}

// ─── Update Shopify inventory after successful payment ────────
export async function updateInventoryAfterPayment(cartLines) {
  const results = await Promise.all(
    cartLines.map(({ variantId, quantity }) =>
      decreaseInventory(variantId, quantity),
    ),
  );
  return results;
}
