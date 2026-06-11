import { getAllProducts } from '@/lib/shopifyQueries';

export default async function Home() {
  const products = await getAllProducts();

  return (
    <main>
      <h1>The Container</h1>
      <p>Products found: {products.length}</p>
    </main>
  );
}