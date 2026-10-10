import { Belleza, Assistant, Titillium_Web } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Footer from "@/components/shared/Footer/Footer";
import CookieConsent from "@/components/shared/CookieConsent/CookieConsent";
import CartDrawer from "@/components/cart/CartDrawer/CartDrawer";
import HtmlAttributes from "@/components/shared/HtmlAttributes/HtmlAttributes";
import ScrollToTop from "@/components/shared/ScrollToTop/ScrollToTop";
import AnchorScroll from "@/components/shared/AnchorScroll/AnchorScroll";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import LanguageGate from "@/components/selectLanguage/LanguageGate";
import TopBar from "@/components/shared/Nav/TopBar";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script"; // accessibility
import "@/styles/globals.scss";

// ─── Font Setup ───────────────────────────────────────────────
const belleza = Belleza({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-headers",
  display: "swap",
});

const assistant = Assistant({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "hebrew"],
  variable: "--font-body",
  display: "swap",
});

const titilliumWeb = Titillium_Web({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  variable: "--font-nav",
  display: "swap",
});

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: {
    default: "The Container | Art & Fashion",
    template: "%s | The Container",
  },
  description:
    "The Container — a unique studio for handmade ceramic art and authentic luxury fashion. Based in Israel.",
  keywords: [
    "art",
    "fashion",
    "ceramic",
    "luxury",
    "Israel",
    "handmade",
    "אמנות",
    "אופנה",
  ],
  openGraph: {
    title: "The Container | Art & Fashion",
    description:
      "A unique studio for handmade ceramic art and authentic luxury fashion.",
    url: "https://thecontaineronline.com",
    siteName: "The Container",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://thecontaineronline.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Root Layout ──────────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${belleza.variable} ${assistant.variable} ${titilliumWeb.variable}`}
    >
      <body>
        <LanguageProvider>
          <HtmlAttributes />
          <ScrollToTop />
          <AnchorScroll />
          <CartProvider>
            <CustomerProvider>
              <LanguageGate>
                <TopBar />
                <main className="main-content">{children}</main>
                <Footer />
                <CookieConsent />
                <CartDrawer />
              </LanguageGate>
            </CustomerProvider>
          </CartProvider>
        </LanguageProvider>
        <Analytics />
        <Script
          src={`https://negishot.co.il/cdn/widget.php?code=${process.env.NEXT_PUBLIC_NEGISHOT_CODE}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
