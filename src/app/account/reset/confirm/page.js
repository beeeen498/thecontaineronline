import ConfirmResetPage from '@/components/account/ConfirmResetPage/ConfirmResetPage';

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: 'Reset Password',
  description: 'Set your new password at The Container.',
  robots: {
    index: false,
    follow: false,
  },
};

// ─── Confirm Reset Route ──────────────────────────────────────
export default function ConfirmResetRoute() {
  return <ConfirmResetPage />;
}