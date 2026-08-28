"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageButton from "./LanguageButton";
import { BsHandbag } from "react-icons/bs";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useCart } from "@/contexts/CartContext";
import { FaRegUser, FaUser } from "react-icons/fa6";
import { useCustomer } from "@/contexts/CustomerContext";
import { useRouter } from "next/navigation";
import "./Header.scss";

export default function Header({ isMenuOpen, onToggleMenu }) {
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const { cart, openDrawer, isLoading } = useCart();
  const itemCount = cart?.totalQuantity || 0;
  const [isBouncing, setIsBouncing] = useState(false);
  const { isLoggedIn } = useCustomer();
  const router = useRouter();

  const handleAccountClick = () => {
    router.push(isLoggedIn ? "/account" : "/account/login");
  };

  useEffect(() => {
    if (itemCount === 0) return;
    setIsBouncing(true);
    const timer = setTimeout(() => setIsBouncing(false), 400);
    return () => clearTimeout(timer);
  }, [itemCount]);

  return (
    <header className={`header ${isHebrew ? "header--rtl" : ""}`}>
      {/* ─── Logo ─────────────────────────────────────────── */}
      <div className="header__logo">
        <Link href="/">the container</Link>
      </div>

      {/* ─── Icons ────────────────────────────────────────── */}
      <div className="header__icons">
        {/* Language */}
        <LanguageButton />

        {/* Account */}
        <button
          className="header__icon-btn"
          onClick={handleAccountClick}
          aria-label={isLoggedIn ? "My Account" : "Login"}
        >
          {isLoggedIn ? <FaUser size={20} /> : <FaRegUser size={20} />}
        </button>

        {/* Cart */}
        <button
          className={`header__icon-btn ${isBouncing ? "header__icon-btn--bounce" : ""} ${isLoading ? "header__icon-btn--loading" : ""}`}
          onClick={openDrawer}
          aria-label="Cart"
        >
          <BsHandbag size={22} />
          {itemCount > 0 && (
            <span className="header__cart-count">{itemCount}</span>
          )}
        </button>

        {/* Hamburger — mobile only */}
        <button
          className="header__icon-btn header__icon-btn--hamburger"
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <IoMdClose size={28} /> : <IoMdMenu size={28} />}
        </button>
      </div>
    </header>
  );
}
