"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { useCart } from "@/contexts/CartContext";
import "./Card.scss";

// ─── Card ─────────────────────────────────────────────────────
export default function Card({ item }) {
  const router = useRouter();
  const t = useTranslations();
  const { cart } = useCart();

  if (!item) return null;

  // ─── Check if this item is already in the cart ───────
  const isInCart = cart?.lines?.edges?.some(
    ({ node }) => node.merchandise.id === item.variantId,
  );

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
        {item.isInStock && isInCart && (
          <span className="card__in-cart">{t.item.inCart || "In Cart"}</span>
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
