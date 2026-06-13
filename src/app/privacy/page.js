import PrivacyPolicy from "@/components/privacy/PrivacyPolicy";

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for The Container — how we collect, use and protect your data.",
  robots: {
    index: false,
    follow: false,
  },
};

// ─── Privacy Route ────────────────────────────────────────────
export default function PrivacyRoute() {
  return <PrivacyPolicy />;
}
