import LoginPage from '@/components/account/LoginPage/LoginPage';

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: 'Login',
  description: 'Login to your account at The Container.',
  robots: {
    index: false,
    follow: false,
  },
};

// ─── Login Route ──────────────────────────────────────────────
export default function LoginRoute() {
  return <LoginPage />;
}