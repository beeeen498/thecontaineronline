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
  // ─── Read variant options ──────────────────────────────────
  const variants = node.variants?.edges?.map(({ node }) => node) || [];
  const allOptions = variants.flatMap((v) => v.selectedOptions || []);

  const getOption = (name) =>
    allOptions.find((o) => o.name.toLowerCase() === name.toLowerCase())?.value;

  const getAllOptions = (name) => [
    ...new Set(
      allOptions
        .filter((o) => o.name.toLowerCase() === name.toLowerCase())
        .map((o) => o.value),
    ),
  ];

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
    colorsEnglish: getAllOptions("colorenglish"),
    colorsHebrew: getAllOptions("colorhebrew"),
    englishSize: getOption("size"),
    hebrewSize: getOption("size"),
    englishCondition: meta.englishcondition,
    hebrewCondition: meta.hebrewcondition,
    images: node.images.edges.map(({ node }) => node.url),
    brand: meta.brand || node.vendor,
    inStock: meta.instock?.toLowerCase() !== "false",
    variants: variants.map((v) => ({
      id: v.id,
      options: v.selectedOptions,
    })),
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
    { namespace: "custom", key: "englishcondition" },
    { namespace: "custom", key: "hebrewcondition" },
    { namespace: "custom", key: "instock" },
    { namespace: "custom", key: "brand" }
  ]) {
    key
    value
  }
`;

// ─── Variants query ───────────────────────────────────────────
const VARIANTS_QUERY = `
  variants(first: 10) {
    edges {
      node {
        id
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

// ─── getAllProducts ───────────────────────────────────────────
export const getAllProducts = async () => {
  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  // ─── Fetch all products in batches of 50 ──────────────
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
    console.log(
      "subcategory raw:",
      data.products.edges
        .find((e) => e.node.metafields.find((m) => m?.key === "subcategory"))
        ?.node.metafields.find((m) => m?.key === "subcategory"),
    );
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
