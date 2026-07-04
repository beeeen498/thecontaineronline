"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageButton from "./LanguageButton";
import { BsHandbag } from "react-icons/bs";
import { useCart } from "@/contexts/CartContext";
import { FaRegUser, FaUser } from "react-icons/fa6";
import { useCustomer } from "@/contexts/CustomerContext";
import { useRouter } from "next/navigation";
import "./Header.scss";

export default function Header() {
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
    <header className={`header ${isHebrew ? "rtl" : ""}`}>
      <div className="header__language">
        <LanguageButton />
      </div>

      <div className="header__logo">
        <Link href="/">the container</Link>
      </div>

      {/* ─── Right Side — Account + Cart ─────────────────── */}
      <div className="header__right">
        <button
          className="header__account-button"
          onClick={handleAccountClick}
          aria-label={isLoggedIn ? "My Account" : "Login"}
        >
          {isLoggedIn ? <FaUser size={20} /> : <FaRegUser size={20} />}
        </button>

        <div className="header__cart">
          <button
            className={`header__cart-button ${isBouncing ? "header__cart-button--bounce" : ""} ${isLoading ? "header__cart-button--loading" : ""}`}
            onClick={openDrawer}
            aria-label="Cart"
          >
            <BsHandbag size={22} />
            {itemCount > 0 && (
              <span className="header__cart-count">{itemCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
