'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageButton from './LanguageButton';
import { BsHandbag } from 'react-icons/bs';
import { useCart } from '@/contexts/CartContext';
import './Header.scss';

export default function Header() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';
  const { cart, openDrawer } = useCart();
  const itemCount = cart?.totalQuantity || 0;

  // ─── Bounce animation on count change ──────────────────
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (itemCount === 0) return;
    setIsBouncing(true);
    const timer = setTimeout(() => setIsBouncing(false), 400);
    return () => clearTimeout(timer);
  }, [itemCount]);

  return (
    <header className={`header ${isHebrew ? 'rtl' : ''}`}>
      <div className="header__language">
        <LanguageButton />
      </div>

      <div className="header__logo">
        <Link href="/">the container</Link>
      </div>

      <div className="header__cart">
        <button
          className={`header__cart-button ${isBouncing ? 'header__cart-button--bounce' : ''}`}
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