'use client';

import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import './NotFound.scss';

// ─── NotFound ─────────────────────────────────────────────────
export default function NotFound() {
  const t = useTranslations();
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';

  return (
    <div className={`not-found ${isHebrew ? 'not-found--rtl' : ''}`}>
      <div className="not-found__content">
        <h1 className="not-found__code">{t.notFound.heading}</h1>
        <div className="not-found__divider" />
        <p className="not-found__message">{t.notFound.message}</p>
        <Link href="/" className="not-found__link">
          {t.notFound.cta}
        </Link>
      </div>
    </div>
  );
}