import { getProductByHandle, getAllProducts } from '@/lib/shopifyQueries';
import ItemPage from '@/components/item/ItemPage/ItemPage';
import { notFound } from 'next/navigation';
import Script from 'next/script';

// ─── Revalidate ───────────────────────────────────────────────
// Always fetch fresh data from Shopify, never cache
export const revalidate = 0;

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

  // ─── JSON-LD ────────────────────────────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.englishName,
    description: product.englishDescription,
    image: product.images || [],
    brand: {
      '@type': 'Brand',
      name: product.brand || 'The Container',
    },
    offers: {
      '@type': 'Offer',
      url: `https://thecontaineronline.com/item/${product.handle}`,
      priceCurrency: 'USD',
      price: product.globalPrice,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'The Container',
      },
    },
  };

  return (
    <>
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ItemPage product={product} relatedProducts={relatedProducts} />
    </>
  );
}