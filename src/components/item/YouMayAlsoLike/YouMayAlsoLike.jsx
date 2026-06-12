'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/shared/Card/Card';
import './YouMayAlsoLike.scss';

// ─── YouMayAlsoLike ───────────────────────────────────────────
// Shows related products from the same category
// Excludes the current product

export default function YouMayAlsoLike({ products = [], currentHandle }) {
  const { language } = useLanguage();
  const isEnglish = language.toLowerCase() === 'english';
  const isHebrew = language === 'Hebrew';

  const filtered = products
    .filter(p => p.handle !== currentHandle)
    .slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <section className={`you-may-also-like ${isHebrew ? 'you-may-also-like--rtl' : ''}`}>

      {/* ─── Heading ──────────────────────────────────── */}
      <h2 className="you-may-also-like__heading">
        {isHebrew ? 'אולי גם יעניין אותך' : 'You May Also Like'}
      </h2>

      {/* ─── Cards ────────────────────────────────────── */}
      <div className="you-may-also-like__cards">
        {filtered.map((product, idx) => (
          <Card
            key={idx}
            item={{
              id: product.id,
              handle: product.handle,
              title: isEnglish ? product.englishName : product.hebrewName,
              price: isEnglish ? product.globalPrice : product.israelPrice,
              imagePath: product.images?.[0] ?? '',
              isInStock: product.inStock,
            }}
          />
        ))}
      </div>

    </section>
  );
}