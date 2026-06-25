'use client';

import { useRouter, useSearchParams } from 'next/navigation';
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
    variantId: item.variantId,
  };
}

// ─── Art Store Page ───────────────────────────────────────────
export default function ArtStorePage({ products = [] }) {
  const { language } = useLanguage();
  const t = useTranslations();
  const isEnglish = language.toLowerCase() === 'english';
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── Read filters from URL ────────────────────────────
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedNumOfItems = searchParams.get('numOfItems') || 'all';

  // ─── Update URL params ────────────────────────────────
  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'all' || value === '1' || value === 1) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // ─── Category Options ─────────────────────────────────
  const seen = new Set();
  const categoryOptions = [
    { value: 'all', en: 'All', he: 'הכל' },
    ...products
      .filter(p => p.categoryEnglish && p.categoryEnglish !== 'Fashion' && p.categoryEnglish !== 'Art')
      .filter(p => {
        const key = p.categoryEnglish.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(p => ({
        value: p.categoryEnglish.trim(),
        en: p.categoryEnglish.trim(),
        he: p.categoryHebrew?.trim() || p.categoryEnglish.trim(),
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
      onChange: (val) => updateParams({ category: val, page: 1 }),
    },
    {
      key: 'numOfItems',
      label: { en: 'Number of Items', he: 'מספר פריטים' },
      type: 'radio',
      options: numOfItemsOptions,
      selected: selectedNumOfItems,
      onChange: (val) => updateParams({ numOfItems: val, page: 1 }),
    },
  ];

  // ─── Filtering ────────────────────────────────────────
  let filtered = products;

  if (selectedCategory !== 'all') {
    filtered = filtered.filter(item => item.categoryEnglish?.trim() === selectedCategory);
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
      onPageChange={(page) => updateParams({ page })}
      emptyMessage={t.store.noItems}
    />
  );
}