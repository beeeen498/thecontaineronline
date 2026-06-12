"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import "./Card.scss";

// ─── Card ─────────────────────────────────────────────────────
// Single product card used in store pages and featured items
// Clicking navigates to the product page

export default function Card({ item }) {
  const router = useRouter();
  const t = useTranslations();

  if (!item) return null;

  const handleClick = () => {
    router.push(`/item/${item.handle}`);
  };

  return (
    <div className="card" onClick={handleClick}>
      {/* ─── Image ──────────────────────────────────────── */}
      <div className="card__image-wrapper">
        <Image
          src={item.imagePath}
          alt={item.title || "Product"}
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="(max-width: 630px) 150px, (max-width: 830px) 200px, 300px"
        />
        {!item.isInStock && (
          <span className="card__sold-out">{t.item.soldOut}</span>
        )}
      </div>

      {/* ─── Details ────────────────────────────────────── */}
      <div className="card__details">
        <h2 className="card__name">{item.title}</h2>
        <p className="card__price">{item.price}</p>
      </div>
    </div>
  );
}
