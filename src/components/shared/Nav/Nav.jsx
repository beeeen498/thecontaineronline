'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IoMdMenu, IoMdClose } from 'react-icons/io';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import './Nav.scss';

// ─── Nav Links ────────────────────────────────────────────────
// Shared between desktop and mobile nav
function NavLinks({ t, onLinkClick }) {
  return (
    <>
      <li className="nav__item"><Link href="/" onClick={onLinkClick}>{t.nav.home}</Link></li>
      <li className="nav__item"><Link href="/#about" onClick={onLinkClick}>{t.nav.about}</Link></li>
      <li className="nav__item"><Link href="/fashion" onClick={onLinkClick}>{t.nav.fashion}</Link></li>
      <li className="nav__item"><Link href="/art" onClick={onLinkClick}>{t.nav.art}</Link></li>
      <li className="nav__item"><Link href="/info" onClick={onLinkClick}>{t.nav.info}</Link></li>
      <li className="nav__item"><Link href="/#contact" onClick={onLinkClick}>{t.nav.contact}</Link></li>
    </>
  );
}

// ─── Nav ──────────────────────────────────────────────────────
// Desktop: bottom bar with centered links
// Mobile: hamburger icon that opens a full screen sliding menu
export default function Nav() {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === 'Hebrew';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  return (
    <>
      {/* ─── Desktop Nav ──────────────────────────────────── */}
      <nav className={`nav ${isHebrew ? 'nav--rtl' : ''}`}>
        <ul className="nav__list">
          <NavLinks t={t} />
        </ul>
      </nav>

      {/* ─── Mobile Nav ───────────────────────────────────── */}
      <div className="mobile-nav">
        <button
          className="mobile-nav__toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <IoMdClose size={30} /> : <IoMdMenu size={30} />}
        </button>

        <div className={`mobile-nav__menu ${isMenuOpen ? 'mobile-nav__menu--open' : ''}`}>
          <ul className={`mobile-nav__list ${isHebrew ? 'mobile-nav__list--rtl' : ''}`}>
            <NavLinks t={t} onLinkClick={closeMenu} />
          </ul>
        </div>
      </div>
    </>
  );
}