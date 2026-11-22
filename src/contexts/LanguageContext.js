'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { LANGUAGES, LANGUAGE_COOKIE } from '@/lib/language';

// ─── Language Context ─────────────────────────────────────────
// Provides language state to the entire app.
// Supported languages: 'English', 'Hebrew'
//
// The choice is saved in a cookie (so the server can render the page
// in the right language on the first request — no flash, and search
// engines see real content) and in localStorage (older visits).

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

function saveLanguage(language) {
  try {
    localStorage.setItem('language', language);
  } catch {}
  document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000; samesite=lax`;
}

export const LanguageProvider = ({ children, initialLanguage = null }) => {

  // ─── State ──────────────────────────────────────────────────
  // initialLanguage comes from the cookie (read on the server).
  // null = no choice yet → the language picker is shown.
  // `ready` = we've checked the browser for an older saved choice.
  const [language, setLanguageState] = useState(initialLanguage);
  const [ready, setReady] = useState(Boolean(initialLanguage));

  // ─── On Mount ───────────────────────────────────────────────
  // Visitors from before the cookie existed: move their saved
  // localStorage choice into the cookie.
  useEffect(() => {
    if (initialLanguage) return;
    let saved = null;
    try {
      saved = localStorage.getItem('language');
    } catch {}
    if (LANGUAGES.includes(saved)) {
      setLanguageState(saved);
      saveLanguage(saved);
    }
    setReady(true);
  }, [initialLanguage]);

  // ─── Setters ─────────────────────────────────────────────────
  const setLanguage = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return;
    setLanguageState(next);
    saveLanguage(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'English' ? 'Hebrew' : 'English');
  }, [language, setLanguage]);

  return (
    <LanguageContext.Provider value={{ language, ready, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
