import HomePage from '@/components/home/HomePage/HomePage';

// ─── Revalidate ───────────────────────────────────────────────
// Always fetch fresh data from Shopify, never cache
export const revalidate = 0;

export default function HomeRoute() {
  return <HomePage />;
}