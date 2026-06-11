import Link from 'next/link';
import Card from '@/components/shared/Card/Card';
import { getAllProducts } from '@/lib/shopifyQueries';
import { translations } from '@/translations';
import './FeaturedItems.scss';

// ─── Format Product ───────────────────────────────────────────
// Formats a Shopify product into the shape Card expects
function formatItem(item, isEnglish) {
  return {
    id: item.id,
    title: isEnglish ? item.englishName : item.hebrewName,
    price: isEnglish ? item.globalPrice : item.israelPrice,
    imagePath: item.images?.[0] ?? '',
    isInStock: item.inStock,
  };
}

// ─── Featured Row ─────────────────────────────────────────────
// One row of featured items — text block on one side, cards on the other
function FeaturedRow({ heading, text, buttonText, href, items, reversed }) {
  return (
    <div className={`featured__row ${reversed ? 'featured__row--reversed' : ''}`}>

      {/* ─── Text + Button ──────────────────────────────── */}
      <div className="featured__text-block">
        <h2 className="featured__heading">{heading}</h2>
        <p className="featured__description">{text}</p>
        <div className="featured__btn-wrapper">
          <Link href={href} className="featured__btn">{buttonText}</Link>
        </div>
      </div>

      {/* ─── Cards ──────────────────────────────────────── */}
      <div className="featured__cards">
        {items.map((item, idx) => (
          <Card key={idx} item={item} />
        ))}
      </div>

    </div>
  );
}

// ─── Featured Items ───────────────────────────────────────────
// Server component — fetches products from Shopify
// Temporarily splits all products in half until typeOfItem metafield is set
export default async function FeaturedItems({ language = 'english' }) {
  const lang = language.toLowerCase();
  const t = translations[lang] ?? translations.english;
  const isEnglish = lang === 'english';

  const allProducts = await getAllProducts();

  // temporary split until typeOfItem metafield is set in Shopify
  const featuredFashion = allProducts.slice(0, 3).map(item => formatItem(item, isEnglish));
  const featuredArt = allProducts.slice(3, 6).map(item => formatItem(item, isEnglish));

  return (
    <section className="featured">

      {/* ─── Fashion Row ────────────────────────────────── */}
      <FeaturedRow
        heading={t.featuredItems.fashionHeading}
        text={t.featuredItems.fashionText}
        buttonText={t.featuredItems.buttonText}
        href="/fashion"
        items={featuredFashion}
        reversed={false}
      />

      {/* ─── Art Row ────────────────────────────────────── */}
      <FeaturedRow
        heading={t.featuredItems.artHeading}
        text={t.featuredItems.artText}
        buttonText={t.featuredItems.buttonText}
        href="/art"
        items={featuredArt}
        reversed={true}
      />

    </section>
  );
}