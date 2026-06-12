"use client";

import { useEffect } from "react";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import "./ImagePopUp.scss";

// ─── ImagePopUp ───────────────────────────────────────────────
// Fullscreen image lightbox
// Click outside or X to close
// Arrow keys and buttons to navigate

export default function ImagePopUp({
  images,
  currentIndex,
  onClose,
  onNavigate,
}) {
  // ─── Keyboard Navigation ──────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate("prev");
      if (e.key === "ArrowRight") onNavigate("next");
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNavigate]);

  // ─── Prevent body scroll ──────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ─── Preload adjacent images ──────────────────────────
  useEffect(() => {
    const prevIdx = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    const nextIdx = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    [prevIdx, nextIdx].forEach((idx) => {
      const img = new window.Image();
      img.src = images[idx];
    });
  }, [currentIndex, images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="image-popup" onClick={onClose}>
      {/* ─── Close Button ───────────────────────────────── */}
      <button
        className="image-popup__close"
        onClick={onClose}
        aria-label="Close"
      >
        <IoMdClose size={32} />
      </button>

      {/* ─── Image ──────────────────────────────────────── */}
      <div
        className="image-popup__image-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          width={1200}
          height={1200}
          style={{
            objectFit: "contain",
            maxWidth: "90vw",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
          }}
          priority
        />
      </div>

      {/* ─── Navigation ─────────────────────────────────── */}
      {images.length > 1 && (
        <>
          <button
            className="image-popup__arrow image-popup__arrow--prev"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("prev");
            }}
            aria-label="Previous image"
          >
            <IoIosArrowBack size={32} />
          </button>
          <button
            className="image-popup__arrow image-popup__arrow--next"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("next");
            }}
            aria-label="Next image"
          >
            <IoIosArrowForward size={32} />
          </button>
        </>
      )}

      {/* ─── Counter ────────────────────────────────────── */}
      <p className="image-popup__counter">
        {currentIndex + 1} / {images.length}
      </p>
    </div>
  );
}
