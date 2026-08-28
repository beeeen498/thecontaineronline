"use client";

import { useState } from "react";
import Header from "./Header";
import Nav from "./Nav";

// ─── TopBar ───────────────────────────────────────────────────
// Wraps Header and Nav to share isMenuOpen state
// Header controls the hamburger, Nav renders the mobile menu

export default function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="top-bar">
      <Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      />
      <Nav isMenuOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
