import { getProductByHandle, getAllProducts } from '@/lib/shopifyQueries';
import ItemPage from '@/components/item/ItemPage/ItemPage';
import { notFound } from 'next/navigation';

// ─── Dynamic Metadata ─────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.englishName,
    description: product.englishDescription || `${product.englishName} — available at The Container.`,
    openGraph: {
      title: `${product.englishName} | The Container`,
      description: product.englishDescription || `${product.englishName} — available at The Container.`,
      url: `https://thecontaineronline.com/item/${handle}`,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

// ─── Item Route ───────────────────────────────────────────────
export default async function ItemRoute({ params }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  const allProducts = await getAllProducts();
  const relatedProducts = allProducts.filter(p =>
    p.categoryEnglish === product.categoryEnglish &&
    p.handle !== product.handle
  );

  return <ItemPage product={product} relatedProducts={relatedProducts} />;
}