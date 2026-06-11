'use client';

import Link from 'next/link';
import { AiFillInstagram, AiFillFacebook } from 'react-icons/ai';
import { FaTiktok } from 'react-icons/fa6';
import { IoLogoWhatsapp } from 'react-icons/io';
import { useLanguage } from '@/contexts/LanguageContext';
import './Footer.scss';

// ─── Social Links ─────────────────────────────────────────────
const WHATSAPP_NUMBER = '+972553000357';

// ─── Nav Links ────────────────────────────────────────────────
const navLinks = {
  english: [
    { label: 'Home', href: '/' },
    { label: 'Art', href: '/art' },
    { label: 'Fashion', href: '/fashion' },
    { label: 'Info', href: '/info' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
  ],
  hebrew: [
    { label: 'בית', href: '/' },
    { label: 'אמנות', href: '/art' },
    { label: 'אופנה', href: '/fashion' },
    { label: 'מידע', href: '/info' },
    { label: 'אודות', href: '/#about' },
    { label: 'צור קשר', href: '/#contact' },
  ],
};

// ─── Footer ───────────────────────────────────────────────────
export default function Footer() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';
  const currentYear = new Date().getFullYear();
  const links = navLinks[isHebrew ? 'hebrew' : 'english'];

  const whatsappMessage = isHebrew
    ? 'שלום! יש לי שאלה :)'
    : 'Hello! I have a question :)';

  const handleWhatsapp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}/?text=${whatsappMessage}`);
  };

  return (
    <footer className={`footer ${isHebrew ? 'footer--rtl' : ''}`}>

      {/* ─── Quick Nav ──────────────────────────────────── */}
      <div className="footer__nav">
        <h3 className="footer__heading">
          {isHebrew ? 'ניווט מהיר' : 'Quick Links'}
        </h3>
        <ul className="footer__nav-list">
          {links.map(link => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ─── Brand ──────────────────────────────────────── */}
      <div className="footer__brand">
        <Link href="/" className="footer__logo">the container</Link>
        <p className="footer__tagline">
          {isHebrew ? 'אמנות ואופנה' : 'Art & Fashion'}
        </p>
      </div>

      {/* ─── Socials ────────────────────────────────────── */}
      <div className="footer__socials">
        <h3 className="footer__heading">
          {isHebrew ? 'עקבו אחרינו' : 'Follow Us'}
        </h3>
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
        <p>© {currentYear} The Container. All rights reserved.</p>
      </div>

    </footer>
  );
}