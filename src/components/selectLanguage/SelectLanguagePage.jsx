"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import "./SelectLanguagePage.scss";

// ─── SelectLanguagePage ───────────────────────────────────────
// Full screen overlay shown on first visit
// User picks English or Hebrew — saved to localStorage

export default function SelectLanguagePage() {
  const { setLanguage } = useLanguage();

  return (
    <div className="select-language">
      {/* ─── Logo ───────────────────────────────────────── */}
      <h1 className="select-language__logo">the container</h1>

      {/* ─── Heading ────────────────────────────────────── */}
      <div className="select-language__headings">
        <h2 className="select-language__title">Welcome</h2>
        <p className="select-language__subtitle">Select your language</p>
      </div>

      {/* ─── Language Buttons ───────────────────────────── */}
      <div className="select-language__buttons">
        <button
          className="select-language__btn"
          onClick={() => setLanguage("English")}
        >
          <div className="select-language__flag-wrapper">
            <Image
              src="/assets/images/language-selector/england-flag.png"
              alt="English"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <span>English</span>
        </button>

        <div className="select-language__divider" />

        <button
          className="select-language__btn"
          onClick={() => setLanguage("Hebrew")}
        >
          <div className="select-language__flag-wrapper">
            <Image
              src="/assets/images/language-selector/israel-flag.webp"
              alt="עברית"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <span>עברית</span>
        </button>
      </div>
    </div>
  );
}
