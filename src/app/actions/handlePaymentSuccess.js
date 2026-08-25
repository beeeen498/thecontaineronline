"use server";

import { decreaseInventory } from "@/lib/shopifyAdmin";

// ─── Update Shopify inventory after successful payment ────────
// Called from SuccessPage after Hyp Pay confirms payment
// cartLines: [{ variantId, quantity }]

export async function updateInventoryAfterPayment(cartLines) {
  const results = await Promise.all(
    cartLines.map(({ variantId, quantity }) =>
      decreaseInventory(variantId, quantity),
    ),
  );

  return results;
}
