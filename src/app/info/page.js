import InfoPage from "@/components/info/InfoPage/InfoPage";

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: 'Info',
  description: 'Learn about the designers and brands that are being sold at The Container. Articles about art and fashion.',
  openGraph: {
    title: 'Info | The Container',
    description: 'Designers, brands, and articles about art and fashion.',
    url: 'https://thecontaineronline.com/info',
  },
};

// ─── Info Route ───────────────────────────────────────────────
export default function InfoRoute() {
  return <InfoPage />;
}