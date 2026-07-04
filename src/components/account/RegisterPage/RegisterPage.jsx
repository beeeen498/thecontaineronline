"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLanguage } from "@/contexts/LanguageContext";
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

  return (
    <div className={`register-page ${isHebrew ? "register-page--rtl" : ""}`}>
      <div className="register-page__box">
        {/* ─── Heading ──────────────────────────────────── */}
        <h1 className="register-page__heading">
          {isHebrew ? "הרשמה" : "Register"}
        </h1>

        {/* ─── Error Message ────────────────────────────── */}
        {error && <p className="register-page__error">{error}</p>}

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
            <input
              className="register-page__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Submit */}
          <button
            className="register-page__submit"
            onClick={handleSubmit}
            disabled={isLoading}
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
