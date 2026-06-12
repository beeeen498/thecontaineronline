'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import SelectLanguagePage from './SelectLanguagePage';

// ─── LanguageGate ─────────────────────────────────────────────
// Shows SelectLanguagePage if no language is selected
// Once language is set, shows the normal app

export default function LanguageGate({ children }) {
  const { language } = useLanguage();

  if (!language) return <SelectLanguagePage />;

  return <>{children}</>;
}