'use client';

import { AiFillInstagram, AiFillFacebook } from 'react-icons/ai';
import { IoLogoWhatsapp } from 'react-icons/io';
import { useLanguage } from '@/contexts/LanguageContext';
import './Hero.scss';

// ─── Social Links ─────────────────────────────────────────────
const WHATSAPP_NUMBER = '+972553000357';

// ─── Hero ─────────────────────────────────────────────────────
// Full height section with a video in a contained box
// Socials bar on the left side of the box

export default function Hero() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';

  const handleWhatsapp = () => {
    const message = isHebrew ? 'שלום! יש לי שאלה :)' : 'Hello! I have a question :)';
    window.open(`https://wa.me/${WHATSAPP_NUMBER}/?text=${message}`);
  };

  return (
    <section className="hero">
      <div className="hero__content">

        {/* ─── Socials Bar ──────────────────────────────── */}
        <div className="hero__socials">
          <ul className="hero__socials-list">
            <li>
              <a href="https://www.instagram.com/thecontainer.online/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <AiFillInstagram size={30} />
              </a>
            </li>
            <li>
              <a href="" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <AiFillFacebook size={30} />
              </a>
            </li>
            <li>
              <button onClick={handleWhatsapp} aria-label="WhatsApp">
                <IoLogoWhatsapp size={30} />
              </button>
            </li>
          </ul>
        </div>

        {/* ─── Video ────────────────────────────────────── */}
        <div className="hero__video-wrapper">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hero__video"
          >
            <source src="/assets/videos/hero-video-1080.mp4" type="video/mp4" />
          </video>
        </div>

      </div>
    </section>
  );
}