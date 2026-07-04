// ─── Shopify Queries ──────────────────────────────────────────
import client from "./shopify";

// ─── Helper — parse metafields into a key/value object ────────
function parseMeta(metafields) {
  const meta = {};
  metafields?.forEach((mf) => {
    if (mf) meta[mf.key] = mf.value;
  });
  return meta;
}

// ─── Helper — build product object from node + meta ───────────
function buildProduct(node, meta) {
  const variants = node.variants?.edges?.map(({ node }) => node) || [];
  const firstVariant = variants[0];
  const firstVariantId = firstVariant?.id || null;
  const quantityAvailable = firstVariant?.quantityAvailable ?? 0;

  return {
    id: node.id,
    handle: node.handle,
    englishName: node.title,
    hebrewName: meta.hebrewname,
    englishDescription: meta.englishdescription || node.description,
    hebrewDescription: meta.hebrewdescription,
    globalPrice: (() => {
      try {
        const parsed = JSON.parse(meta.globalprice);
        return parsed?.amount ? Math.round(parseFloat(parsed.amount)) : null;
      } catch {
        return meta.globalprice
          ? Math.round(parseFloat(meta.globalprice))
          : null;
      }
    })(),
    israelPrice: Math.round(parseFloat(node.priceRange.minVariantPrice.amount)),
    categoryEnglish: meta.subcategoryenglish || meta.productcategory,
    categoryHebrew: meta.subcategoryhebrew || meta.productcategory,
    typeOfItem:
      meta.productcategory?.toLowerCase() === "fashion" ? "fashion" : "art",
    numOfItems: meta.numofitems,
    colorsEnglish:
      meta.colorenglish
        ?.split(",")
        .map((c) => c.trim())
        .filter(Boolean) || [],
    colorsHebrew:
      meta.colorhebrew
        ?.split(",")
        .map((c) => c.trim())
        .filter(Boolean) || [],
    englishSize: meta.size,
    hebrewSize: meta.size,
    englishCondition: meta.englishcondition,
    hebrewCondition: meta.hebrewcondition,
    englishNotice: meta.englishnotice,
    hebrewNotice: meta.hebrewnotice,
    images: node.images.edges.map(({ node }) => node.url),
    brand: meta.brand || node.vendor,
    variantId: firstVariantId,
    quantityAvailable,
    inStock: meta.instock?.toLowerCase() !== "false" && quantityAvailable > 0,
  };
}

// ─── Metafield identifiers ────────────────────────────────────
const METAFIELD_IDENTIFIERS = `
  metafields(identifiers: [
    { namespace: "custom", key: "hebrewname" },
    { namespace: "custom", key: "hebrewdescription" },
    { namespace: "custom", key: "englishdescription" },
    { namespace: "custom", key: "globalprice" },
    { namespace: "custom", key: "productcategory" },
    { namespace: "custom", key: "subcategoryenglish" },
    { namespace: "custom", key: "subcategoryhebrew" },
    { namespace: "custom", key: "numofitems" },
    { namespace: "custom", key: "colorenglish" },
    { namespace: "custom", key: "colorhebrew" },
    { namespace: "custom", key: "size" },
    { namespace: "custom", key: "englishcondition" },
    { namespace: "custom", key: "hebrewcondition" },
    { namespace: "custom", key: "englishnotice" },
    { namespace: "custom", key: "hebrewnotice" },
    { namespace: "custom", key: "instock" },
    { namespace: "custom", key: "brand" }
  ]) {
    key
    value
  }
`;

// ─── Variants query ─────────────────────────────────────────────
const VARIANTS_QUERY = `
  variants(first: 1) {
    edges {
      node {
        id
        quantityAvailable
      }
    }
  }
`;

// ─── getAllProducts ───────────────────────────────────────────
export const getAllProducts = async () => {
  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const { data } = await client.request(`{
      products(first: 50${cursor ? `, after: "${cursor}"` : ""}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            handle
            title
            productType
            vendor
            description
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                }
              }
            }
            ${METAFIELD_IDENTIFIERS}
            ${VARIANTS_QUERY}
          }
        }
      }
    }`);

    const { edges, pageInfo } = data.products;
    edges.forEach(({ node }) => {
      const meta = parseMeta(node.metafields);
      allProducts.push(buildProduct(node, meta));
    });

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return allProducts;
};

// ─── getArtProducts ───────────────────────────────────────────
export const getArtProducts = async () => {
  const allProducts = await getAllProducts();
  return allProducts.filter((item) => item.typeOfItem === "art");
};

