"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import "./Nav.scss";

// ─── Nav Links ────────────────────────────────────────────────
function NavLinks({ t, onLinkClick, onAnchorClick }) {
  return (
    <>
      <li className="nav__item">
        <Link href="/" onClick={onLinkClick}>
          {t.nav.home}
        </Link>
      </li>
      <li className="nav__item">
        <a href="/#about" onClick={(e) => onAnchorClick(e, "/#about")}>
          {t.nav.about}
        </a>
      </li>
      <li className="nav__item">
        <Link href="/fashion" onClick={onLinkClick}>
          {t.nav.fashion}
        </Link>
      </li>
      <li className="nav__item">
        <Link href="/art" onClick={onLinkClick}>
          {t.nav.art}
        </Link>
      </li>
      <li className="nav__item">
        <Link href="/info" onClick={onLinkClick}>
          {t.nav.info}
        </Link>
      </li>
      <li className="nav__item">
        <a href="/#contact" onClick={(e) => onAnchorClick(e, "/#contact")}>
          {t.nav.contact}
        </a>
      </li>
    </>
  );
}

// ─── Nav ──────────────────────────────────────────────────────
export default function Nav() {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === "Hebrew";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // ─── Anchor Handler ───────────────────────────────────
  // Navigates to homepage first if needed, then scrolls to section
  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    closeMenu();

    const hash = href.includes("#") ? "#" + href.split("#")[1] : "";

    if (window.location.pathname !== "/") {
      // navigate to homepage with hash — AnchorScroll will handle the scroll
      router.push(href);
    } else {
      // already on homepage — update URL silently and scroll smoothly
      history.pushState(null, "", hash);
      scrollToSection(hash);
    }
  };

  const scrollToSection = (hash) => {
    const element = document.querySelector(hash);
    if (!element) return;
    const topBar = document.querySelector(".top-bar");
    const offset = topBar ? topBar.getBoundingClientRect().height : 0;
    const top =
      element.getBoundingClientRect().top + window.scrollY - offset - 16;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      {/* ─── Desktop Nav ──────────────────────────────────── */}
      <nav className={`nav ${isHebrew ? "nav--rtl" : ""}`}>
        <ul className="nav__list">
          <NavLinks
            t={t}
            onLinkClick={closeMenu}
            onAnchorClick={handleAnchorClick}
          />
        </ul>
      </nav>

      {/* ─── Mobile Nav ───────────────────────────────────── */}
      <div className="mobile-nav">
        <button
          className="mobile-nav__toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <IoMdClose size={30} /> : <IoMdMenu size={30} />}
        </button>

        <div
          className={`mobile-nav__menu ${isMenuOpen ? "mobile-nav__menu--open" : ""}`}
        >
          <ul
            className={`mobile-nav__list ${isHebrew ? "mobile-nav__list--rtl" : ""}`}
          >
            <NavLinks
              t={t}
              onLinkClick={closeMenu}
              onAnchorClick={handleAnchorClick}
            />
          </ul>
        </div>
      </div>
    </>
  );
}
