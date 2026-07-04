import ResetPage from '@/components/account/ResetPage/ResetPage';

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: 'Reset Password',
  description: 'Reset your password at The Container.',
  robots: {
    index: false,
    follow: false,
  },
};

// ─── Reset Route ──────────────────────────────────────────────
export default function ResetRoute() {
  return <ResetPage />;
}