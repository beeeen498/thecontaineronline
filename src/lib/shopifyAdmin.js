// ─── Shopify Admin API ────────────────────────────────────────
// Server-side only — never import this in client components.
// Used by checkout to record orders as Shopify draft orders.
// Completing a draft order creates a real Shopify order and lets
// Shopify decrease inventory itself.
//
// Required Admin API scopes: read_draft_orders, write_draft_orders,
// write_customers (account deletion)

const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const ADMIN_API_VERSION = "2026-01";

// ─── Low-level request helper ─────────────────────────────────
// Throws on HTTP errors and top-level GraphQL errors so failures
// are never silently ignored.
async function adminRequest(query, variables = {}) {
  if (!SHOPIFY_STORE || !ADMIN_TOKEN) {
    throw new Error("Shopify Admin API is not configured");
  }

  const response = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Shopify Admin API HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(`Shopify Admin API: ${json.errors[0].message}`);
  }
  return json.data;
}

function throwOnUserErrors(userErrors) {
  if (userErrors?.length) {
    throw new Error(`Shopify Admin API: ${userErrors[0].message}`);
  }
}

// ─── Create a pending draft order for a checkout ──────────────
// lines: [{ variantId, quantity }]
// attributes: [{ key, value }] — stored on the draft order
// details: validated checkout details (see src/lib/checkoutDetails.js)
// customerId: Shopify customer GID when the shopper is logged in
// Inventory is NOT reserved: anyone can start a checkout, so reserving
// would let visitors make items look sold out without paying.
export async function createDraftOrder({ lines, attributes, note, details, customerId }) {
  const input = {
    lineItems: lines.map(({ variantId, quantity }) => ({
      variantId,
      quantity,
    })),
    customAttributes: attributes,
    note,
    tags: ["hyp-pending"],
    // Shop prices don't include tax, and Shopify would add VAT on top
    // once an address is set. The customer pays exactly the listed
    // price through Hyp, so the order total must match it.
    taxExempt: true,
    shippingLine: {
      title: "Free shipping",
      priceWithCurrency: { amount: "0", currencyCode: "ILS" },
    },
  };

  if (details) {
    // A state/region that looks like a code (NY, ON, NSW) goes in
    // provinceCode; Shopify silently drops codes it doesn't know, so
    // anything else is added to the city line to keep it on the label.
    const regionIsCode = /^[A-Za-z]{2,3}$/.test(details.region);
    input.email = details.email;
    input.shippingAddress = {
      firstName: details.firstName,
      lastName: details.lastName,
      address1: details.address1,
      address2: details.address2 || undefined,
      city:
        details.region && !regionIsCode
          ? `${details.city}, ${details.region}`
          : details.city,
      provinceCode: regionIsCode ? details.region.toUpperCase() : undefined,
      zip: details.zip || undefined,
      countryCode: details.country,
      // Phone goes on the address only: the order-level phone field
      // rejects local formats like 050-1234567.
      phone: details.phone,
    };
  }
  if (customerId) input.purchasingEntity = { customerId };

  const data = await adminRequest(
    `mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder { id }
        userErrors { field message }
      }
    }`,
    { input },
  );

  throwOnUserErrors(data.draftOrderCreate.userErrors);
  return data.draftOrderCreate.draftOrder;
}

// ─── Fetch a draft order ──────────────────────────────────────
export async function getDraftOrder(id) {
  const data = await adminRequest(
    `query draftOrder($id: ID!) {
      draftOrder(id: $id) {
        id
        status
        customAttributes { key value }
      }
    }`,
    { id },
  );
  return data.draftOrder;
}

// ─── Mark a draft order as paid and turn it into an order ─────
export async function completeDraftOrder(id, { note }) {
  const updated = await adminRequest(
    `mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
      draftOrderUpdate(id: $id, input: $input) {
        draftOrder { id }
        userErrors { field message }
      }
    }`,
    { id, input: { note, tags: ["hyp-paid"] } },
  );
  throwOnUserErrors(updated.draftOrderUpdate.userErrors);

  const data = await adminRequest(
    `mutation draftOrderComplete($id: ID!) {
      draftOrderComplete(id: $id) {
        draftOrder { id status order { id name } }
        userErrors { field message }
      }
    }`,
    { id },
  );

  throwOnUserErrors(data.draftOrderComplete.userErrors);
  return data.draftOrderComplete.draftOrder;
}

// ─── Delete a customer ────────────────────────────────────────
// Shopify refuses when the customer has orders; the caller then
// falls back to a deletion request. Returns { deleted, error }.
export async function deleteCustomer(customerId) {
  const data = await adminRequest(
    `mutation customerDelete($input: CustomerDeleteInput!) {
      customerDelete(input: $input) {
        deletedCustomerId
        userErrors { field message }
      }
    }`,
    { input: { id: customerId } },
  );
  const result = data.customerDelete;
  return {
    deleted: Boolean(result.deletedCustomerId),
    error: result.userErrors?.[0]?.message || null,
  };
}
