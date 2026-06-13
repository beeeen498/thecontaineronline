'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// ─── AnchorScroll ─────────────────────────────────────────────
// Handles smooth scrolling to anchor links
// Accounts for the fixed header height

export default function AnchorScroll() {
  const pathname = usePathname();

  const scrollToHash = (hash) => {
    if (!hash) return;

    const topBar = document.querySelector('.top-bar');
    const offset = topBar ? topBar.getBoundingClientRect().height : 0;

    // ─── Wait for element to exist ──────────────────────
    const attemptScroll = (attempts = 0) => {
      const element = document.querySelector(hash);

      if (!element) {
        if (attempts < 10) {
          setTimeout(() => attemptScroll(attempts + 1), 100);
        }
        return;
      }

      const top = element.getBoundingClientRect().top + window.scrollY - offset - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    };

    attemptScroll();
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // first jump to top instantly so smooth scroll goes downward
    window.scrollTo(0, 0);

    // then wait for page to render and scroll smoothly
    setTimeout(() => scrollToHash(hash), 500);
  }, [pathname]);

  return null;
}