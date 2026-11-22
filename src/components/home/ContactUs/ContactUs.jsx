'use client';

import { useState } from 'react';
import { BsFillTelephoneFill } from 'react-icons/bs';
import { IoLogoWhatsapp } from 'react-icons/io';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { sendContactEmail } from '@/app/actions/sendEmail';
import './ContactUs.scss';

// ─── Constants ────────────────────────────────────────────────
const PHONE_NUMBER = '+972553000357';

// ─── ContactUs ────────────────────────────────────────────────
// Contact form with email sending via Resend
// Fields: full name, phone, email, message

export default function ContactUs() {
  const { language } = useLanguage();
  const t = useTranslations();
  const isHebrew = language === 'Hebrew';

  // ─── State ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: '',
    website: '', // honeypot — hidden from real visitors
  });

  const [errors, setErrors] = useState({});
  const [sendError, setSendError] = useState(null);
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ─── Handlers ───────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsapp = () => {
    const message = isHebrew ? 'שלום! יש לי שאלה :)' : 'Hello! I have a question :)';
    window.open(`https://wa.me/${PHONE_NUMBER}/?text=${encodeURIComponent(message)}`);
  };

  // ─── Validation ─────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'fullName';
    if (!formData.phone.trim()) {
      newErrors.phone = 'phone';
    } else if (!/^[0-9+\-()\s]{6,30}$/.test(formData.phone.trim())) {
      newErrors.phone = 'phoneInvalid';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'emailInvalid';
    }
    if (!formData.message.trim()) newErrors.message = 'message';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSendError(null);
    let result;
    try {
      result = await sendContactEmail(formData);
    } catch {
      result = { success: false };
    }
    setIsLoading(false);

    if (result.success) {
      setIsSent(true);
      setFormData({ fullName: '', phone: '', email: '', message: '', website: '' });
    } else {
      setSendError(result.error === 'rate_limited' ? 'rateLimited' : 'sendFailed');
    }
  };

  return (
    <section
      id="contact"
      className={`contact ${isHebrew ? 'contact--rtl' : ''}`}
    >
      <div className="contact__inner">

        {/* ─── Heading ──────────────────────────────────── */}
        <div className="contact__text">
          <h2 className="contact__heading">{t.contact.heading}</h2>
          <p className="contact__description">{t.contact.text}</p>
        </div>

        {/* ─── Form ─────────────────────────────────────── */}
        <form className="contact__form" onSubmit={handleSubmit}>

          {/* full name */}
          <input
            type="text"
            name="fullName"
            placeholder={t.contact.fullName}
            maxLength={100}
            value={formData.fullName}
            onChange={handleChange}
            dir={isHebrew ? 'rtl' : 'ltr'}
          />
          {errors.fullName && (
            <span className="contact__error">{t.contact.errors[errors.fullName]}</span>
          )}

          {/* phone */}
          <input
            type="tel"
            name="phone"
            placeholder={t.contact.phone}
            maxLength={30}
            value={formData.phone}
            onChange={handleChange}
            dir={isHebrew ? 'rtl' : 'ltr'}
          />
          {errors.phone && (
            <span className="contact__error">{t.contact.errors[errors.phone]}</span>
          )}

          {/* email */}
          <input
            type="email"
            name="email"
            placeholder={t.contact.email}
            maxLength={200}
            value={formData.email}
            onChange={handleChange}
            dir={isHebrew ? 'rtl' : 'ltr'}
          />
          {errors.email && (
            <span className="contact__error">{t.contact.errors[errors.email]}</span>
          )}

          {/* message */}
          <textarea
            name="message"
            placeholder={t.contact.message}
            maxLength={5000}
            value={formData.message}
            onChange={handleChange}
            dir={isHebrew ? 'rtl' : 'ltr'}
          />
          {errors.message && (
            <span className="contact__error">{t.contact.errors[errors.message]}</span>
          )}

          {/* honeypot — hidden from people and screen readers, bots fill it */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clipPath: 'inset(50%)', opacity: 0, pointerEvents: 'none' }}
          />

          {sendError && (
            <span className="contact__error" role="alert">{t.contact.errors[sendError]}</span>
          )}

          {/* submit */}
          <button
            type="submit"
            className={`contact__btn ${isSent ? 'contact__btn--sent' : ''}`}
            disabled={isLoading || isSent}
          >
            {isSent ? t.contact.sent : isLoading ? '...' : t.contact.send}
          </button>

        </form>

        {/* ─── Icons ────────────────────────────────────── */}
        <div className="contact__icons">
          <a href={`tel:${PHONE_NUMBER}`} aria-label="Phone">
            <BsFillTelephoneFill size={30} />
          </a>
          <button onClick={handleWhatsapp} aria-label="WhatsApp">
            <IoLogoWhatsapp size={30} />
          </button>
        </div>

      </div>
    </section>
  );
}