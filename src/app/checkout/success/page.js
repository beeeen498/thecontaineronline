import SuccessPage from "@/components/checkout/SuccessPage/SuccessPage";

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

// ─── Success Route ────────────────────────────────────────────
export default function SuccessRoute() {
  return <SuccessPage />;
}
