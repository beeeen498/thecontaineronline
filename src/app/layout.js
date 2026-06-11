import { Belleza, Assistant, Titillium_Web } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Nav/Header";
import Nav from "@/components/Nav/Nav";
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
          {/* Fixed top bar — Header + Nav stacked together */}
          <div className="top-bar">
            <Header />
            <Nav />
          </div>

          {/* Page content pushed below the fixed top bar */}
          <main className="main-content">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
