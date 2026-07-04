"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import "./RegisterPage.scss";

// ─── RegisterPage ─────────────────────────────────────────────
// Handles new customer registration
// Auto-logs in after successful registration
// Redirects to /account on success

export default function RegisterPage() {
  const { register, isLoading, isLoggedIn } = useCustomer();
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const router = useRouter();

  // ─── Form State ───────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  // ─── Submit Handler ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await register({ firstName, lastName, email, password });

    if (result.success) {
      router.push("/account");
    } else {
      setError(
        result.error || (isHebrew ? "שגיאה בהרשמה" : "Registration failed"),
      );
    }
  };

  // ─── Redirect if already logged in ───────────────────
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push("/account");
    }
  }, [isLoggedIn, isLoading, router]);

  // ─── Error translations ───────────────────
  const ERROR_TRANSLATIONS = {
    "Unidentified customer": "משתמש לא מזוהה",
    "Invalid credentials": "פרטי התחברות שגויים",
    "Customer is disabled": "החשבון מושבת",
    "Email has already been taken": "כתובת האימייל כבר בשימוש",
    "Password is too short (minimum is 5 characters)":
      "הסיסמה קצרה מדי (מינימום 5 תווים)",
  };

  // ─── Display Error ────────────────────────────────────
  const displayError = isHebrew ? ERROR_TRANSLATIONS[error] || error : error;

  return (
    <div className={`register-page ${isHebrew ? "register-page--rtl" : ""}`}>
      <div className="register-page__box">
        {/* ─── Heading ──────────────────────────────────── */}
        <h1 className="register-page__heading">
          {isHebrew ? "הרשמה" : "Register"}
        </h1>

        {/* ─── Error Message ────────────────────────────── */}
        {error && <p className="register-page__error">{displayError}</p>}

        {/* ─── Form ─────────────────────────────────────── */}
        <div className="register-page__form">
          {/* First Name */}
          <div className="register-page__field">
            <label className="register-page__label">
              {isHebrew ? "שם פרטי" : "First Name"}
            </label>
            <input
              className="register-page__input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
          </div>

          {/* Last Name */}
          <div className="register-page__field">
            <label className="register-page__label">
              {isHebrew ? "שם משפחה" : "Last Name"}
            </label>
            <input
              className="register-page__input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </div>

          {/* Email */}
          <div className="register-page__field">
            <label className="register-page__label">
              {isHebrew ? "אימייל" : "Email"}
            </label>
            <input
              className="register-page__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="register-page__field">
            <label className="register-page__label">
              {isHebrew ? "סיסמה" : "Password"}
            </label>
            <div className="register-page__input-wrapper">
              <input
                className="register-page__input"
                type={showPassword ? "text" : "password"}
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
                className="register-page__password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            {/* ─── Password Requirements ──────────────────────── */}
            {passwordFocused && (
              <ul className="register-page__requirements">
                <li
                  className={`register-page__requirement ${passwordChecks.length ? "register-page__requirement--met" : ""}`}
                >
                  {passwordChecks.length ? "✓" : "✗"}{" "}
                  {isHebrew ? "לפחות 5 תווים" : "At least 5 characters"}
                </li>
                <li
                  className={`register-page__requirement ${passwordChecks.uppercase ? "register-page__requirement--met" : ""}`}
                >
                  {passwordChecks.uppercase ? "✓" : "✗"}{" "}
                  {isHebrew
                    ? "לפחות אות גדולה אחת"
                    : "At least one uppercase letter"}
                </li>
                <li
                  className={`register-page__requirement ${passwordChecks.lowercase ? "register-page__requirement--met" : ""}`}
                >
                  {passwordChecks.lowercase ? "✓" : "✗"}{" "}
                  {isHebrew
                    ? "לפחות אות קטנה אחת"
                    : "At least one lowercase letter"}
                </li>
                <li
                  className={`register-page__requirement ${passwordChecks.number ? "register-page__requirement--met" : ""}`}
                >
                  {passwordChecks.number ? "✓" : "✗"}{" "}
                  {isHebrew ? "לפחות ספרה אחת" : "At least one number"}
                </li>
              </ul>
            )}
          </div>

          {/* Submit */}
          <button
            className="register-page__submit"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !passwordChecks.length ||
              !passwordChecks.uppercase ||
              !passwordChecks.lowercase ||
              !passwordChecks.number
            }
          >
            {isLoading
              ? isHebrew
                ? "נרשם..."
                : "Registering..."
              : isHebrew
                ? "הרשמה"
                : "Register"}
          </button>
        </div>

        {/* ─── Login Link ───────────────────────────────── */}
        <p className="register-page__login">
          {isHebrew ? "כבר יש לך חשבון?" : "Already have an account?"}{" "}
          <Link href="/account/login">{isHebrew ? "התחברות" : "Login"}</Link>
        </p>
      </div>
    </div>
  );
}
