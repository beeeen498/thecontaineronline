import { Belleza, Assistant, Titillium_Web } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LANGUAGES, LANGUAGE_COOKIE } from "@/lib/language";
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
  // Base for relative URLs (canonical links, social preview images)
  metadataBase: new URL("https://thecontaineronline.com"),
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
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Root Layout ──────────────────────────────────────────────
// Language comes from the cookie so the first HTML is already in the
// visitor's language and direction. No cookie → English + picker.
export default async function RootLayout({ children }) {
  const saved = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  const initialLanguage = LANGUAGES.includes(saved) ? saved : null;
  const isHebrew = initialLanguage === "Hebrew";

  return (
    <html
      lang={isHebrew ? "he" : "en"}
      dir={isHebrew ? "rtl" : "ltr"}
      className={`${belleza.variable} ${assistant.variable} ${titilliumWeb.variable}`}
    >
      <body>
        <LanguageProvider initialLanguage={initialLanguage}>
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
          src="https://negishot.co.il/cdn/widget.php?code=NGS_BED41AC79FEC"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
