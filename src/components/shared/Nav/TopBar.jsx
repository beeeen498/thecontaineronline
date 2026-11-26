"use client";

import { useState } from "react";
import Header from "./Header";
import Nav from "./Nav";
import AnnouncementBanner from "@/components/shared/AnnouncementBanner/AnnouncementBanner";

// ─── TopBar ───────────────────────────────────────────────────
// Announcement banner on top, then Header and Nav (sharing isMenuOpen state)
// Header controls the hamburger, Nav renders the mobile menu

export default function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="top-bar">
      <AnnouncementBanner />
      <Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      />
      <Nav isMenuOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
