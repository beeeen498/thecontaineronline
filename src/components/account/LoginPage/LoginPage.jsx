"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import "./LoginPage.scss";

// ─── LoginPage ────────────────────────────────────────────────
// Handles customer login
// Redirects to /account on success
// Shows error message on failure

export default function LoginPage() {
  const { login, isLoading, isLoggedIn } = useCustomer();
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const router = useRouter();

  // ─── Form State ───────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ─── Submit Handler ───────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login({ email, password });

    if (result.success) {
      router.push("/account");
    } else {
      setError(result.error || (isHebrew ? "שגיאה בהתחברות" : "Login failed"));
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
    <div className={`login-page ${isHebrew ? "login-page--rtl" : ""}`}>
      <div className="login-page__box">
        {/* ─── Heading ──────────────────────────────────── */}
        <h1 className="login-page__heading">
          {isHebrew ? "התחברות" : "Login"}
        </h1>

        {/* ─── Error Message ────────────────────────────── */}
        {error && <p className="login-page__error">{displayError}</p>}

        {/* ─── Form ─────────────────────────────────────── */}
        <div className="login-page__form">
          {/* Email */}
          <div className="login-page__field">
            <label className="login-page__label">
              {isHebrew ? "אימייל" : "Email"}
            </label>
            <input
              className="login-page__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="login-page__field">
            <label className="login-page__label">
              {isHebrew ? "סיסמה" : "Password"}
            </label>
            <div className="login-page__input-wrapper">
              <input
                className="login-page__input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-page__password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className="login-page__submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading
              ? isHebrew
                ? "מתחבר..."
                : "Logging in..."
              : isHebrew
                ? "התחברות"
                : "Login"}
          </button>
        </div>

        {/* ─── Register Link ────────────────────────────── */}
        <p className="login-page__register">
          {isHebrew ? "אין לך חשבון?" : "Don't have an account?"}{" "}
          <Link href="/account/register">
            {isHebrew ? "הירשם" : "Register"}
          </Link>
        </p>
      </div>
    </div>
  );
}
