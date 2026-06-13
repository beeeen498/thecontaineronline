'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import './PrivacyPolicy.scss';

// ─── PrivacyPolicy ────────────────────────────────────────────
// Privacy Policy page — placeholder text until final copy is ready

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';

  return (
    <div className={`privacy-policy ${isHebrew ? 'privacy-policy--rtl' : ''}`}>
      <div className="privacy-policy__inner">

        <h1 className="privacy-policy__title">
          {isHebrew ? 'מדיניות פרטיות' : 'Privacy Policy'}
        </h1>

        <p className="privacy-policy__updated">
          {isHebrew ? 'עודכן לאחרונה: בקרוב' : 'Last updated: Coming soon'}
        </p>

        <div className="privacy-policy__content">
          <p>
            {isHebrew
              ? 'מדיניות הפרטיות שלנו תפורסם בקרוב. לשאלות, צרו איתנו קשר.'
              : 'Our privacy policy will be published soon. For questions, please contact us.'
            }
          </p>
        </div>

      </div>
    </div>
  );
}