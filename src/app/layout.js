import { Belleza, Assistant, Titillium_Web } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/shared/Nav/Header";
import Nav from "@/components/shared/Nav/Nav";
import Footer from "@/components/shared/Footer/Footer";
import CookieConsent from "@/components/shared/CookieConsent/CookieConsent";
import HtmlAttributes from "@/components/shared/HtmlAttributes/HtmlAttributes";
import ScrollToTop from "@/components/shared/ScrollToTop/ScrollToTop";
import AnchorScroll from "@/components/shared/AnchorScroll/AnchorScroll";
import LanguageGate from "@/components/selectLanguage/LanguageGate";
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
    default: "The Container",
    template: "%s | The Container",
  },
  description: "Art and fashion store",
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
          <LanguageGate>
            <div className="top-bar">
              <Header />
              <Nav />
            </div>
            <main className="main-content">{children}</main>
            <Footer />
            <CookieConsent />
          </LanguageGate>
        </LanguageProvider>
      </body>
    </html>
  );
}