// ─── getFashionProducts ───────────────────────────────────────
export const getFashionProducts = async () => {
  const allProducts = await getAllProducts();
  return allProducts.filter((item) => item.typeOfItem === "fashion");
};

// ─── getProductByHandle ───────────────────────────────────────
export const getProductByHandle = async (handle) => {
  const { data } = await client.request(`{
    productByHandle(handle: "${handle}") {
      id
      handle
      title
      productType
      vendor
      description
      priceRange {
        minVariantPrice {
          amount
        }
      }
      images(first: 10) {
        edges {
          node {
            url
          }
        }
      }
      ${METAFIELD_IDENTIFIERS}
      ${VARIANTS_QUERY}
    }
  }`);

  if (!data.productByHandle) return null;

  const node = data.productByHandle;
  const meta = parseMeta(node.metafields);
  return buildProduct(node, meta);
};

// ─── Shared cart line fields (kept identical everywhere) ──────
const CART_LINE_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        attributes {
          key
          value
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            product {
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
  cost {
    totalAmount {
      amount
      currencyCode
    }
  }
`;

// ─── Cart Mutations ────────────────────────────────────────────

// ─── Create a new cart with one item ──────────────────────────
export const createCart = async (variantId, quantity = 1, attributes = []) => {
  const { data } = await client.request(
    `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          ${CART_LINE_FIELDS}
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity, attributes }],
        },
      },
    },
  );

  return data.cartCreate.cart;
};

// ─── Add a line item to an existing cart ──────────────────────
export const addCartLine = async (
  cartId,
  variantId,
  quantity = 1,
  attributes = [],
) => {
  const { data } = await client.request(
    `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_LINE_FIELDS}
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        cartId,
        lines: [{ merchandiseId: variantId, quantity, attributes }],
      },
    },
  );

  return data.cartLinesAdd.cart;
};

// ─── Update line item quantity ─────────────────────────────────
export const updateCartLine = async (cartId, lineId, quantity) => {
  const { data } = await client.request(
    `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_LINE_FIELDS}
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        cartId,
        lines: [{ id: lineId, quantity }],
      },
    },
  );

  return data.cartLinesUpdate.cart;
};

// ─── Remove a line item ────────────────────────────────────────
export const removeCartLine = async (cartId, lineId) => {
  const { data } = await client.request(
    `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_LINE_FIELDS}
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        cartId,
        lineIds: [lineId],
      },
    },
  );

  return data.cartLinesRemove.cart;
};

// ─── Fetch existing cart by ID ─────────────────────────────────
export const getCart = async (cartId) => {
  const { data } = await client.request(
    `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        ${CART_LINE_FIELDS}
      }
    }
  `,
    {
      variables: { cartId },
    },
  );

  return data.cart;
};

// ─── Customer Mutations ────────────────────────────────────────

// ─── Register ─────────────────────────────────────────────────
export const customerCreate = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  const { data } = await client.request(
    `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          firstName
          lastName
          email
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        input: { firstName, lastName, email, password },
      },
    },
  );

  return data.customerCreate;
};

// ─── Login ────────────────────────────────────────────────────
export const customerAccessTokenCreate = async ({ email, password }) => {
  const { data } = await client.request(
    `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        input: { email, password },
      },
    },
  );

  return data.customerAccessTokenCreate;
};

// ─── Logout ───────────────────────────────────────────────────
export const customerAccessTokenDelete = async (accessToken) => {
  const { data } = await client.request(
    `
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: { customerAccessToken: accessToken },
    },
  );

  return data.customerAccessTokenDelete;
};

// ─── Get Customer ─────────────────────────────────────────────
export const getCustomer = async (accessToken) => {
  const { data } = await client.request(
    `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
        createdAt
        orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              currentTotalPrice {
                amount
                currencyCode
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
    {
      variables: { customerAccessToken: accessToken },
    },
  );

  return data.customer;
};

// ─── Delete Account ───────────────────────────────────────────
export const customerDelete = async (customerId, accessToken) => {
  const { data } = await client.request(
    `
    mutation customerDelete($id: ID!, $customerAccessToken: String!) {
      customerDelete(id: $id, customerAccessToken: $customerAccessToken) {
        deletedCustomerId
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        id: customerId,
        customerAccessToken: accessToken,
      },
    },
  );

  return data.customerDelete;
};
