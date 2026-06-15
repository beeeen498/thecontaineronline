'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import StoreLayout from '@/components/store/StoreLayout/StoreLayout';

// ─── Items Per Page ───────────────────────────────────────────
const ITEMS_PER_PAGE = 12;

// ─── Format Product ───────────────────────────────────────────
function formatItem(item, isEnglish) {
  const globalPrice = item.globalPrice;
  const israelPrice = parseFloat(item.israelPrice);

  const price = isEnglish
    ? globalPrice && !isNaN(globalPrice) && globalPrice > 0
      ? `$${Math.round(globalPrice)}`
      : ''
    : israelPrice && !isNaN(israelPrice)
      ? `₪${Math.round(israelPrice)}`
      : '';

  return {
    id: item.id,
    handle: item.handle,
    title: isEnglish ? item.englishName : item.hebrewName,
    price,
    imagePath: item.images?.[0] ?? '',
    isInStock: item.inStock,
    typeOfItem: item.typeOfItem,
  };
}

// ─── Art Store Page ───────────────────────────────────────────
export default function ArtStorePage({ products = [] }) {
  const { language } = useLanguage();
  const t = useTranslations();
  const isEnglish = language.toLowerCase() === 'english';

  // ─── Filter State ─────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNumOfItems, setSelectedNumOfItems] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Category Options ─────────────────────────────────
  // Built dynamically from subCategory metafields
  const seen = new Set();
  const categoryOptions = [
    { value: 'all', en: 'All', he: 'הכל' },
    ...products
      .filter(p => p.categoryEnglish && p.categoryEnglish !== 'Fashion' && p.categoryEnglish !== 'Art')
      .filter(p => {
        if (seen.has(p.categoryEnglish)) return false;
        seen.add(p.categoryEnglish);
        return true;
      })
      .map(p => ({
        value: p.categoryEnglish,
        en: p.categoryEnglish,
        he: p.categoryHebrew || p.categoryEnglish,
      })),
  ];

  // ─── Num of Items Options ─────────────────────────────
  const numOfItemsValues = [...new Set(products.map(p => p.numOfItems).filter(Boolean))].sort();
  const numOfItemsOptions = [
    { value: 'all', en: 'All', he: 'הכל' },
    ...numOfItemsValues.map(n => ({ value: n, en: n, he: n })),
  ];

  // ─── Filters Config ───────────────────────────────────
  const filters = [
    {
      key: 'category',
      label: { en: 'Category', he: 'קטגוריה' },
      type: 'radio',
      options: categoryOptions,
      selected: selectedCategory,
      onChange: (val) => { setSelectedCategory(val); setCurrentPage(1); },
    },
    {
      key: 'numOfItems',
      label: { en: 'Number of Items', he: 'מספר פריטים' },
      type: 'radio',
      options: numOfItemsOptions,
      selected: selectedNumOfItems,
      onChange: (val) => { setSelectedNumOfItems(val); setCurrentPage(1); },
    },
  ];

  // ─── Filtering ────────────────────────────────────────
  let filtered = products;

  if (selectedCategory !== 'all') {
    filtered = filtered.filter(item => item.categoryEnglish === selectedCategory);
  }

  if (selectedNumOfItems !== 'all') {
    filtered = filtered.filter(item => item.numOfItems === String(selectedNumOfItems));
  }

  // ─── Pagination ───────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <StoreLayout
      filters={filters}
      items={currentItems.map(item => formatItem(item, isEnglish))}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      emptyMessage={t.store.noItems}
    />
  );
}