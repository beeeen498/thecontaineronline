'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { customerRecover } from '@/lib/shopifyQueries';
import './ResetPage.scss';

// ─── ResetPage ────────────────────────────────────────────────
// Handles password reset requests
// Sends a reset email via Shopify's customerRecover mutation
// Shows success message after submission

export default function ResetPage() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';

  // ─── Form State ───────────────────────────────────────
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ─── Error Translations ───────────────────────────────
  const ERROR_TRANSLATIONS = {
    'Customer not found': 'לא נמצא משתמש עם כתובת אימייל זו',
  };

  // ─── Submit Handler ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await customerRecover(email);

      if (result.customerUserErrors?.length > 0) {
        const msg = result.customerUserErrors[0].message;
        setError(isHebrew ? (ERROR_TRANSLATIONS[msg] || msg) : msg);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(isHebrew ? 'שגיאה בשליחת האימייל' : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`reset-page ${isHebrew ? 'reset-page--rtl' : ''}`}>
      <div className="reset-page__box">

        {/* ─── Heading ──────────────────────────────────── */}
        <h1 className="reset-page__heading">
          {isHebrew ? 'איפוס סיסמה' : 'Reset Password'}
        </h1>

        {/* ─── Success State ────────────────────────────── */}
        {success ? (
          <div className="reset-page__success">
            <p>
              {isHebrew
                ? 'שלחנו לך אימייל עם קישור לאיפוס הסיסמה. בדוק את תיבת הדואר שלך.'
                : 'We sent you an email with a password reset link. Check your inbox.'
              }
            </p>
            <Link href="/account/login" className="reset-page__back">
              {isHebrew ? 'חזרה להתחברות' : 'Back to Login'}
            </Link>
          </div>
        ) : (
          <>
            {/* ─── Description ──────────────────────────── */}
            <p className="reset-page__description">
              {isHebrew
                ? 'הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.'
                : 'Enter your email address and we will send you a password reset link.'
              }
            </p>

            {/* ─── Error Message ────────────────────────── */}
            {error && (
              <p className="reset-page__error">{error}</p>
            )}

            {/* ─── Form ─────────────────────────────────── */}
            <div className="reset-page__form">

              {/* Email */}
              <div className="reset-page__field">
                <label className="reset-page__label">
                  {isHebrew ? 'אימייל' : 'Email'}
                </label>
                <input
                  className="reset-page__input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Submit */}
              <button
                className="reset-page__submit"
                onClick={handleSubmit}
                disabled={isLoading || !email}
              >
                {isLoading
                  ? (isHebrew ? 'שולח...' : 'Sending...')
                  : (isHebrew ? 'שלח קישור לאיפוס' : 'Send Reset Link')
                }
              </button>

            </div>

            {/* ─── Back to Login ────────────────────────── */}
            <Link href="/account/login" className="reset-page__back">
              {isHebrew ? 'חזרה להתחברות' : 'Back to Login'}
            </Link>
          </>
        )}

      </div>
    </div>
  );
}