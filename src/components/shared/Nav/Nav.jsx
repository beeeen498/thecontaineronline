'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { IoMdMenu, IoMdClose } from 'react-icons/io';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import './Nav.scss';

// ─── Nav ──────────────────────────────────────────────────────
export default function Nav() {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === 'Hebrew';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // ─── Handlers ─────────────────────────────────────────
  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveAnchor('');
  };

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const scrollToSection = (hash) => {
    const element = document.querySelector(hash);
    if (!element) return;
    const topBar = document.querySelector('.top-bar');
    const offset = topBar ? topBar.getBoundingClientRect().height : 0;
    const top = element.getBoundingClientRect().top + window.scrollY - offset - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const hash = href.includes('#') ? '#' + href.split('#')[1] : '';
    if (window.location.pathname !== '/') {
      router.push(href);
    } else {
      history.pushState(null, '', hash);
      scrollToSection(hash);
      setActiveAnchor(hash);
    }
  };

  // ─── Nav Items ──────────────────────────────────────────
  const navItems = (
    <>
      <li className={`nav__item ${pathname === '/' && !activeAnchor ? 'nav__item--active' : ''}`}>
        <Link href="/" onClick={closeMenu}>{t.nav.home}</Link>
      </li>
      <li className={`nav__item ${activeAnchor === '#about' ? 'nav__item--active' : ''}`}>
        <a href="/#about" onClick={(e) => handleAnchorClick(e, '/#about')}>{t.nav.about}</a>
      </li>
      <li className={`nav__item ${pathname === '/fashion' ? 'nav__item--active' : ''}`}>
        <Link href="/fashion" onClick={closeMenu}>{t.nav.fashion}</Link>
      </li>
      <li className={`nav__item ${pathname === '/art' ? 'nav__item--active' : ''}`}>
        <Link href="/art" onClick={closeMenu}>{t.nav.art}</Link>
      </li>
      <li className={`nav__item ${pathname === '/info' ? 'nav__item--active' : ''}`}>
        <Link href="/info" onClick={closeMenu}>{t.nav.info}</Link>
      </li>
      <li className={`nav__item ${activeAnchor === '#contact' ? 'nav__item--active' : ''}`}>
        <a href="/#contact" onClick={(e) => handleAnchorClick(e, '/#contact')}>{t.nav.contact}</a>
      </li>
    </>
  );

  return (
    <>
      {/* ─── Desktop Nav ──────────────────────────────────── */}
      <nav className={`nav ${isHebrew ? 'nav--rtl' : ''}`}>
        <ul className="nav__list">
          {navItems}
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
            {navItems}
          </ul>
        </div>
      </div>
    </>
  );
}