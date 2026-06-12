import { getProductByHandle, getAllProducts } from '@/lib/shopifyQueries';
import ItemPage from '@/components/item/ItemPage/ItemPage';
import { notFound } from 'next/navigation';

// ─── Item Route ───────────────────────────────────────────────
export default async function ItemRoute({ params }) {
  const { handle } = await params;

  const product = await getProductByHandle(handle);

  if (!product) notFound();

  // ─── Related Products ─────────────────────────────────
  // fetch all products and filter by same category
  const allProducts = await getAllProducts();
  const relatedProducts = allProducts.filter(p =>
    p.categoryEnglish === product.categoryEnglish &&
    p.handle !== product.handle
  );

  return <ItemPage product={product} relatedProducts={relatedProducts} />;
}