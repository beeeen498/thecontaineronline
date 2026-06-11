import { getAllProducts } from "@/lib/shopifyQueries";
import FashionStorePage from "@/components/store/FashionStorePage/FashionStorePage";

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: "Fashion",
  description:
    "Authentic luxury fashion — bags, shoes, belts, wallets and more.",
};

// ─── Fashion Route ────────────────────────────────────────────
export default async function FashionRoute() {
  const allProducts = await getAllProducts();

  // temporary — until typeOfItem metafield is set in Shopify
  const fashionProducts = allProducts.slice(25);

  return <FashionStorePage products={fashionProducts} />;
}
