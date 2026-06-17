"use client";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── Read filters from URL ────────────────────────────
  const currentPage = parseInt(searchParams.get("page") || "1");
  const selectedCategory = searchParams.get("category") || "all";
  const selectedBrand =
    searchParams.get("brand")?.split(",").filter(Boolean) || [];
  const selectedColors =
    searchParams.get("colors")?.split(",").filter(Boolean) || [];

  // ─── Update URL params ────────────────────────────────
  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (
        !value ||
        value === "all" ||
        value === "1" ||
        value === 1 ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // ─── Category Options ─────────────────────────────────
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
        const key = p.categoryEnglish.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((p) => ({
        value: p.categoryEnglish.trim(),
        en: p.categoryEnglish.trim(),
        he: p.categoryHebrew?.trim() || p.categoryEnglish.trim(),
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

  // ─── Color Options ────────────────────────────────────────
  const colorValues = [
    ...new Set(products.flatMap((p) => p.colorsEnglish || []).filter(Boolean)),
  ].sort();

  const colorOptions = [
    { value: "all", en: "All", he: "הכל" },
    ...colorValues.map((englishColor) => {
      const product = products.find((p) =>
        p.colorsEnglish?.includes(englishColor),
      );
      const idx = product?.colorsEnglish?.indexOf(englishColor);
      const hebrewColor = product?.colorsHebrew?.[idx];
      return {
        value: englishColor,
        en: englishColor,
        he: hebrewColor || englishColor,
      };
    }),
  ];

  // ─── Filters Config ───────────────────────────────────
  const filters = [
    {
      key: "category",
      label: { en: "Category", he: "קטגוריה" },
      type: "radio",
      options: categoryOptions,
      selected: selectedCategory,
      onChange: (val) => updateParams({ category: val, page: 1 }),
    },
    {
      key: "brand",
      label: { en: "Brand", he: "מותג" },
      type: "checkbox",
      options: brandOptions,
      selected: selectedBrand,
      onChange: (val) => updateParams({ brand: val, page: 1 }),
    },
    {
      key: "colors",
      label: { en: "Colors", he: "צבעים" },
      type: "checkbox",
      options: colorOptions,
      selected: selectedColors,
      onChange: (val) => updateParams({ colors: val, page: 1 }),
    },
  ];

  // ─── Filtering ────────────────────────────────────────
  let filtered = products;

  if (selectedCategory !== "all") {
    filtered = filtered.filter(
      (item) => item.categoryEnglish?.trim() === selectedCategory,
    );
  }

  if (selectedBrand.length > 0) {
    filtered = filtered.filter((item) => selectedBrand.includes(item.brand));
  }

  if (selectedColors.length > 0) {
    filtered = filtered.filter(
      (item) =>
        item.colorsEnglish &&
        selectedColors.some((c) => item.colorsEnglish.includes(c)),
    );
  }

  // ─── Pagination ───────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  console.log(
    "first product colors:",
    products[0]?.colorsEnglish,
    products[0]?.colorsHebrew,
  );

  return (
    <StoreLayout
      filters={filters}
      items={currentItems.map((item) => formatItem(item, isEnglish))}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => updateParams({ page })}
      emptyMessage={t.store.noItems}
    />
  );
}
