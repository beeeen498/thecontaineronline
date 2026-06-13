'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import './CookieConsent.scss';

// ─── CookieConsent ────────────────────────────────────────────
// Shows a cookie consent banner on first visit
// Stores the choice in localStorage
// Meta Pixel should only fire if consent is given

export default function CookieConsent({ onAccept, onDecline }) {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === 'Hebrew';
  const [isVisible, setIsVisible] = useState(false);

  // ─── Check existing consent ───────────────────────────
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  // ─── Handlers ─────────────────────────────────────────
  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
    onDecline?.();
  };

  return (
    <div className={`cookie-consent ${isHebrew ? 'cookie-consent--rtl' : ''}`}>

      {/* ─── Message ──────────────────────────────────── */}
      <p className="cookie-consent__message">
        {t.consent.message}{' '}
        <Link href="/privacy" className="cookie-consent__link">
          {t.consent.learnMore}
        </Link>
      </p>

      {/* ─── Buttons ──────────────────────────────────── */}
      <div className="cookie-consent__buttons">
        <button
          className="cookie-consent__btn cookie-consent__btn--decline"
          onClick={handleDecline}
        >
          {t.consent.decline}
        </button>
        <button
          className="cookie-consent__btn cookie-consent__btn--accept"
          onClick={handleAccept}
        >
          {t.consent.accept}
        </button>
      </div>

    </div>
  );
}