"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import "./CartDrawer.scss";

export default function CartDrawer() {
  const {
    cart,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    isLoading,
  } = useCart();
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";

  // ─── Track which lines hit their stock limit ──────────
  const [maxedOutLines, setMaxedOutLines] = useState({});

  const lines = cart?.lines?.edges || [];
  const totalAmount = cart?.cost?.totalAmount?.amount;
  const currencyCode = cart?.cost?.totalAmount?.currencyCode;

  const handleCheckout = () => {
    if (!cart?.checkoutUrl) return;

    const checkoutUrl = new URL(cart.checkoutUrl);
    checkoutUrl.searchParams.set("locale", language === "Hebrew" ? "he" : "en");

    window.location.href = checkoutUrl.toString();
  };

  const handleIncrease = async (lineId, newQuantity) => {
    const result = await updateQuantity(lineId, newQuantity);
    const maxedOut = result?.maxedOut || false;

    setMaxedOutLines((prev) => ({ ...prev, [lineId]: maxedOut }));

    if (maxedOut) {
      setTimeout(() => {
        setMaxedOutLines((prev) => ({ ...prev, [lineId]: false }));
      }, 5000);
    }
  };

  const handleDecrease = async (lineId, newQuantity) => {
    const result = await updateQuantity(lineId, newQuantity);
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
                const product = line.merchandise.product;
                const image = product.images?.edges?.[0]?.node?.url;
                const lineTotal = line.cost?.totalAmount?.amount;
                const lineCurrency = line.cost?.totalAmount?.currencyCode;
                const isMaxedOut = maxedOutLines[line.id];

                return (
                  <div key={line.id} className="cart-drawer__item">
                    {/* image */}
                    <Link
                      href={`/item/${product.handle}`}
                      className="cart-drawer__item-image"
                      onClick={closeDrawer}
                    >
                      {image && (
                        <Image
                          src={image}
                          alt={product.title}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </Link>

                    {/* details */}
                    <div className="cart-drawer__item-details">
                      <Link
                        href={`/item/${product.handle}`}
                        className="cart-drawer__item-name"
                        onClick={closeDrawer}
                      >
                        {product.title}
                      </Link>

                      <p className="cart-drawer__item-price">
                        {lineCurrency === "ILS" ? "₪" : "$"}
                        {Math.round(lineTotal)}
                      </p>

                      {/* quantity controls */}
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

                      {isMaxedOut && (
                        <p className="cart-drawer__max-stock">
                          {isHebrew ? "אין יותר במלאי" : "No more in stock"}
                        </p>
                      )}
                    </div>

                    {/* remove */}
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
                  {currencyCode === "ILS" ? "₪" : "$"}
                  {Math.round(totalAmount)}
                </span>
              </div>

              <button
                className="cart-drawer__checkout"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isHebrew ? "לתשלום" : "Checkout"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
