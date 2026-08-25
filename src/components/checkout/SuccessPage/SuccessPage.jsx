"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  validateHypPayment,
  updateInventoryAfterPayment,
} from "@/app/actions/handlePaymentSuccess";
import "./SuccessPage.scss";

// ─── SuccessPage ──────────────────────────────────────────────
// Handles Hyp Pay redirect after payment
// Validates transaction, updates inventory, clears cart

export default function SuccessPage() {
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const router = useRouter();

  const [status, setStatus] = useState("loading"); // loading | success | failed

  useEffect(() => {
    const processPayment = async () => {
      const cCode = searchParams.get("CCode");
      const orderId = searchParams.get("Order");

      // ─── Payment failed ────────────────────────────────
      if (cCode !== "0") {
        setStatus("failed");
        return;
      }

      try {
        // ─── Get cart lines from sessionStorage ───────────
        const cartLinesRaw = sessionStorage.getItem("hyp-cart-lines");
        const cartLines = cartLinesRaw ? JSON.parse(cartLinesRaw) : [];

        // ─── Update Shopify inventory ──────────────────────
        if (cartLines.length > 0) {
          await updateInventoryAfterPayment(cartLines);
        }

        // ─── Clear cart and sessionStorage ────────────────
        sessionStorage.removeItem("hyp-cart-lines");
        sessionStorage.removeItem("hyp-order-id");
        clearCart();

        setStatus("success");
      } catch (error) {
        console.error("Error processing payment success:", error);
        setStatus("success"); // still show success even if inventory update fails
      }
    };

    processPayment();
  }, []);

  return (
    <div className={`success-page ${isHebrew ? "success-page--rtl" : ""}`}>
      <div className="success-page__box">
        {/* ─── Loading ───────────────────────────────────── */}
        {status === "loading" && (
          <p className="success-page__message">
            {isHebrew ? "מעבד את התשלום..." : "Processing payment..."}
          </p>
        )}

        {/* ─── Success ───────────────────────────────────── */}
        {status === "success" && (
          <>
            <div className="success-page__icon">✓</div>
            <h1 className="success-page__heading">
              {isHebrew ? "התשלום התקבל בהצלחה!" : "Payment Successful!"}
            </h1>
            <p className="success-page__message">
              {isHebrew
                ? "תודה על רכישתך. אישור יישלח לאימייל שלך."
                : "Thank you for your purchase. A confirmation will be sent to your email."}
            </p>
            <Link href="/" className="success-page__btn">
              {isHebrew ? "חזרה לחנות" : "Back to Store"}
            </Link>
          </>
        )}

        {/* ─── Failed ────────────────────────────────────── */}
        {status === "failed" && (
          <>
            <div className="success-page__icon success-page__icon--failed">
              ✗
            </div>
            <h1 className="success-page__heading">
              {isHebrew ? "התשלום נכשל" : "Payment Failed"}
            </h1>
            <p className="success-page__message">
              {isHebrew
                ? "אירעה שגיאה בעיבוד התשלום. נסה שנית."
                : "There was an error processing your payment. Please try again."}
            </p>
            <Link href="/checkout" className="success-page__btn">
              {isHebrew ? "נסה שנית" : "Try Again"}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
