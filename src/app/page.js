import HomePage from '@/components/home/HomePage/HomePage';

// ─── Metadata ─────────────────────────────────────────────────
// Each page sets its own canonical URL (relative to metadataBase).
export const metadata = {
  alternates: { canonical: '/' },
};

export default function HomeRoute() {
  return <HomePage />;
}