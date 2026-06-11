"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import articlesData from "@/data/articlesData";
import "./ArticlePage.scss";

// ─── ArticlePage ──────────────────────────────────────────────
// Full article view — image, title, and body text

export default function ArticlePage({ id }) {
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const article = articlesData[id];

  if (!article) {
    return (
      <div className="article-page__not-found">
        {isHebrew ? "מאמר לא נמצא" : "Article not found"}
      </div>
    );
  }

  return (
    <div className={`article-page ${isHebrew ? "article-page--rtl" : ""}`}>
      <div className="article-page__inner">
        {/* ─── Image ──────────────────────────────────── */}
        <div className="article-page__image-wrapper">
          <Image
            src={article.imagePath}
            alt={isHebrew ? article.titleHebrew : article.titleEnglish}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          <p className="article-page__copyright">&nbsp;{article.copyright}</p>
        </div>

        {/* ─── Title ──────────────────────────────────── */}
        <h1 className="article-page__title">
          {isHebrew ? article.titleHebrew : article.titleEnglish}
        </h1>

        {/* ─── Body ───────────────────────────────────── */}
        <pre className="article-page__body">
          {isHebrew ? article.textHebrew : article.textEnglish}
        </pre>
      </div>
    </div>
  );
}
