import { getAllProducts } from '@/lib/shopifyQueries';
import FeaturedItemsClient from './FeaturedItemsClient.jsx';

// ─── Featured Items ───────────────────────────────────────────
// Server component — fetches products from Shopify
// Passes raw data to client component for language-aware display

export default async function FeaturedItems() {
  const allProducts = await getAllProducts();
  const artProducts = allProducts.filter(p => p.typeOfItem === 'art').slice(0, 3);
  const fashionProducts = allProducts.filter(p => p.typeOfItem === 'fashion').slice(0, 3);

  return (
    <FeaturedItemsClient
      artProducts={artProducts}
      fashionProducts={fashionProducts}
    />
  );
}