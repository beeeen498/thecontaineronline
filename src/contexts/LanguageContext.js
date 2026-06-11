'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// ─── Language Context ─────────────────────────────────────────
// Provides language state to the entire app.
// Persists the selected language in localStorage between visits.
// Supported languages: 'English', 'Hebrew'

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {

  // ─── State ──────────────────────────────────────────────────
  // Read from localStorage on first load, default to null
  // null means the language selection screen will be shown
  const [language, setLanguage] = useState(null);
  const [mounted, setMounted] = useState(false);

  // ─── On Mount ───────────────────────────────────────────────
  // Only runs in the browser — reads saved language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved) setLanguage(saved);
    setMounted(true);
  }, []);

  // ─── Persist to localStorage ─────────────────────────────────
  useEffect(() => {
    if (language) localStorage.setItem('language', language);
  }, [language]);

  // ─── Toggle ──────────────────────────────────────────────────
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'English' ? 'Hebrew' : 'English');
  };

  // ─── Don't render until mounted ──────────────────────────────
  // Prevents a flash of wrong language on first load
  if (!mounted) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};