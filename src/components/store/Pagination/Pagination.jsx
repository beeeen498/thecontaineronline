'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import './Pagination.scss';

// ─── Pagination ───────────────────────────────────────────────
// Shared pagination component used by Art and Fashion store pages
// Scrolls to top on page change

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';

  if (totalPages <= 1) return null;

  const handlePrev = () => {
    window.scrollTo(0, 0);
    onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    window.scrollTo(0, 0);
    onPageChange(currentPage + 1);
  };

  return (
    <div className={`pagination ${isHebrew ? 'pagination--rtl' : ''}`}>
      <button
        className="pagination__btn"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      <span className="pagination__info">
        {isHebrew
          ? `עמוד ${currentPage} מתוך ${totalPages}`
          : `Page ${currentPage} of ${totalPages}`
        }
      </span>

      <button
        className="pagination__btn"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
}