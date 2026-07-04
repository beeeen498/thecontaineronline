import AccountPage from '@/components/account/AccountPage/AccountPage';

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: 'My Account',
  description: 'Manage your account at The Container.',
  robots: {
    index: false,
    follow: false,
  },
};

// ─── Account Route ────────────────────────────────────────────
export default function AccountRoute() {
  return <AccountPage />;
}