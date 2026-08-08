"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import termsData from "@/data/termsData";
import "./TermsPage.scss";

// ─── TermsPage ────────────────────────────────────────────────
// Terms of Service page — required by PayPlus and Israeli law
// Content managed in src/data/termsData.js

export default function TermsPage() {
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const data = isHebrew ? termsData.hebrew : termsData.english;
  const currentYear = new Date().getFullYear();

  return (
    <div className={`terms-page ${isHebrew ? "terms-page--rtl" : ""}`}>
      <div className="terms-page__inner">
        {/* ─── Title ──────────────────────────────────────── */}
        <h1 className="terms-page__title">{data.title}</h1>
        <p className="terms-page__updated">
          {data.updated}: {currentYear}
        </p>

        {/* ─── Sections ───────────────────────────────────── */}
        {data.sections.map((section, idx) => (
          <section key={idx} className="terms-page__section">
            <h2 className="terms-page__heading">{section.heading}</h2>

            {section.content && <p>{section.content}</p>}

            {section.list && (
              <ul className="terms-page__list">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}

            {section.subsections?.map((sub, si) => (
              <div key={si} className="terms-page__subsection">
                <h3 className="terms-page__subheading">{sub.heading}</h3>
                {sub.content && <p>{sub.content}</p>}
                {sub.list && (
                  <ul className="terms-page__list">
                    {sub.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {sub.note && <p className="terms-page__note">{sub.note}</p>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
