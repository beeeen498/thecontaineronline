"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import StoreLayout from "@/components/store/StoreLayout/StoreLayout";

// ─── Items Per Page ───────────────────────────────────────────
const ITEMS_PER_PAGE = 12;

// ─── Format Product ───────────────────────────────────────────
function formatItem(item, isEnglish) {
  const globalPrice = item.globalPrice;
  const israelPrice = parseFloat(item.israelPrice);

  const price = isEnglish
    ? globalPrice && !isNaN(globalPrice) && globalPrice > 0
      ? `$${Math.round(globalPrice)}`
      : ""
    : israelPrice && !isNaN(israelPrice)
      ? `₪${Math.round(israelPrice)}`
      : "";

  return {
    id: item.id,
    handle: item.handle,
    title: isEnglish ? item.englishName : item.hebrewName,
    price,
    imagePath: item.images?.[0] ?? "",
    isInStock: item.inStock,
    typeOfItem: item.typeOfItem,
  };
}

// ─── Fashion Store Page ───────────────────────────────────────
export default function FashionStorePage({ products = [] }) {
  const { language } = useLanguage();
  const t = useTranslations();
  const isEnglish = language.toLowerCase() === "english";

  // ─── Filter State ─────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get("page") || "1");

  const setCurrentPage = (page) => {
    router.push(`?page=${page}`, { scroll: false });
  };

  // ─── Category Options ─────────────────────────────────
  // Built dynamically from subCategory metafields
  const seen = new Set();
  const categoryOptions = [
    { value: "all", en: "All", he: "הכל" },
    ...products
      .filter(
        (p) =>
          p.categoryEnglish &&
          p.categoryEnglish !== "Fashion" &&
          p.categoryEnglish !== "Art",
      )
      .filter((p) => {
        if (seen.has(p.categoryEnglish)) return false;
        seen.add(p.categoryEnglish);
        return true;
      })
      .map((p) => ({
        value: p.categoryEnglish,
        en: p.categoryEnglish,
        he: p.categoryHebrew || p.categoryEnglish,
      })),
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
