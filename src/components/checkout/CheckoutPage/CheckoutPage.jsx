"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { createHypPayment } from "@/app/actions/createHypPayment";
import "./CheckoutPage.scss";

// ─── CheckoutPage ─────────────────────────────────────────────
// Shows order summary and customer form
// Submits to Hyp Pay payment page

export default function CheckoutPage() {
  const { cart, products } = useCart();
  const { customer } = useCustomer();
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const router = useRouter();

  // ─── Pre-fill from customer account if logged in ──────
  const [firstName, setFirstName] = useState(customer?.firstName || "");
  const [lastName, setLastName] = useState(customer?.lastName || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const lines = cart?.lines?.edges || [];

  // ─── Calculate total based on language ────────────────────
  const total = lines.reduce((sum, { node: line }) => {
    const matched = products.find((p) => p.variantId === line.merchandise.id);
    const price = isHebrew
      ? matched?.israelPrice || 0
      : matched?.globalPrice || 0;
    return sum + price * line.quantity;
  }, 0);

  const currencySymbol = isHebrew ? "₪" : "$";

  // ─── Generate unique order ID ──────────────────────────
  const orderId = `TC-${Date.now()}`;

  // ─── Handle checkout submission ───────────────────────
  const handleSubmit = async () => {
    setError("");

    if (!firstName || !lastName || !email || !phone) {
      setError(isHebrew ? "יש למלא את כל השדות" : "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createHypPayment({
        amount: total, // total is already calculated based on language
        orderId,
        customerName: firstName,
        customerLastName: lastName,
        customerEmail: email,
        customerPhone: phone,
        language,
      });

      if (result.success) {
        // ─── Store order ID in sessionStorage for success page
        sessionStorage.setItem("hyp-order-id", orderId);
        sessionStorage.setItem(
          "hyp-cart-lines",
          JSON.stringify(
            lines.map(({ node: line }) => ({
              variantId: line.merchandise.id,
              quantity: line.quantity,
            })),
          ),
        );

        // ─── Redirect to Hyp Pay payment page ─────────────
        window.location.href = result.paymentUrl;
      } else {
        setError(
          isHebrew ? "שגיאה ביצירת התשלום" : result.error || "Payment error",
        );
      }
    } catch (err) {
      setError(isHebrew ? "שגיאה בלתי צפויה" : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Empty cart ────────────────────────────────────────
  if (lines.length === 0) {
    return (
      <div className={`checkout-page ${isHebrew ? "checkout-page--rtl" : ""}`}>
        <div className="checkout-page__empty">
          <p>{isHebrew ? "העגלה שלך ריקה" : "Your cart is empty"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`checkout-page ${isHebrew ? "checkout-page--rtl" : ""}`}>
      {/* ─── Heading ──────────────────────────────────────── */}
      <h1 className="checkout-page__heading">
        {isHebrew ? "סיום הזמנה" : "Checkout"}
      </h1>

      <div className="checkout-page__content">
        {/* ─── Order Summary ────────────────────────────────── */}
        <div className="checkout-page__summary">
          <h2 className="checkout-page__section-heading">
            {isHebrew ? "סיכום הזמנה" : "Order Summary"}
          </h2>

          <div className="checkout-page__items">
            {lines.map(({ node: line }) => {
              const matched = products.find(
                (p) => p.variantId === line.merchandise.id,
              );
              const title = isHebrew
                ? matched?.hebrewName || line.merchandise.product.title
                : matched?.englishName || line.merchandise.product.title;

              // ─── Calculate price based on language ──────────────
              const price = isHebrew
                ? matched?.israelPrice || 0
                : matched?.globalPrice || 0;

              const image =
                matched?.images?.[0] ||
                line.merchandise.product.images?.edges?.[0]?.node?.url;

              return (
                <div key={line.id} className="checkout-page__item">
                  {image && (
                    <div className="checkout-page__item-image">
                      <img src={image} alt={title} />
                    </div>
                  )}
                  <div className="checkout-page__item-details">
                    <p className="checkout-page__item-name">{title}</p>
                    <p className="checkout-page__item-price">
                      {currencySymbol}
                      {Math.round(price * line.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Total ──────────────────────────────────────── */}
          <div className="checkout-page__total">
            <span>{isHebrew ? 'סה"כ לתשלום' : "Total"}</span>
            <span>
              {currencySymbol}
              {Math.round(total)}
            </span>
          </div>
        </div>

        {/* ─── Customer Form ────────────────────────────────── */}
        <div className="checkout-page__form">
          <h2 className="checkout-page__section-heading">
            {isHebrew ? "פרטי לקוח" : "Customer Details"}
          </h2>

          {/* First Name */}
          <div className="checkout-page__field">
            <label className="checkout-page__label">
              {isHebrew ? "שם פרטי" : "First Name"}
            </label>
            <input
              className="checkout-page__input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div className="checkout-page__field">
            <label className="checkout-page__label">
              {isHebrew ? "שם משפחה" : "Last Name"}
            </label>
            <input
              className="checkout-page__input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="checkout-page__field">
            <label className="checkout-page__label">
              {isHebrew ? "אימייל" : "Email"}
            </label>
            <input
              className="checkout-page__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="checkout-page__field">
            <label className="checkout-page__label">
              {isHebrew ? "טלפון" : "Phone"}
            </label>
            <input
              className="checkout-page__input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && <p className="checkout-page__error">{error}</p>}

          {/* Submit */}
          <button
            className="checkout-page__submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading
              ? isHebrew
                ? "מעבד..."
                : "Processing..."
              : isHebrew
                ? "המשך לתשלום"
                : "Proceed to Payment"}
          </button>

          <p className="checkout-page__secure">
            🔒{" "}
            {isHebrew
              ? "תשלום מאובטח באמצעות Hyp Pay"
              : "Secure payment via Hyp Pay"}
          </p>
        </div>
      </div>
    </div>
  );
}
