import TermsPage from '@/components/terms/TermsPage';

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and Cancellation Policy for The Container.',
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Terms Route ──────────────────────────────────────────────
export default function TermsRoute() {
  return <TermsPage />;
}