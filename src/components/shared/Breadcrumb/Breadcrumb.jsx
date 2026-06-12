'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import './Breadcrumb.scss';

// ─── Breadcrumb ───────────────────────────────────────────────
// Shows navigation path — Home > Category > Item Name
// Accepts an array of { label, href } objects

export default function Breadcrumb({ items }) {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';

  return (
    <nav
      className={`breadcrumb ${isHebrew ? 'breadcrumb--rtl' : ''}`}
      aria-label="breadcrumb"
    >
      <ol className="breadcrumb__list">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="breadcrumb__item">
              {isLast ? (
                <span className="breadcrumb__current">{item.label}</span>
              ) : (
                <>
                  <Link href={item.href} className="breadcrumb__link">
                    {item.label}
                  </Link>
                  <span className="breadcrumb__separator">
                    {isHebrew ? '\\' : '/'}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}