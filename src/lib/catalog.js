// ─── Cached catalog (server only) ─────────────────────────────
// Product data is reused for 60 seconds instead of being fetched
// from Shopify on every page view. Stock is still checked live by
// Shopify when adding to the cart and at checkout.
import { unstable_cache } from "next/cache";
import {
  getAllProducts as fetchAllProducts,
  getArtProducts as fetchArtProducts,
  getFashionProducts as fetchFashionProducts,
  getProductByHandle as fetchProductByHandle,
} from "./shopifyQueries";

const options = { revalidate: 60, tags: ["products"] };

export const getAllProducts = unstable_cache(fetchAllProducts, ["all-products"], options);
export const getArtProducts = unstable_cache(fetchArtProducts, ["art-products"], options);
export const getFashionProducts = unstable_cache(fetchFashionProducts, ["fashion-products"], options);
export const getProductByHandle = unstable_cache(fetchProductByHandle, ["product-by-handle"], options);
