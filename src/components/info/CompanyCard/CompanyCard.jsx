import Image from 'next/image';
import './CompanyCard.scss';

// ─── CompanyCard ──────────────────────────────────────────────
// Single card in the company carousel on the InfoPage
// Shows company logo and name
// isFocused controls the visual state (center vs side cards)

export default function CompanyCard({ name, imagePath, isFocused }) {
  return (
    <div className={`company-card ${isFocused ? 'company-card--focused' : 'company-card--blurred'}`}>

      {/* ─── Logo ───────────────────────────────────────── */}
      <div
        className="company-card__logo"
        style={{ backgroundImage: `url(${imagePath})` }}
      />

      {/* ─── Name ───────────────────────────────────────── */}
      <h2 className="company-card__name">{name}</h2>

    </div>
  );
}