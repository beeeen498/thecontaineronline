"use client";

import { useState } from "react";
import { createHypPayment } from "@/app/actions/createHypPayment";
import Image from "next/image";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import "./CartDrawer.scss";

// ─── CartDrawer ───────────────────────────────────────────────
// Slide-in panel showing cart contents
// Cross-references cart lines against our product list
// to show correct Hebrew names and global/local prices

export default function CartDrawer() {
  const {
    cart,
    products,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    isLoading,
  } = useCart();
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const isEnglish = !isHebrew;
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // ─── Track which lines hit their stock limit ──────────
  const [maxedOutLines, setMaxedOutLines] = useState({});

  const lines = cart?.lines?.edges || [];

  // ─── Calculate total from our own product data ────────
  const total = lines.reduce((sum, { node: line }) => {
    const matched = products.find((p) => p.variantId === line.merchandise.id);
    const price = isEnglish ? matched?.globalPrice : matched?.israelPrice;
    return sum + (price || 0) * line.quantity;
  }, 0);

  // ─── Checkout handler — appends locale to URL ─────────
  const handleCheckout = async () => {
    if (!cart?.lines?.edges?.length) return;
    setIsCheckingOut(true);

    const total = cart.lines.edges.reduce((sum, { node: line }) => {
      const matched = products.find((p) => p.variantId === line.merchandise.id);
      return sum + (matched?.israelPrice || 0) * line.quantity;
    }, 0);

    const cartLines = cart.lines.edges.map(({ node: line }) => ({
      variantId: line.merchandise.id,
      quantity: line.quantity,
    }));
    sessionStorage.setItem("hyp-cart-lines", JSON.stringify(cartLines));

    const result = await createHypPayment({
      amount: total,
      orderId: `TC-${Date.now()}`,
      language,
    });

    if (result.success) {
      window.location.href = result.paymentUrl;
    } else {
      console.error("Payment error:", result.error);
      setIsCheckingOut(false);
    }
  };

  // ─── Quantity handlers ────────────────────────────────
  const handleIncrease = async (lineId, newQuantity) => {
    const result = await updateQuantity(lineId, newQuantity);
    setMaxedOutLines((prev) => ({
      ...prev,
      [lineId]: result?.maxedOut || false,
    }));
    if (result?.maxedOut) {
      setTimeout(() => {
        setMaxedOutLines((prev) => ({ ...prev, [lineId]: false }));
      }, 5000);
    }
  };

  const handleDecrease = async (lineId, newQuantity) => {
    await updateQuantity(lineId, newQuantity);
    setMaxedOutLines((prev) => ({ ...prev, [lineId]: false }));
  };

  return (
    <>
      {/* ─── Overlay ──────────────────────────────────────── */}
      <div
        className={`cart-drawer__overlay ${isDrawerOpen ? "cart-drawer__overlay--open" : ""}`}
        onClick={closeDrawer}
      />

      {/* ─── Panel ────────────────────────────────────────── */}
      <div
        className={`cart-drawer ${isDrawerOpen ? "cart-drawer--open" : ""} ${isHebrew ? "cart-drawer--rtl" : ""}`}
      >
        {/* ─── Header ───────────────────────────────────── */}
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            {isHebrew ? "עגלת קניות" : "Shopping Cart"}
          </h2>
          <button
            className="cart-drawer__close"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* ─── Empty State ──────────────────────────────── */}
        {lines.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>{isHebrew ? "העגלה שלך ריקה" : "Your cart is empty"}</p>
          </div>
        ) : (
          <>
            {/* ─── Items ──────────────────────────────────── */}
            <div className="cart-drawer__items">
              {lines.map(({ node: line }) => {
                // ─── Match cart line to our product data ──
                const matched = products.find(
                  (p) => p.variantId === line.merchandise.id,
                );

                const title = isEnglish
                  ? matched?.englishName || line.merchandise.product.title
                  : matched?.hebrewName || line.merchandise.product.title;

                const price = isEnglish
                  ? matched?.globalPrice
                  : matched?.israelPrice;

                const currencySymbol = isEnglish ? "$" : "₪";
                const image =
                  matched?.images?.[0] ||
                  line.merchandise.product.images?.edges?.[0]?.node?.url;
                const handle =
                  matched?.handle || line.merchandise.product.handle;
                const isMaxedOut = maxedOutLines[line.id];

                return (
                  <div key={line.id} className="cart-drawer__item">
                    {/* ─── Image ────────────────────────── */}
                    <Link
                      href={`/item/${handle}`}
                      className="cart-drawer__item-image"
                      onClick={closeDrawer}
                    >
                      {image && (
                        <Image
                          src={image}
                          alt={title}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </Link>

                    {/* ─── Details ──────────────────────── */}
                    <div className="cart-drawer__item-details">
                      <Link
                        href={`/item/${handle}`}
                        className="cart-drawer__item-name"
                        onClick={closeDrawer}
                      >
                        {title}
                      </Link>

                      <p className="cart-drawer__item-price">
                        {price
                          ? `${currencySymbol}${Math.round(price * line.quantity)}`
                          : ""}
                      </p>

                      {/* ─── Quantity Controls ─────────── */}
                      <div className="cart-drawer__quantity">
                        <button
                          onClick={() =>
                            handleDecrease(line.id, line.quantity - 1)
                          }
                          disabled={isLoading || line.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span>{line.quantity}</span>
                        <button
                          onClick={() =>
                            handleIncrease(line.id, line.quantity + 1)
                          }
                          disabled={isLoading}
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      {/* ─── Max Stock Message ─────────── */}
                      {isMaxedOut && (
                        <p className="cart-drawer__max-stock">
                          {isHebrew ? "אין יותר במלאי" : "No more in stock"}
                        </p>
                      )}
                    </div>

                    {/* ─── Remove Button ────────────────── */}
                    <button
                      className="cart-drawer__item-remove"
                      onClick={() => removeItem(line.id)}
                      disabled={isLoading}
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ─── Footer ─────────────────────────────────── */}
            <div className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>{isHebrew ? 'סה"כ' : "Subtotal"}</span>
                <span>
                  {isEnglish ? "$" : "₪"}
                  {Math.round(total)}
                </span>
              </div>

              <button
                className="cart-drawer__checkout"
                onClick={handleCheckout}
                disabled={isLoading || isCheckingOut}
              >
                {isCheckingOut
                  ? isHebrew
                    ? "מעבד..."
                    : "Processing..."
                  : isHebrew
                    ? "לתשלום"
                    : "Checkout"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
