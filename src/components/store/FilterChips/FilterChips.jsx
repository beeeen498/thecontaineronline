'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import './FilterChips.scss';

// ─── FilterChips ──────────────────────────────────────────────
// Shows active filters as removable chips above the product grid
// Takes the same filters config as StoreFilters

export default function FilterChips({ filters }) {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';

  // ─── Build active chips ───────────────────────────────
  const chips = [];

  filters.forEach(filter => {
    if (filter.type === 'radio') {
      if (filter.selected && filter.selected !== 'all') {
        const option = filter.options.find(o => o.value === filter.selected);
        if (option) {
          chips.push({
            key: filter.key,
            label: `${isHebrew ? filter.label.he : filter.label.en}: ${isHebrew ? option.he : option.en}`,
            onRemove: () => filter.onChange('all'),
          });
        }
      }
    }

    if (filter.type === 'checkbox') {
      if (filter.selected && filter.selected.length > 0) {
        filter.selected.forEach(val => {
          const option = filter.options.find(o => o.value === val);
          if (option) {
            chips.push({
              key: `${filter.key}-${val}`,
              label: `${isHebrew ? filter.label.he : filter.label.en}: ${isHebrew ? option.he : option.en}`,
              onRemove: () => filter.onChange(filter.selected.filter(v => v !== val)),
            });
          }
        });
      }
    }
  });

  if (chips.length === 0) return null;

  return (
    <div className={`filter-chips ${isHebrew ? 'filter-chips--rtl' : ''}`}>
      {chips.map(chip => (
        <button
          key={chip.key}
          className="filter-chips__chip"
          onClick={chip.onRemove}
        >
          {chip.label}
          <span className="filter-chips__remove">×</span>
        </button>
      ))}

      {/* clear all button — only shows when more than one chip */}
      {chips.length > 1 && (
        <button
          className="filter-chips__clear"
          onClick={() => filters.forEach(f => f.onChange(f.type === 'checkbox' ? [] : 'all'))}
        >
          {isHebrew ? 'נקה הכל' : 'Clear all'}
        </button>
      )}
    </div>
  );
}