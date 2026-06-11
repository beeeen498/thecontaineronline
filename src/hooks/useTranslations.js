import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';

// ─── useTranslations ──────────────────────────────────────────
// Returns the translation object for the current language.
// Usage: const t = useTranslations()
// Then: t.nav.home, t.about.heading, etc.

export function useTranslations() {
  const { language } = useLanguage();
  return translations[language?.toLowerCase()] ?? translations.english;
}