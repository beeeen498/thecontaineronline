'use client';

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from 'react';
import { LANGUAGES, LANGUAGE_COOKIE } from '@/lib/language';

const subscribeNoop = () => () => {};

function readStoredLanguage() {
  try {
    return localStorage.getItem('language');
  } catch {
    return null;
  }
}

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
  // `stored` = older choice saved only in localStorage; undefined
  // until the browser has hydrated (server snapshot).
  // language null = no choice yet → the language picker is shown.
  // `ready` = we've checked the browser for an older saved choice.
  const [chosen, setChosen] = useState(initialLanguage);
  const stored = useSyncExternalStore(subscribeNoop, readStoredLanguage, () => undefined);
  const language = chosen ?? (LANGUAGES.includes(stored) ? stored : null);
  const ready = chosen != null || stored !== undefined;

  // ─── Move an older localStorage choice into the cookie ──────
  useEffect(() => {
    if (!chosen && LANGUAGES.includes(stored)) saveLanguage(stored);
  }, [chosen, stored]);

  // ─── Setters ─────────────────────────────────────────────────
  const setLanguage = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return;
    setChosen(next);
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
