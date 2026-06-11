'use client';

import Link from 'next/link';
import { AiFillInstagram, AiFillFacebook } from 'react-icons/ai';
import { FaTiktok } from 'react-icons/fa6';
import { IoLogoWhatsapp } from 'react-icons/io';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import './Footer.scss';

// ─── Constants ────────────────────────────────────────────────
const WHATSAPP_NUMBER = '+972553000357';

// ─── Footer ───────────────────────────────────────────────────
export default function Footer() {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === 'Hebrew';
  const currentYear = new Date().getFullYear();

  // ─── Nav Links ──────────────────────────────────────────
  const navLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.art, href: '/art' },
    { label: t.nav.fashion, href: '/fashion' },
    { label: t.nav.info, href: '/info' },
    { label: t.nav.about, href: '/#about' },
    { label: t.nav.contact, href: '/#contact' },
  ];

  const handleWhatsapp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}/?text=${encodeURIComponent(
      isHebrew ? 'שלום! יש לי שאלה :)' : 'Hello! I have a question :)'
    )}`);
  };

  return (
    <footer className={`footer ${isHebrew ? 'footer--rtl' : ''}`}>

      {/* ─── Quick Nav ──────────────────────────────────── */}
      <div className="footer__nav">
        <h3 className="footer__heading">{t.footer.quickLinks}</h3>
        <ul className="footer__nav-list">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ─── Brand ──────────────────────────────────────── */}
      <div className="footer__brand">
        <Link href="/" className="footer__logo">the container</Link>
        <p className="footer__tagline">{t.footer.tagline}</p>
      </div>

      {/* ─── Socials ────────────────────────────────────── */}
      <div className="footer__socials">
        <h3 className="footer__heading">{t.footer.followUs}</h3>
        <ul className="footer__socials-list">
          <li>
            <a href="https://www.instagram.com/thecontainer.online/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <AiFillInstagram size={28} />
            </a>
          </li>
          <li>
            <a href="" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <AiFillFacebook size={28} />
            </a>
          </li>
          <li>
            <a href="" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok size={24} />
            </a>
          </li>
          <li>
            <button onClick={handleWhatsapp} aria-label="WhatsApp">
              <IoLogoWhatsapp size={28} />
            </button>
          </li>
        </ul>
      </div>

      {/* ─── Copyright ──────────────────────────────────── */}
      <div className="footer__bottom">
        <p>© {currentYear} {t.footer.copyright}</p>
      </div>

    </footer>
  );
}