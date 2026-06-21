import { getAllProducts } from "@/lib/shopifyQueries";
import FashionStorePage from "@/components/store/FashionStorePage/FashionStorePage";

// ─── Revalidate ───────────────────────────────────────────────
// Always fetch fresh data from Shopify, never cache
export const revalidate = 0;

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: "Fashion",
  description:
    "Authentic luxury fashion — bags, shoes, belts, wallets, shirts and more. New and second-hand items from leading designers.",
  openGraph: {
    title: "Fashion | The Container",
    description: "Authentic luxury fashion from leading designers.",
    url: "https://thecontaineronline.com/fashion",
  },
};

// ─── Fashion Route ────────────────────────────────────────────
export default async function FashionRoute() {
  const allProducts = await getAllProducts();
  const fashionProducts = allProducts.filter((p) => p.typeOfItem === "fashion");
  return <FashionStorePage products={fashionProducts} />;
}
