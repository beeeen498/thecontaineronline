"use client";

import { useState } from "react";
import { LuSlidersHorizontal } from "react-icons/lu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import StoreFilters from "@/components/store/StoreFilters/StoreFilters";
import Pagination from "@/components/store/Pagination/Pagination";
import Card from "@/components/shared/Card/Card";
import "./StoreLayout.scss";

// ─── Store Layout ─────────────────────────────────────────────
// Shared layout for Art and Fashion store pages
// Handles: mobile filter panel, cards grid, pagination
// Each store passes its own filters config and formatted items

export default function StoreLayout({
  filters,
  items,
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage,
}) {
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";

  // ─── Mobile Filter Panel State ────────────────────────
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const openFilter = () => {
    setIsAnimating(true);
    setIsFilterOpen(true);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <section className={`store-layout ${isHebrew ? "store-layout--rtl" : ""}`}>
      {/* ─── Mobile Filter Button ───────────────────────── */}
      <div className="store-layout__mobile-filter-btn">
        <button onClick={openFilter}>
          <LuSlidersHorizontal size={20} />
          {isHebrew ? "סינון" : "Filters"}
        </button>
      </div>

      <div className="store-layout__main">
        {/* ─── Filters Wrapper ────────────────────────────── */}
        <div
          className={`store-layout__filters-wrapper ${isFilterOpen ? "store-layout__filters-wrapper--open" : ""}`}
        >
          {/* overlay */}
          <div
            className="store-layout__filters-overlay"
            onClick={closeFilter}
          />

          {/* panel */}
          <div
            className={`store-layout__filters-panel ${isHebrew ? "store-layout__filters-panel--rtl" : ""} ${isAnimating ? "store-layout__filters-panel--animating" : ""}`}
          >
            <button
              className="store-layout__filters-close"
              onClick={closeFilter}
            >
              ✕
            </button>
            <StoreFilters filters={filters} />
          </div>
        </div>

        {/* ─── Right Side — cards + pagination ────────────── */}
        <div className="store-layout__right">
          {/* ─── Cards ────────────────────────────────────── */}
          <div className="store-layout__cards">
            {items.length === 0 ? (
              <p className="store-layout__empty">{emptyMessage}</p>
            ) : (
              items.map((item, idx) => <Card key={idx} item={item} />)
            )}
          </div>

          {/* ─── Pagination ───────────────────────────────── */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </section>
  );
}
