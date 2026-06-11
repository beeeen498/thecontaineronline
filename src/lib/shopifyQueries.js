// ─── Shopify Queries ──────────────────────────────────────────
// getAllProducts  → fetches all products with metafields
// getArtProducts  → filters by typeOfItem === 'art'
// getFashionProducts → filters by typeOfItem === 'fashion'

import client from './shopify';

export const getAllProducts = async () => {
  const { data } = await client.request(`{
    products(first: 50) {
      edges {
        node {
          id
          title
          productType
          vendor
          description
          priceRange {
            minVariantPrice {
              amount
            }
          }
          images(first: 5) {
            edges {
              node {
                url
              }
            }
          }
          metafields(identifiers: [
            { namespace: "custom", key: "hebrew_name" },
            { namespace: "custom", key: "hebrew_description" },
            { namespace: "custom", key: "israel_price" },
            { namespace: "custom", key: "category_english" },
            { namespace: "custom", key: "category_hebrew" },
            { namespace: "custom", key: "num_of_items" },
            { namespace: "custom", key: "type_of_item" },
            { namespace: "custom", key: "colors_english" },
            { namespace: "custom", key: "colors_hebrew" },
            { namespace: "custom", key: "english_size" },
            { namespace: "custom", key: "hebrew_size" },
            { namespace: "custom", key: "english_condition" },
            { namespace: "custom", key: "hebrew_condition" }
          ]) {
            key
            value
          }
        }
      }
    }
  }`);

  return data.products.edges.map(({ node }) => {
    const meta = {};
    node.metafields.forEach(mf => {
      if (mf) meta[mf.key] = mf.value;
    });

    return {
      id: node.id,
      englishName: node.title,
      hebrewName: meta.hebrew_name,
      englishDescription: node.description,
      hebrewDescription: meta.hebrew_description,
      globalPrice: node.priceRange.minVariantPrice.amount,
      israelPrice: meta.israel_price,
      categoryEnglish: meta.category_english,
      categoryHebrew: meta.category_hebrew,
      typeOfItem: meta.type_of_item,
      numOfItems: meta.num_of_items,
      colorsEnglish: meta.colors_english?.split(','),
      colorsHebrew: meta.colors_hebrew?.split(','),
      englishSize: meta.english_size,
      hebrewSize: meta.hebrew_size,
      englishCondition: meta.english_condition,
      hebrewCondition: meta.hebrew_condition,
      images: node.images.edges.map(({ node }) => node.url),
      brand: node.vendor,
      inStock: true,
    };
  });
};

export const getArtProducts = async () => {
  const allProducts = await getAllProducts();
  return allProducts.filter(item => item.typeOfItem === 'art');
};

export const getFashionProducts = async () => {
  const allProducts = await getAllProducts();
  return allProducts.filter(item => item.typeOfItem === 'fashion');
};