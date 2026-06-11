'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Designers from '@/components/info/Designers/Designers';
import CompanyCarousel from '@/components/info/CompanyCarousel/CompanyCarousel';
import ArticlesSection from '@/components/info/ArticlesSection/ArticlesSection';
import './InfoPage.scss';

// ─── InfoPage ─────────────────────────────────────────────────
// Assembles all info page sections
export default function InfoPage() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';

  return (
    <div className={`info-page ${isHebrew ? 'info-page--rtl' : ''}`}>
      <Designers />
      <CompanyCarousel />
      <ArticlesSection />
    </div>
  );
}