'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageButton from './LanguageButton';
import './Header.scss';

// ─── Header ───────────────────────────────────────────────────
// Top bar — logo, language toggle, cart icon placeholder
// Sits above the Nav component

export default function Header() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';

  return (
    <header className={`header ${isHebrew ? 'rtl' : ''}`}>

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
        {/* cart icon placeholder — will be wired up later */}
        <button className="header__cart-button" aria-label="Cart">
          🛒
        </button>
      </div>

    </header>
  );
}