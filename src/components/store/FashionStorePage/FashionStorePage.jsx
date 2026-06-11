"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import StoreLayout from "@/components/store/StoreLayout/StoreLayout";

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

// ─── Fashion Store Page ───────────────────────────────────────
// Handles fashion-specific filtering logic
// Passes formatted items and filters config to StoreLayout

export default function FashionStorePage({ products = [] }) {
  const { language } = useLanguage();
  const t = useTranslations();
  const isEnglish = language.toLowerCase() === "english";

  // ─── Filter State ─────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Category Options ─────────────────────────────────
  const defaultCategories = [
    { value: "shirts", en: "Shirts", he: "חולצות" },
    { value: "sweatshirts", en: "Sweatshirts", he: "סווטשירטים" },
    { value: "shoes", en: "Shoes", he: "נעליים" },
    { value: "bags", en: "Bags", he: "תיקים" },
    { value: "belts", en: "Belts", he: "חגורות" },
    { value: "wallets", en: "Wallets", he: "ארנקים" },
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

  // ─── Brand Options ────────────────────────────────────
  const brandValues = [
    ...new Set(products.map((p) => p.brand).filter(Boolean)),
  ].sort();
  const brandOptions = [
    { value: "all", en: "All", he: "הכל" },
    ...brandValues.map((b) => ({ value: b, en: b, he: b })),
  ];

  // ─── Color Options ────────────────────────────────────
  const colorValues = [
    ...new Set(
      products
        .flatMap((p) =>
          isEnglish ? p.colorsEnglish || [] : p.colorsHebrew || [],
        )
        .filter(Boolean),
    ),
  ].sort();
  const colorOptions = [
    { value: "all", en: "All", he: "הכל" },
    ...colorValues.map((c) => ({ value: c, en: c, he: c })),
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
        setSelectedBrand([]);
        setCurrentPage(1);
      },
    },
    {
      key: "brand",
      label: { en: "Brand", he: "מותג" },
      type: "checkbox",
      options: brandOptions,
      selected: selectedBrand,
      onChange: (val) => {
        setSelectedBrand(val);
        setCurrentPage(1);
      },
    },
    {
      key: "colors",
      label: { en: "Colors", he: "צבעים" },
      type: "checkbox",
      options: colorOptions,
      selected: selectedColors,
      onChange: (val) => {
        setSelectedColors(val);
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

  if (selectedBrand.length > 0) {
    filtered = filtered.filter((item) => selectedBrand.includes(item.brand));
  }

  if (selectedColors.length > 0) {
    filtered = filtered.filter((item) => {
      const itemColors = isEnglish ? item.colorsEnglish : item.colorsHebrew;
      return itemColors && selectedColors.every((c) => itemColors.includes(c));
    });
  }

  // ─── Pagination ───────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <StoreLayout
      filters={filters}
      items={currentItems.map((item) => formatItem(item, isEnglish))}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      emptyMessage={t.store.noItems}
    />
  );
}
