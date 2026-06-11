"use client";

import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import "./StoreFilters.scss";

// ─── Accordion ────────────────────────────────────────────────
// Single collapsible filter section
function Accordion({ title, selectedOption, isOpen, onToggle, children }) {
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";

  return (
    <div className="store-filters__accordion">
      <div className="store-filters__accordion-header" onClick={onToggle}>
        <span className="store-filters__accordion-title">{title}</span>
        <span className="store-filters__accordion-selected">
          {selectedOption}
        </span>
        <span
          className={`store-filters__accordion-arrow ${isHebrew ? "store-filters__accordion-arrow--rtl" : ""}`}
        >
          {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </span>
      </div>
      {isOpen && (
        <div className="store-filters__accordion-content">{children}</div>
      )}
    </div>
  );
}

// ─── StoreFilters ─────────────────────────────────────────────
// Shared filter sidebar for Art and Fashion store pages
// Takes a filters config array — each item defines one accordion
//
// filters prop shape:
// [
//   {
//     key: 'category',
//     label: { en: 'Category', he: 'קטגוריה' },
//     type: 'radio',
//     options: [{ value: 'all', en: 'All', he: 'הכל' }, ...],
//     selected: 'all',
//     onChange: fn,
//   }
// ]

export default function StoreFilters({ filters }) {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === "Hebrew";
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (key) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const getSelectedLabel = (filter) => {
    if (filter.type === "radio") {
      const selected = filter.options.find((o) => o.value === filter.selected);
      if (!selected || filter.selected === "all") {
        return isHebrew ? "הכל" : "All";
      }
      return isHebrew ? selected.he : selected.en;
    }

    if (filter.type === "checkbox") {
      if (!filter.selected || filter.selected.length === 0) {
        return isHebrew ? "הכל" : "All";
      }
      if (filter.selected.length > 1) {
        return isHebrew ? "רבים" : "Multiple";
      }
      const selected = filter.options.find(
        (o) => o.value === filter.selected[0],
      );
      return selected
        ? isHebrew
          ? selected.he
          : selected.en
        : filter.selected[0];
    }

    return "";
  };

  return (
    <div
      className={`store-filters ${isHebrew ? "store-filters--border-left" : "store-filters--border-right"}`}
    >
      {filters.map((filter) => (
        <Accordion
          key={filter.key}
          title={isHebrew ? filter.label.he : filter.label.en}
          selectedOption={getSelectedLabel(filter)}
          isOpen={openAccordion === filter.key}
          onToggle={() => toggleAccordion(filter.key)}
        >
          {filter.options.map((option) => (
            <div key={option.value} className="store-filters__option">
              <input
                type={
                  filter.type === "checkbox" && option.value !== "all"
                    ? "checkbox"
                    : "radio"
                }
                id={`${filter.key}-${option.value}`}
                name={filter.key}
                value={option.value}
                checked={
                  filter.type === "radio"
                    ? filter.selected === option.value
                    : option.value === "all"
                      ? !filter.selected || filter.selected.length === 0
                      : filter.selected?.includes(option.value)
                }
                onChange={() => {
                  if (filter.type === "radio") {
                    filter.onChange(option.value);
                  } else {
                    if (option.value === "all") {
                      filter.onChange([]);
                    } else {
                      const current = filter.selected || [];
                      const updated = current.includes(option.value)
                        ? current.filter((v) => v !== option.value)
                        : [...current, option.value];
                      filter.onChange(updated);
                    }
                  }
                }}
              />
              <label
                className="store-filters__option-label"
                htmlFor={`${filter.key}-${option.value}`}
              >
                {option.value === "all"
                  ? isHebrew
                    ? "הכל"
                    : "All"
                  : isHebrew
                    ? option.he
                    : option.en}
              </label>
            </div>
          ))}
        </Accordion>
      ))}
    </div>
  );
}
