"use client";

import Link from "next/link";
import Card from "@/components/shared/Card/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import "./FeaturedItems.scss";

// ─── Format Product ───────────────────────────────────────────
function formatItem(item, isEnglish) {
  const globalPrice = item.globalPrice;
  const israelPrice = parseFloat(item.israelPrice);

  const price = isEnglish
    ? globalPrice && !isNaN(globalPrice) && globalPrice > 0
      ? `$${Math.round(globalPrice).toLocaleString()}`
      : ""
    : israelPrice && !isNaN(israelPrice)
      ? `₪${Math.round(israelPrice).toLocaleString()}`
      : "";

  return {
    id: item.id,
    handle: item.handle,
    title: isEnglish ? item.englishName : item.hebrewName,
    price,
    imagePath: item.images?.[0] ?? "",
    isInStock: item.inStock,
    typeOfItem: item.typeOfItem,
    variantId: item.variantId,
  };
}

// ─── Featured Row ─────────────────────────────────────────────
function FeaturedRow({ heading, text, buttonText, href, items, reversed }) {
  return (
    <div
      className={`featured__row ${reversed ? "featured__row--reversed" : ""}`}
    >
      <div className="featured__text-block">
        <h2 className="featured__heading">{heading}</h2>
        <p className="featured__description">{text}</p>
        <div className="featured__btn-wrapper">
          <Link href={href} className="featured__btn">
            {buttonText}
          </Link>
        </div>
      </div>

      <div className="featured__cards">
        {items.map((item, idx) => (
          <Card key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}

// ─── Featured Items Client ─────────────────────────────────────
// Client component — reads language and formats products accordingly
export default function FeaturedItemsClient({ artProducts, fashionProducts }) {
  const { language } = useLanguage();
  const t = useTranslations();
  const isEnglish = language.toLowerCase() === "english";

  const featuredArt = artProducts.map((item) => formatItem(item, isEnglish));
  const featuredFashion = fashionProducts.map((item) =>
    formatItem(item, isEnglish),
  );

  return (
    <section className="featured">
      <FeaturedRow
        heading={t.featuredItems.fashionHeading}
        text={t.featuredItems.fashionText}
        buttonText={t.featuredItems.buttonText}
        href="/fashion"
        items={featuredFashion}
        reversed={false}
      />

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
