"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import {
  IoIosArrowDown,
  IoIosArrowUp,
  IoIosArrowBack,
  IoIosArrowForward,
} from "react-icons/io";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import Breadcrumb from "@/components/shared/Breadcrumb/Breadcrumb";
import YouMayAlsoLike from "@/components/item/YouMayAlsoLike/YouMayAlsoLike";
import returnPolicyData from "@/data/returnPolicyData";
import takingCareData from "@/data/takingCareData";
import ImagePopUp from "@/components/shared/ImagePopUp/ImagePopUp";
import "./ItemPage.scss";

// ─── Constants ────────────────────────────────────────────────
const WHATSAPP_NUMBER = "+972553000357";

// ─── Accordion ────────────────────────────────────────────────
function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="item-page__accordion">
      <button
        className="item-page__accordion-header"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="item-page__accordion-title">{title}</span>
        {isOpen ? <IoIosArrowUp size={14} /> : <IoIosArrowDown size={14} />}
      </button>
      {isOpen && <div className="item-page__accordion-content">{children}</div>}
    </div>
  );
}

// ─── ItemPage ─────────────────────────────────────────────────
// Clean two-column layout — no outer box or shadow
// Left: large image with dot thumbnails
// Right: sticky product details

export default function ItemPage({ product, relatedProducts }) {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === "Hebrew";
  const isEnglish = !isHebrew;
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  // ─── Image State ──────────────────────────────────────
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.images || [];
  const mainImage = images[currentImageIndex] || "";

  const handleCarousel = (dir) => {
    setCurrentImageIndex((prev) =>
      dir === "prev"
        ? prev === 0
          ? images.length - 1
          : prev - 1
        : prev === images.length - 1
          ? 0
          : prev + 1,
    );
  };

  // ─── Preload adjacent images ──────────────────────────
  useEffect(() => {
    if (images.length <= 1) return;
    const prevIdx =
      currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    const nextIdx =
      currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    [prevIdx, nextIdx].forEach((idx) => {
      const img = new window.Image();
      img.src = images[idx];
    });
  }, [currentImageIndex, images]);

  // ─── Product Data ─────────────────────────────────────
  const name = isEnglish ? product.englishName : product.hebrewName;
  const description = isEnglish
    ? product.englishDescription
    : product.hebrewDescription;

  // ─── Price ────────────────────────────────────────────
  const globalPrice = parseFloat(product.globalPrice);
  const israelPrice = parseFloat(product.israelPrice);

  const price = isHebrew
    ? israelPrice && !isNaN(israelPrice)
      ? `₪${israelPrice.toFixed(0)}`
      : ""
    : globalPrice && !isNaN(globalPrice) && globalPrice > 0
      ? `$${globalPrice.toFixed(2)}`
      : "";

  // ─── Return Policy ────────────────────────────────────
  const returnPolicy =
    product.typeOfItem === "art"
      ? isEnglish
        ? returnPolicyData.artReturnPolicyEnglish
        : returnPolicyData.artReturnPolicyHebrew
      : isEnglish
        ? returnPolicyData.fashionReturnPolicyEnglish
        : returnPolicyData.fashionReturnPolicyHebrew;

  // ─── WhatsApp ─────────────────────────────────────────
  const outOfStockMessage = isEnglish
    ? `Hi, I'm interested in ${product.englishName}, is it available?`
    : `שלום, אני מעוניין ב${product.hebrewName}, האם הוא זמין?`;

  const handleWhatsapp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}/?text=${encodeURIComponent(outOfStockMessage)}`,
    );
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  // ─── Image Popup ─────────────────────────────────────────
  const handlePopUpNavigate = (dir) => {
    setCurrentImageIndex((prev) =>
      dir === "prev"
        ? prev === 0
          ? images.length - 1
          : prev - 1
        : prev === images.length - 1
          ? 0
          : prev + 1,
    );
  };

  return (
    <div className={`item-page ${isHebrew ? "item-page--rtl" : ""}`}>
      {/* ─── Breadcrumb ───────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: isHebrew ? "בית" : "Home", href: "/" },
          {
            label:
              product.typeOfItem === "art"
                ? isHebrew
                  ? "אמנות"
                  : "Art"
                : isHebrew
                  ? "אופנה"
                  : "Fashion",
            href: product.typeOfItem === "art" ? "/art" : "/fashion",
          },
          { label: name, href: "#" },
        ]}
      />

      {/* ─── Main Content ─────────────────────────────── */}
      <div className="item-page__content">
        {/* ─── Left — Images ────────────────────────────── */}
        <div className="item-page__left">
          {/* thumbnail strip */}
          {images.length > 1 && (
            <div className="item-page__thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`item-page__thumbnail ${currentImageIndex === idx ? "item-page__thumbnail--active" : ""}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${name} ${idx + 1}`}
                    fill
                    sizes="60px"
                    style={{ objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* main image */}
          <div
            className="item-page__main-image"
            onClick={() => setIsPopUpOpen(true)}
            style={{ cursor: "zoom-in" }}
          >
            {mainImage && (
              <Image
                src={mainImage}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                style={{ objectFit: "contain", objectPosition: "center" }}
                priority
              />
            )}

            {/* prev/next arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="item-page__arrow item-page__arrow--prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCarousel("prev");
                  }}
                  aria-label="Previous image"
                >
                  <IoIosArrowBack size={24} />
                </button>
                <button
                  className="item-page__arrow item-page__arrow--next"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCarousel("next");
                  }}
                  aria-label="Next image"
                >
                  <IoIosArrowForward size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ─── Right — Details ──────────────────────────── */}
        <div className="item-page__right">
          <div className="item-page__sticky">
            {/* name */}
            <h1 className="item-page__name">{name}</h1>

            {/* price */}
            <p className="item-page__price">{price}</p>

            <div className="item-page__divider" />

            {/* description */}
            {description && (
              <p className="item-page__description">{description}</p>
            )}

            {/* ─── Product Details ──────────────────────────── */}
            {product.typeOfItem === "fashion" && (
              <div className="item-page__details">
                {/* brand */}
                {product.brand && (
                  <div className="item-page__detail">
                    <span className="item-page__detail-label">
                      {isHebrew ? "מותג" : "Brand"}
                    </span>
                    <span className="item-page__detail-value">
                      {product.brand}
                    </span>
                  </div>
                )}

                {/* colors */}
                {(isEnglish ? product.colorsEnglish : product.colorsHebrew)
                  ?.length > 0 && (
                  <div className="item-page__detail">
                    <span className="item-page__detail-label">
                      {isHebrew ? "צבע" : "Color"}
                    </span>
                    <span className="item-page__detail-value">
                      {(isEnglish
                        ? product.colorsEnglish
                        : product.colorsHebrew
                      ).join(", ")}
                    </span>
                  </div>
                )}

                {/* size */}
                {(isEnglish ? product.englishSize : product.hebrewSize) && (
                  <div className="item-page__detail">
                    <span className="item-page__detail-label">
                      {isHebrew ? "מידה" : "Size"}
                    </span>
                    <span className="item-page__detail-value">
                      {isEnglish ? product.englishSize : product.hebrewSize}
                    </span>
                  </div>
                )}

                {/* condition */}
                {(isEnglish
                  ? product.englishCondition
                  : product.hebrewCondition) && (
                  <div className="item-page__detail">
                    <span className="item-page__detail-label">
                      {isHebrew ? "מצב" : "Condition"}
                    </span>
                    <span className="item-page__detail-value">
                      {isEnglish
                        ? product.englishCondition
                        : product.hebrewCondition}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* art specific */}
            {product.typeOfItem === "art" && product.numOfItems && (
              <div className="item-page__details">
                <div className="item-page__detail">
                  <span className="item-page__detail-label">
                    {isHebrew ? "כמות פריטים" : "Number of Items"}
                  </span>
                  <span className="item-page__detail-value">
                    {product.numOfItems}
                  </span>
                </div>
              </div>
            )}

            {/* out of stock button */}
            {!product.inStock && (
              <button className="item-page__cta" onClick={handleWhatsapp}>
                {t.item.moreInfo}
              </button>
            )}

            <div className="item-page__divider" />

            {/* accordions */}
            <div className="item-page__accordions">
              <Accordion title={t.item.returnPolicy}>
                <p>{returnPolicy}</p>
              </Accordion>

              {product.typeOfItem === "art" && (
                <Accordion title={t.item.careInstructions}>
                  <p>
                    {isEnglish
                      ? takingCareData.takingCareEnglish
                      : takingCareData.takingCareHebrew}
                  </p>
                </Accordion>
              )}
            </div>

            {/* share */}
            <div className="item-page__share">
              <button
                className="item-page__share-icon"
                onClick={() =>
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`,
                    "_blank",
                  )
                }
                aria-label="Share on WhatsApp"
              >
                <FaWhatsapp size={18} />
              </button>
              <button
                className="item-page__share-icon"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                    "_blank",
                  )
                }
                aria-label="Share on Facebook"
              >
                <CiFacebook size={18} />
              </button>
              <button
                className="item-page__share-icon"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
                    "_blank",
                  )
                }
                aria-label="Share on X"
              >
                <FaXTwitter size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── You May Also Like ────────────────────────── */}
      <YouMayAlsoLike
        products={relatedProducts}
        currentHandle={product.handle}
      />

      {/* ─── Image PopUp ──────────────────────────────── */}
      {isPopUpOpen && (
        <ImagePopUp
          images={images}
          currentIndex={currentImageIndex}
          onClose={() => setIsPopUpOpen(false)}
          onNavigate={handlePopUpNavigate}
        />
      )}
    </div>
  );
}
