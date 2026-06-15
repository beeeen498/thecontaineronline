import { getAllProducts } from "@/lib/shopifyQueries";
import ArtStorePage from "@/components/store/ArtStorePage/ArtStorePage";

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: "Art",
  description:
    "Handmade ceramic art — vases, cups, bowls, plates, ashtrays and more. Each piece crafted with passion and attention to detail.",
  openGraph: {
    title: "Art | The Container",
    description: "Handmade ceramic art — vases, cups, bowls, plates and more.",
    url: "https://thecontaineronline.com/art",
  },
};

// ─── Art Route ────────────────────────────────────────────────
// Server component — fetches all products from Shopify
// Passes them to the client ArtStorePage for filtering

export default async function ArtRoute() {
  const allProducts = await getAllProducts();
  const artProducts = allProducts.filter((p) => p.typeOfItem === "art");
  return <ArtStorePage products={artProducts} />;
}
