// ─── Shopify Admin API ────────────────────────────────────────
// Server-side only — never import this in client components
// Uses Admin API token to update inventory after payment

const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

// ─── Decrease inventory by quantity ───────────────────────────
// variantId: Shopify variant gid (e.g. gid://shopify/ProductVariant/123)
// quantity: how many to decrease (usually 1)
export async function decreaseInventory(variantId, quantity = 1) {
  // ─── Step 1: Get inventory item ID from variant ──────────
  const variantResponse = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/2025-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({
        query: `{
          productVariant(id: "${variantId}") {
            inventoryItem {
              id
              inventoryLevels(first: 1) {
                edges {
                  node {
                    id
                    location {
                      id
                    }
                    quantities(names: ["available"]) {
                      name
                      quantity
                    }
                  }
                }
              }
            }
          }
        }`,
      }),
    }
  );

  const variantData = await variantResponse.json();
  const inventoryItem = variantData.data?.productVariant?.inventoryItem;
  const inventoryLevel = inventoryItem?.inventoryLevels?.edges?.[0]?.node;

  if (!inventoryLevel) {
    console.error('Could not find inventory level for variant:', variantId);
    return { success: false, error: 'Inventory level not found' };
  }

  const inventoryItemId = inventoryItem.id;
  const locationId = inventoryLevel.location.id;
  const currentQuantity = inventoryLevel.quantities?.[0]?.quantity ?? 0;

  if (currentQuantity <= 0) {
    return { success: false, error: 'Item already out of stock' };
  }

  // ─── Step 2: Adjust inventory quantity ───────────────────
  const adjustResponse = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/2025-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify({
        query: `
          mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
            inventoryAdjustQuantities(input: $input) {
              userErrors {
                field
                message
              }
              inventoryAdjustmentGroup {
                createdAt
                reason
                changes {
                  name
                  delta
                }
              }
            }
          }
        `,
        variables: {
          input: {
            reason: 'correction',
            name: 'available',
            changes: [
              {
                inventoryItemId,
                locationId,
                delta: -quantity,
              },
            ],
          },
        },
      }),
    }
  );

  const adjustData = await adjustResponse.json();
  const userErrors = adjustData.data?.inventoryAdjustQuantities?.userErrors;

  if (userErrors?.length > 0) {
    console.error('Inventory adjust errors:', userErrors);
    return { success: false, error: userErrors[0].message };
  }

  return { success: true };
}