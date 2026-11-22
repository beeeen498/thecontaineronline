'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import './CookieConsent.scss';

const subscribeNoop = () => () => {};

function readConsent() {
  try {
    return localStorage.getItem('cookie-consent');
  } catch {
    return 'unavailable'; // storage blocked — don't nag on every page
  }
}

// ─── CookieConsent ────────────────────────────────────────────
// Shows a cookie consent banner on first visit
// Stores the choice in localStorage
// Meta Pixel should only fire if consent is given

export default function CookieConsent({ onAccept, onDecline }) {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === 'Hebrew';
  // ─── Check existing consent ───────────────────────────
  // Read from localStorage after hydration (server snapshot = hidden)
  const consent = useSyncExternalStore(subscribeNoop, readConsent, () => 'unknown');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || consent !== null) return null;

  // ─── Handlers ─────────────────────────────────────────
  const saveConsent = (value) => {
    try {
      localStorage.setItem('cookie-consent', value);
    } catch {}
    setDismissed(true);
  };

  const handleAccept = () => {
    saveConsent('accepted');
    onAccept?.();
  };

  const handleDecline = () => {
    saveConsent('declined');
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