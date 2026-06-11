"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import Card from "@/components/shared/Card/Card";
import StoreFilters from "@/components/store/StoreFilters/StoreFilters";
import Pagination from "@/components/store/Pagination/Pagination";
import { LuSlidersHorizontal } from "react-icons/lu";
import "./ArtStorePage.scss";

// ─── Items Per Page ───────────────────────────────────────────
const ITEMS_PER_PAGE = 12;

// ─── Format Product ───────────────────────────────────────────
function formatItem(item, isEnglish) {
  return {
    id: item.id,
    title: isEnglish ? item.englishName : item.hebrewName,
    price: isEnglish ? item.globalPrice : item.israelPrice,
    imagePath: item.images?.[0] ?? "",
    isInStock: item.inStock,
    typeOfItem: item.typeOfItem,
  };
}

// ─── Art Store Page ───────────────────────────────────────────
// Client component — receives products from server, handles filtering
// and pagination on the client side
export default function ArtStorePage({ products = [] }) {
  const { language } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const t = useTranslations();
  const isEnglish = language.toLowerCase() === "english";
  const isHebrew = language === "Hebrew";

  const openFilter = () => {
    setIsAnimating(true);
    setIsFilterOpen(true);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // ─── Filter State ─────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedNumOfItems, setSelectedNumOfItems] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Category Options ─────────────────────────────────
  const defaultCategories = [
    { value: "tableware", en: "Tableware", he: "כלי שולחן" },
    { value: "vase", en: "Vases", he: "אגרטלים" },
    { value: "cups", en: "Cups", he: "כוסות" },
    { value: "bowls", en: "Bowls", he: "קערות" },
    { value: "pots", en: "Pots", he: "כדים" },
    { value: "plates", en: "Plates", he: "צלחות הגשה" },
    { value: "ashtrays", en: "Ashtrays", he: "מאפרות" },
  ];

  const dynamicCategories = [
    ...new Set(products.map((p) => p.categoryEnglish).filter(Boolean)),
  ].map((val) => {
    const match = defaultCategories.find((c) => c.value === val);
    return match ?? { value: val, en: val, he: val };
  });

  const categoryOptions = [
    { value: "all", en: "All", he: "הכל" },
    ...(dynamicCategories.length > 0 ? dynamicCategories : defaultCategories),
  ];

  // ─── Num of Items Options ─────────────────────────────
  const numOfItemsValues = [
    ...new Set(products.map((p) => p.numOfItems).filter(Boolean)),
  ].sort();
  const numOfItemsOptions = [
    { value: "all", en: "All", he: "הכל" },
    ...numOfItemsValues.map((n) => ({ value: n, en: n, he: n })),
  ];

  // ─── Filters Config ───────────────────────────────────
  const filters = [
    {
      key: "category",
      label: { en: "Category", he: "קטגוריה" },
      type: "radio",
      options: categoryOptions,
      selected: selectedCategory,
      onChange: (val) => {
        setSelectedCategory(val);
        setCurrentPage(1);
      },
    },
    {
      key: "numOfItems",
      label: { en: "Number of Items", he: "מספר פריטים" },
      type: "radio",
      options: numOfItemsOptions,
      selected: selectedNumOfItems,
      onChange: (val) => {
        setSelectedNumOfItems(val);
        setCurrentPage(1);
      },
    },
  ];

  // ─── Filtering ────────────────────────────────────────
  let filtered = products;

  if (selectedCategory !== "all") {
    filtered = filtered.filter(
      (item) => item.categoryEnglish === selectedCategory,
    );
  }

  if (selectedNumOfItems !== "all") {
    filtered = filtered.filter(
      (item) => item.numOfItems === String(selectedNumOfItems),
    );
  }

  // ─── Pagination ───────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <section className={`art-store ${isHebrew ? "art-store--rtl" : ""}`}>
      {/* ─── Mobile Filter Button ─────────────────────── */}
      <div className="art-store__mobile-filter-btn">
        <button onClick={openFilter}>
          <LuSlidersHorizontal size={20} />
          {isHebrew ? "סינון" : "Filters"}
        </button>
      </div>

      <div className="art-store__main">
        {/* ─── Filters wrapper ──────────────────────────── */}
        <div
          className={`art-store__filters-wrapper ${isFilterOpen ? "art-store__filters-wrapper--open" : ""}`}
        >
          {/* overlay */}
          <div className="art-store__filters-overlay" onClick={closeFilter} />

          {/* panel */}
          <div
            className={`art-store__filters-panel ${isHebrew ? "art-store__filters-panel--rtl" : ""} ${isAnimating ? "art-store__filters-panel--animating" : ""}`}
          >
            <button className="art-store__filters-close" onClick={closeFilter}>
              ✕
            </button>
            <StoreFilters filters={filters} />
          </div>
        </div>

        {/* ─── Right side — cards + pagination ─────────── */}
        <div className="art-store__right">
          <div className="art-store__cards">
            {currentItems.length === 0 ? (
              <p className="art-store__empty">{t.store.noItems}</p>
            ) : (
              currentItems.map((item, idx) => (
                <Card key={idx} item={formatItem(item, isEnglish)} />
              ))
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </section>
  );
}
