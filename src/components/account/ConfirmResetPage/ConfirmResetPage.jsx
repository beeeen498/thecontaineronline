'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { customerResetByUrl } from '@/lib/shopifyQueries';
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import './ConfirmResetPage.scss';

// ─── ConfirmResetPage ─────────────────────────────────────────
// Handles the actual password reset after clicking email link
// Reads reset_url from URL params
// Calls customerResetByUrl mutation with new password

export default function ConfirmResetPage() {
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetUrl = searchParams.get('reset_url');

  // ─── Form State ───────────────────────────────────────
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  // ─── Error Translations ───────────────────────────────
  const ERROR_TRANSLATIONS = {
    'Token expired': 'הקישור פג תוקף, בקש קישור חדש',
    'Customer reset token is invalid': 'הקישור אינו תקין, בקש קישור חדש',
  };

  // ─── Invalid URL State ────────────────────────────────
  if (!resetUrl) {
    return (
      <div className={`confirm-reset-page ${isHebrew ? 'confirm-reset-page--rtl' : ''}`}>
        <div className="confirm-reset-page__box">
          <h1 className="confirm-reset-page__heading">
            {isHebrew ? 'קישור לא תקין' : 'Invalid Link'}
          </h1>
          <p className="confirm-reset-page__description">
            {isHebrew
              ? 'הקישור לאיפוס הסיסמה אינו תקין או פג תוקף.'
              : 'The password reset link is invalid or has expired.'
            }
          </p>
        </div>
      </div>
    );
  }

  // ─── Submit Handler ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ─── Validate passwords match ──────────────────────
    if (password !== confirmPassword) {
      setError(isHebrew ? 'הסיסמאות אינן תואמות' : 'Passwords do not match');
      return;
    }

    // ─── Validate password requirements ───────────────
    if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.lowercase || !passwordChecks.number) {
      setError(isHebrew ? 'הסיסמה אינה עומדת בדרישות' : 'Password does not meet requirements');
      return;
    }

    setIsLoading(true);
    try {
      const result = await customerResetByUrl(resetUrl, password);

      if (result.customerUserErrors?.length > 0) {
        const msg = result.customerUserErrors[0].message;
        setError(isHebrew ? (ERROR_TRANSLATIONS[msg] || msg) : msg);
        return;
      }

      // ─── Success — redirect to login ─────────────────
      router.push('/account/login?reset=success');
    } catch (err) {
      setError(isHebrew ? 'שגיאה באיפוס הסיסמה' : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`confirm-reset-page ${isHebrew ? 'confirm-reset-page--rtl' : ''}`}>
      <div className="confirm-reset-page__box">

        {/* ─── Heading ──────────────────────────────────── */}
        <h1 className="confirm-reset-page__heading">
          {isHebrew ? 'סיסמה חדשה' : 'New Password'}
        </h1>

        {/* ─── Error Message ────────────────────────────── */}
        {error && (
          <p className="confirm-reset-page__error">{error}</p>
        )}

        {/* ─── Form ─────────────────────────────────────── */}
        <div className="confirm-reset-page__form">

          {/* New Password */}
          <div className="confirm-reset-page__field">
            <label className="confirm-reset-page__label">
              {isHebrew ? 'סיסמה חדשה' : 'New Password'}
            </label>
            <div className="confirm-reset-page__input-wrapper">
              <input
                className="confirm-reset-page__input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  setPasswordChecks({
                    length: val.length >= 5,
                    uppercase: /[A-Z]/.test(val),
                    lowercase: /[a-z]/.test(val),
                    number: /[0-9]/.test(val),
                  });
                }}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="confirm-reset-page__password-toggle"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>

            {/* ─── Password Requirements ─────────────────── */}
            {passwordFocused && (
              <ul className="confirm-reset-page__requirements">
                <li className={`confirm-reset-page__requirement ${passwordChecks.length ? 'confirm-reset-page__requirement--met' : ''}`}>
                  {passwordChecks.length ? '✓' : '✗'}{' '}
                  {isHebrew ? 'לפחות 5 תווים' : 'At least 5 characters'}
                </li>
                <li className={`confirm-reset-page__requirement ${passwordChecks.uppercase ? 'confirm-reset-page__requirement--met' : ''}`}>
                  {passwordChecks.uppercase ? '✓' : '✗'}{' '}
                  {isHebrew ? 'לפחות אות גדולה אחת' : 'At least one uppercase letter'}
                </li>
                <li className={`confirm-reset-page__requirement ${passwordChecks.lowercase ? 'confirm-reset-page__requirement--met' : ''}`}>
                  {passwordChecks.lowercase ? '✓' : '✗'}{' '}
                  {isHebrew ? 'לפחות אות קטנה אחת' : 'At least one lowercase letter'}
                </li>
                <li className={`confirm-reset-page__requirement ${passwordChecks.number ? 'confirm-reset-page__requirement--met' : ''}`}>
                  {passwordChecks.number ? '✓' : '✗'}{' '}
                  {isHebrew ? 'לפחות ספרה אחת' : 'At least one number'}
                </li>
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div className="confirm-reset-page__field">
            <label className="confirm-reset-page__label">
              {isHebrew ? 'אימות סיסמה' : 'Confirm Password'}
            </label>
            <input
              className="confirm-reset-page__input"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Submit */}
          <button
            className="confirm-reset-page__submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading
              ? (isHebrew ? 'מאפס...' : 'Resetting...')
              : (isHebrew ? 'שמור סיסמה חדשה' : 'Save New Password')
            }
          </button>

        </div>

      </div>
    </div>
  );
}