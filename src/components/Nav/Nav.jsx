'use client';

import Link from 'next/link';
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

// ─── Nav ──────────────────────────────────────────────────────
// Bottom navigation bar — links to all main pages
// Supports Hebrew RTL direction

export default function Nav() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';
  const text = navText[isHebrew ? 'hebrew' : 'english'];

  return (
    <nav className={`nav ${isHebrew ? 'nav--rtl' : ''}`}>
      <ul className="nav__list">
        <li className="nav__item"><Link href="/">{text.home}</Link></li>
        <li className="nav__item"><Link href="/#about">{text.about}</Link></li>
        <li className="nav__item"><Link href="/fashion">{text.fashion}</Link></li>
        <li className="nav__item"><Link href="/art">{text.art}</Link></li>
        <li className="nav__item"><Link href="/info">{text.info}</Link></li>
        <li className="nav__item"><Link href="/#contact">{text.contact}</Link></li>
      </ul>
    </nav>
  );
}