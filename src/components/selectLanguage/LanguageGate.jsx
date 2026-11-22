'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import SelectLanguagePage from './SelectLanguagePage';

// ─── LanguageGate ─────────────────────────────────────────────
// The page content is always rendered (so search engines and link
// previews see it). If the visitor hasn't picked a language yet,
// the full-screen language picker is shown on top of it.

export default function LanguageGate({ children }) {
  const { language, ready } = useLanguage();
  const showPicker = ready && !language;

  return (
    <>
      {/* display: contents keeps the body's flex layout unchanged;
          inert stops keyboard focus reaching the page behind the picker */}
      <div style={{ display: 'contents' }} inert={showPicker || undefined}>
        {children}
      </div>
      {showPicker && <SelectLanguagePage />}
    </>
  );
}
