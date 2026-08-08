"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import privacyData from "@/data/privacyData";
import "./PrivacyPolicy.scss";

// ─── PrivacyPolicy ────────────────────────────────────────────
// Privacy Policy page — bilingual, based on Israeli law and GDPR
// Content managed in src/data/privacyData.js

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const data = isHebrew ? privacyData.hebrew : privacyData.english;
  const currentYear = new Date().getFullYear();

  return (
    <div className={`privacy-policy ${isHebrew ? "privacy-policy--rtl" : ""}`}>
      <div className="privacy-policy__inner">
        {/* ─── Title ──────────────────────────────────────── */}
        <h1 className="privacy-policy__title">{data.title}</h1>
        <p className="privacy-policy__updated">
          {data.updated}: {currentYear}
        </p>

        {/* ─── Sections ───────────────────────────────────── */}
        {data.sections.map((section, idx) => (
          <section key={idx} className="privacy-policy__section">
            <h2 className="privacy-policy__heading">{section.heading}</h2>

            {section.content && <p>{section.content}</p>}

            {section.list && (
              <ul className="privacy-policy__list">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}

            {section.note && (
              <p className="privacy-policy__note">{section.note}</p>
            )}

            {section.subsections?.map((sub, si) => (
              <div key={si} className="privacy-policy__subsection">
                <h3 className="privacy-policy__subheading">{sub.heading}</h3>
                {sub.content && <p>{sub.content}</p>}
                {sub.list && (
                  <ul className="privacy-policy__list">
                    {sub.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {sub.note && <p className="privacy-policy__note">{sub.note}</p>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
