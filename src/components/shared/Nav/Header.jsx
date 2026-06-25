"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageButton from "./LanguageButton";
import { BsHandbag } from "react-icons/bs";
import { useCart } from "@/contexts/CartContext";
import "./Header.scss";

// ─── Header ───────────────────────────────────────────────────
// Top bar — logo, language toggle, cart icon placeholder
// Sits above the Nav component

export default function Header() {
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const { cart, openDrawer } = useCart();
  const itemCount = cart?.totalQuantity || 0;

  return (
    <header className={`header ${isHebrew ? "rtl" : ""}`}>
      {/* Language toggle — left side */}
      <div className="header__language">
        <LanguageButton />
      </div>

      {/* Logo — center */}
      <div className="header__logo">
        <Link href="/">the container</Link>
      </div>

      {/* Cart — right side */}
      <div className="header__cart">
        <button
          className="header__cart-button"
          onClick={openDrawer}
          aria-label="Cart"
        >
          <BsHandbag size={22} />
          {itemCount > 0 && (
            <span className="header__cart-count">{itemCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
