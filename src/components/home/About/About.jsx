"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import quotes from "@/data/designerQuotes";
import "./About.scss";

// ─── Quote Carousel ───────────────────────────────────────────
// Rotates through designer quotes every 7 seconds with a fade effect
function QuoteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
        setFade(false);
      }, 2000);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="about__quote">
      <h2
        className={
          fade
            ? "about__quote-text about__quote-text--fade"
            : "about__quote-text"
        }
      >
        &ldquo;{quotes[currentIndex].quote}&rdquo;
      </h2>
      <p
        className={
          fade
            ? "about__quote-author about__quote-author--fade"
            : "about__quote-author"
        }
      >
        — {quotes[currentIndex].name}
      </p>
    </div>
  );
}

// ─── About ────────────────────────────────────────────────────
// Grid layout with marquee, heading, images, quote carousel, and text
export default function About() {
  const t = useTranslations();
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";

  return (
    <section id="about" className={`about ${isHebrew ? "about--rtl" : ""}`}>
      <div className="about__grid">
        {/* ─── Marquee ────────────────────────────────── */}
        <div className="about__marquee">
          <p className="about__marquee-text">
            100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT
            &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp; 100%
            LEGIT &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp;
            100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT
            &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp;
          </p>
          <p className="about__marquee-text">
            100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT
            &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp; 100%
            LEGIT &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp;
            100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT
            &nbsp;&nbsp;·&nbsp;&nbsp; 100% LEGIT &nbsp;&nbsp;·&nbsp;&nbsp;
          </p>
        </div>

        {/* ─── Heading ────────────────────────────────── */}
        <div className="about__heading">
          <h2>{t.about.heading}</h2>
        </div>

        {/* ─── Bag Image ──────────────────────────────── */}
        <div className="about__image-bag">
          <Image
            src="/assets/images/about/pink-prada-bag.jpg"
            alt="pink prada bag"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        {/* ─── Vase Image ─────────────────────────────── */}
        <div className="about__image-vase">
          <Image
            src="/assets/images/about/vase.jpg"
            alt="handmade clay vase"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* ─── Quote Carousel ─────────────────────────── */}
        <QuoteCarousel />

        {/* ─── Main Text ──────────────────────────────── */}
        <div className="about__text">
          <p>{t.about.text}</p>
        </div>
      </div>
    </section>
  );
}
