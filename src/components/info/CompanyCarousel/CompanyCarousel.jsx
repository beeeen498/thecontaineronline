'use client';

import { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import companiesInfo from '@/data/companiesInfo';
import CompanyCard from '@/components/info/CompanyCard/CompanyCard';
import './CompanyCarousel.scss';

// ─── Company Carousel ─────────────────────────────────────────
// Stacked card carousel showing luxury brand cards
// Arrows navigate between companies
// Text below shows the selected company history

export default function CompanyCarousel() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';
  const companyKeys = Object.keys(companiesInfo);

  const [currentIndex, setCurrentIndex] = useState(
    Math.floor(companyKeys.length / 2)
  );

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % companyKeys.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => prev === 0 ? companyKeys.length - 1 : prev - 1);
  };

  // ─── Card Style ───────────────────────────────────────
  const getCardStyle = (index) => {
    const distance = Math.abs(index - currentIndex);
    const offset = distance * 120;
    const scale = 1 - 0.2 * distance / 2;

    return {
      transform: `translateX(${index > currentIndex ? offset : -offset}px) scale(${scale})`,
      zIndex: -distance,
      filter: distance === 0 ? 'none' : 'blur(2px)',
    };
  };

  return (
    <div className="company-carousel">

      {/* ─── Cards ──────────────────────────────────────── */}
      <div className="company-carousel__cards">
        {companyKeys.map((key, index) => {
          const company = companiesInfo[key];
          return (
            <div
              key={index}
              style={getCardStyle(index)}
              className={`company-carousel__card ${index === currentIndex ? 'company-carousel__card--focused' : 'company-carousel__card--blurred'}`}
            >
              <CompanyCard
                name={company.name}
                imagePath={company.imagePath}
                isFocused={index === currentIndex}
              />
            </div>
          );
        })}
      </div>

      {/* ─── Controls ───────────────────────────────────── */}
      <div className="company-carousel__controls">
        <FaAngleLeft
          size={40}
          className="company-carousel__arrow"
          onClick={handlePrev}
        />
        <p className={`company-carousel__text ${isHebrew ? 'company-carousel__text--rtl' : ''}`}>
          {isHebrew
            ? companiesInfo[companyKeys[currentIndex]].historyHe
            : companiesInfo[companyKeys[currentIndex]].historyEn
          }
        </p>
        <FaAngleRight
          size={40}
          className="company-carousel__arrow"
          onClick={handleNext}
        />
      </div>

    </div>
  );
}