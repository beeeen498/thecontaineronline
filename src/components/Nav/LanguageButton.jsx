'use client';

import { MdLanguage } from 'react-icons/md';
import { useLanguage } from '@/contexts/LanguageContext';
import './LanguageButton.scss';

// ─── Language Button ──────────────────────────────────────────
// Globe icon — clicking toggles between English and Hebrew

export default function LanguageButton() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      className="language-button"
      onClick={toggleLanguage}
      aria-label={`Switch to ${language === 'English' ? 'Hebrew' : 'English'}`}
    >
      <MdLanguage size={30} />
    </button>
  );
}