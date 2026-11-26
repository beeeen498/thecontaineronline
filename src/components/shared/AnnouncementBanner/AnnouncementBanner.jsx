"use client";

import { useTranslations } from "@/hooks/useTranslations";
import "./AnnouncementBanner.scss";

// ─── AnnouncementBanner ───────────────────────────────────────
// Endless scrolling strip at the very top of every page (inside the
// fixed top bar, above the header). Text lives in translations →
// banner. Its height is $banner-height, included in --topbar-height.
//
// Messages alternate: FREE SHIPPING · 100% LEGIT · FREE SHIPPING · …
// Two identical strips scroll side by side; when the first has moved
// fully out, the second is exactly where the first began, so the loop
// is seamless. Each strip repeats the messages enough for wide screens.

const REPEATS = 8; // pairs of messages per strip

export default function AnnouncementBanner() {
  const t = useTranslations();
  const messages = [t.banner.freeShipping, t.banner.legit];
  const text = messages.join(" · ");
  const items = Array.from({ length: REPEATS }, (_, i) =>
    messages.map((message, j) => (
      <span key={`${i}-${j}`} className="announcement-banner__item">
        {message}
      </span>
    )),
  );

  return (
    <div className="announcement-banner" role="note">
      {/* Screen readers read the text once, not the moving copies */}
      <span className="announcement-banner__sr">{text}</span>
      <div className="announcement-banner__track" aria-hidden="true">
        <div className="announcement-banner__strip">{items}</div>
        <div className="announcement-banner__strip">{items}</div>
      </div>
    </div>
  );
}
