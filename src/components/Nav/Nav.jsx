'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IoMdMenu, IoMdClose } from 'react-icons/io';
import { useLanguage } from '@/contexts/LanguageContext';
import './Nav.scss';

// ─── Nav Text ─────────────────────────────────────────────────
const navText = {
  english: {
    home: 'Home',
    about: 'About',
    fashion: 'Fashion',
    art: 'Art',
    info: 'Info',
    contact: 'Contact',
  },
  hebrew: {
    home: 'בית',
    about: 'אודות',
    fashion: 'אופנה',
    art: 'אמנות',
    info: 'מידע',
    contact: 'צור קשר',
  },
};

// ─── Nav Links ────────────────────────────────────────────────
// Shared between desktop and mobile nav
function NavLinks({ text, onLinkClick }) {
  return (
    <>
      <li className="nav__item"><Link href="/" onClick={onLinkClick}>{text.home}</Link></li>
      <li className="nav__item"><Link href="/#about" onClick={onLinkClick}>{text.about}</Link></li>
      <li className="nav__item"><Link href="/fashion" onClick={onLinkClick}>{text.fashion}</Link></li>
      <li className="nav__item"><Link href="/art" onClick={onLinkClick}>{text.art}</Link></li>
      <li className="nav__item"><Link href="/info" onClick={onLinkClick}>{text.info}</Link></li>
      <li className="nav__item"><Link href="/#contact" onClick={onLinkClick}>{text.contact}</Link></li>
    </>
  );
}

// ─── Nav ──────────────────────────────────────────────────────
// Desktop: bottom bar with centered links
// Mobile: hamburger icon that opens a full screen sliding menu

export default function Nav() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';
  const text = navText[isHebrew ? 'hebrew' : 'english'];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  return (
    <>
      {/* ─── Desktop Nav ──────────────────────────────────── */}
      <nav className={`nav ${isHebrew ? 'nav--rtl' : ''}`}>
        <ul className="nav__list">
          <NavLinks text={text} />
        </ul>
      </nav>

      {/* ─── Mobile Nav ───────────────────────────────────── */}
      <div className="mobile-nav">

        {/* hamburger / close icon */}
        <button
          className="mobile-nav__toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen
            ? <IoMdClose size={30} />
            : <IoMdMenu size={30} />
          }
        </button>

        {/* full screen sliding menu */}
        <div className={`mobile-nav__menu ${isMenuOpen ? 'mobile-nav__menu--open' : ''}`}>
          <ul className={`mobile-nav__list ${isHebrew ? 'mobile-nav__list--rtl' : ''}`}>
            <NavLinks text={text} onLinkClick={closeMenu} />
          </ul>
        </div>

      </div>
    </>
  );
}