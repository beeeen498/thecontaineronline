"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import designersInfo from "@/data/designersInfo";
import "./Designers.scss";

// ─── Designers ────────────────────────────────────────────────
// Grid of designer images — click to see info below
// Hover shows name and company overlay

export default function Designers() {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === "Hebrew";

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const designersArray = Object.values(designersInfo);

  const handleImageClick = (index) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={`designers ${isHebrew ? "designers--rtl" : ""}`}>
      {/* ─── Heading ──────────────────────────────────── */}
      <h2 className="designers__heading">{t.info.designersHeading}</h2>

      {/* ─── Images Grid ──────────────────────────────── */}
      <div className="designers__grid">
        {designersArray.map((designer, index) => (
          <div
            key={index}
            className={`designers__item ${selectedIndex === index ? "designers__item--selected" : ""}`}
            onClick={() => handleImageClick(index)}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* circular image */}
            <div className="designers__image-wrapper">
              <Image
                src={designer.imagePath}
                alt={isHebrew ? designer.nameHebrew : designer.nameEnglish}
                fill
                sizes="130px"
                style={{ objectFit: "cover", objectPosition: "top" }}
              />
            </div>

            {/* name and company below image */}
            <p
              className={`designers__name ${selectedIndex === index || hoverIndex === index ? "designers__name--visible" : ""}`}
            >
              {isHebrew ? designer.nameHebrew : designer.nameEnglish}
            </p>
            <p
              className={`designers__company ${selectedIndex === index || hoverIndex === index ? "designers__company--visible" : ""}`}
            >
              {isHebrew
                ? designer.companyNameHebrew
                : designer.companyNameEnglish}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Info Text ────────────────────────────────── */}
      <div className="designers__text">
        {selectedIndex === null ? (
          <p className="designers__placeholder">
            {t.info.designersPlaceholder}
          </p>
        ) : (
          <p
            dangerouslySetInnerHTML={{
              __html: isHebrew
                ? designersArray[selectedIndex].textHebrew
                : designersArray[selectedIndex].textEnglish,
            }}
          />
        )}
      </div>
    </div>
  );
}
