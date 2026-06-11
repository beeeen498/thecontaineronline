"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import articlesData from "@/data/articlesData";
import Article from "@/components/article/Article/Article";
import "./ArticlesSection.scss";

// ─── Articles Section ─────────────────────────────────────────
// Grid of article preview cards

export default function ArticlesSection() {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === "Hebrew";

  return (
    <section className="articles-section">
      {/* ─── Heading ────────────────────────────────────── */}
      <h2 className="articles-section__heading">{t.info.articles}</h2>

      {/* ─── Grid ───────────────────────────────────────── */}
      <div className="articles-section__grid">
        {Object.values(articlesData).map((article) => (
          <Article
            key={article.id}
            id={article.id}
            title={isHebrew ? article.titleHebrew : article.titleEnglish}
            imagePath={article.imagePath}
            copyright={article.copyright}
          />
        ))}
      </div>
    </section>
  );
}
