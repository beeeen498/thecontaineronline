import PrivacyPolicy from '@/components/privacy/PrivacyPolicy';

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for The Container',
};

// ─── Privacy Route ────────────────────────────────────────────
export default function PrivacyRoute() {
  return <PrivacyPolicy />;
}