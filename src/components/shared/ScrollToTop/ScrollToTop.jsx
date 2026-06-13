'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// ─── ScrollToTop ──────────────────────────────────────────────
// Scrolls to top on route change, but NOT when only hash changes

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // only scroll to top if there's no hash in the URL
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}