import { Belleza, Assistant } from 'next/font/google';
import '@/styles/globals.scss';

// ─── Font Setup ───────────────────────────────────────────────
const belleza = Belleza({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-headers',
  display: 'swap',
});

const assistant = Assistant({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  subsets: ['latin', 'hebrew'],
  variable: '--font-body',
  display: 'swap',
});

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: {
    default: 'The Container',
    template: '%s | The Container',
  },
  description: 'Art and fashion store',
};

// ─── Root Layout ──────────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${belleza.variable} ${assistant.variable}`}>
      <body>{children}</body>
    </html>
  );
}