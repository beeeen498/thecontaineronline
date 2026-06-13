'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── HtmlAttributes ───────────────────────────────────────────
// Updates <html> lang and dir attributes when language changes
// Must be inside LanguageProvider

export default function HtmlAttributes() {
  const { language } = useLanguage();

  useEffect(() => {
    const html = document.documentElement;
    if (language === 'Hebrew') {
      html.setAttribute('lang', 'he');
      html.setAttribute('dir', 'rtl');
    } else {
      html.setAttribute('lang', 'en');
      html.setAttribute('dir', 'ltr');
    }
  }, [language]);

  return null;
}