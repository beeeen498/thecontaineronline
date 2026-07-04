import RegisterPage from '@/components/account/RegisterPage/RegisterPage';

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: 'Register',
  description: 'Create an account at The Container.',
  robots: {
    index: false,
    follow: false,
  },
};

// ─── Register Route ───────────────────────────────────────────
export default function RegisterRoute() {
  return <RegisterPage />;
}