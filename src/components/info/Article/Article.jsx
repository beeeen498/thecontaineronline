'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './Article.scss';

// ─── Article ──────────────────────────────────────────────────
// Single article preview card on the InfoPage
// Clicking navigates to the full article page

export default function Article({ id, title, imagePath, copyright }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/info/article/${id}`);
  };

  return (
    <div className="article" onClick={handleClick}>

      {/* ─── Image ──────────────────────────────────────── */}
      <div className="article__image-wrapper">
        <Image
          src={imagePath}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <p className="article__copyright">{copyright}</p>
      </div>

      {/* ─── Title ──────────────────────────────────────── */}
      <h3 className="article__title">{title}</h3>

    </div>
  );
}