import CheckoutPage from "@/components/checkout/CheckoutPage/CheckoutPage";

// ─── Metadata ─────────────────────────────────────────────────
export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

// ─── Checkout Route ───────────────────────────────────────────
export default function CheckoutRoute() {
  return <CheckoutPage />;
}
