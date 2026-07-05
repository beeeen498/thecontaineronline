"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import "./AccountPage.scss";

// ─── AccountPage ──────────────────────────────────────────────
// Protected page — redirects to /account/login if not logged in
// Two column layout: sidebar (nav) + content (orders/settings)

export default function AccountPage() {
  const {
    customer,
    isLoggedIn,
    isLoading,
    logout,
    deleteAccount,
    updateCustomer,
  } = useCustomer();
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const router = useRouter();

  // ─── Active Tab State ─────────────────────────────────
  const [activeTab, setActiveTab] = useState("orders");

  // ─── Delete Confirmation State ────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ─── Update Email State ───────────────────────────────
  const [newEmail, setNewEmail] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  // ─── Update Password State ────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  // ─── Redirect if not logged in ────────────────────────
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/account/login");
    }
  }, [isLoggedIn, isLoading, router]);

  // ─── Logout Handler ───────────────────────────────────
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // ─── Delete Account Handler ───────────────────────────
  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      router.push("/");
    } else {
      setDeleteError(
        result.error ||
          (isHebrew ? "שגיאה במחיקת החשבון" : "Failed to delete account"),
      );
    }
  };

  // ─── Loading State ────────────────────────────────────
  if (isLoading || !customer) {
    return (
      <div className="account-page__loading">
        <p>{isHebrew ? "טוען..." : "Loading..."}</p>
      </div>
    );
  }

  const orders = customer.orders?.edges || [];

  // ─── Update Email Handler ─────────────────────────────
  const handleUpdateEmail = async () => {
    setEmailError("");
    setEmailSuccess("");

    if (!currentEmail || !newEmail) return;

    // ─── Verify current email matches ─────────────────
    if (currentEmail !== customer.email) {
      setEmailError(
        isHebrew ? "האימייל הנוכחי שגוי" : "Current email is incorrect",
      );
      return;
    }

    const result = await updateCustomer({ email: newEmail });
    if (result.success) {
      setEmailSuccess(
        isHebrew ? "האימייל עודכן בהצלחה" : "Email updated successfully",
      );
      setCurrentEmail("");
      setNewEmail("");
    } else {
      setEmailError(
        isHebrew
          ? "שגיאה בעדכון האימייל"
          : result.error || "Failed to update email",
      );
    }
  };

  // ─── Update Password Handler ──────────────────────────
  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPasswordError(
        isHebrew ? "הסיסמאות אינן תואמות" : "Passwords do not match",
      );
      return;
    }

    if (
      !passwordChecks.length ||
      !passwordChecks.uppercase ||
      !passwordChecks.lowercase ||
      !passwordChecks.number
    ) {
      setPasswordError(
        isHebrew
          ? "הסיסמה אינה עומדת בדרישות"
          : "Password does not meet requirements",
      );
      return;
    }

    const result = await updateCustomer({ currentPassword, newPassword });
    if (result.success) {
      setPasswordSuccess(
        isHebrew ? "הסיסמה עודכנה בהצלחה" : "Password updated successfully",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } else {
      const errorMsg =
        result.error === "current_password_wrong"
          ? isHebrew
            ? "הסיסמה הנוכחית שגויה"
            : "Current password is incorrect"
          : isHebrew
            ? "שגיאה בעדכון הסיסמה"
            : result.error || "Failed to update password";
      setPasswordError(errorMsg);
    }
  };

  return (
    <div className={`account-page ${isHebrew ? "account-page--rtl" : ""}`}>
      {/* ─── Sidebar ──────────────────────────────────────── */}
      <aside className="account-page__sidebar">
        {/* Navigation */}
        <nav className="account-page__nav">
          <button
            className={`account-page__nav-item ${activeTab === "orders" ? "account-page__nav-item--active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            {isHebrew ? "הזמנות" : "Orders"}
          </button>
          <button
            className={`account-page__nav-item ${activeTab === "settings" ? "account-page__nav-item--active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            {isHebrew ? "הגדרות" : "Settings"}
          </button>
        </nav>
      </aside>

      {/* ─── Main Content ─────────────────────────────────── */}
      <main className="account-page__content">
        {/* ─── Greeting ───────────────────────────────────────── */}
        <p className="account-page__greeting">
          {isHebrew
            ? `שלום, ${customer.firstName}!`
            : `Welcome, ${customer.firstName}!`}
        </p>

        {/* ─── Orders Tab ───────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="account-page__section">
            <h2 className="account-page__section-heading">
              {isHebrew ? "היסטוריית הזמנות" : "Order History"}
            </h2>

            {orders.length === 0 ? (
              // ─── Empty State ─────────────────────────────
              <p className="account-page__empty">
                {isHebrew
                  ? "עדיין לא ביצעת הזמנות"
                  : "You haven't placed any orders yet"}
              </p>
            ) : (
              // ─── Orders List ─────────────────────────────
              <div className="account-page__orders">
                {orders.map(({ node: order }) => (
                  <div key={order.id} className="account-page__order">
                    {/* Order Header */}
                    <div className="account-page__order-header">
                      <span className="account-page__order-number">
                        {isHebrew
                          ? `הזמנה #${order.orderNumber}`
                          : `Order #${order.orderNumber}`}
                      </span>
                      <span className="account-page__order-date">
                        {new Date(order.processedAt).toLocaleDateString(
                          isHebrew ? "he-IL" : "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="account-page__order-details">
                      <span className="account-page__order-status">
                        {order.financialStatus}
                      </span>
                      <span className="account-page__order-total">
                        ₪{Math.round(order.currentTotalPrice.amount)}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="account-page__order-items">
                      {order.lineItems.edges.map(({ node: item }, idx) => (
                        <p key={idx} className="account-page__order-item">
                          {item.title} × {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Settings Tab ─────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="account-page__section">
            <h2 className="account-page__section-heading">
              {isHebrew ? "הגדרות חשבון" : "Account Settings"}
            </h2>

            <div className="account-page__settings">
              {/* ─── Update Email ─────────────────────────────── */}
              <div className="account-page__setting-block">
                <h3 className="account-page__setting-block-heading">
                  {isHebrew ? "עדכון אימייל" : "Update Email"}
                </h3>

                <div className="account-page__field">
                  <label className="account-page__label">
                    {isHebrew ? "אימייל נוכחי" : "Current Email"}
                  </label>
                  <input
                    className="account-page__input"
                    type="email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="account-page__field">
                  <label className="account-page__label">
                    {isHebrew ? "אימייל חדש" : "New Email"}
                  </label>
                  <input
                    className="account-page__input"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                {emailError && (
                  <p className="account-page__error">{emailError}</p>
                )}
                {emailSuccess && (
                  <p className="account-page__success">{emailSuccess}</p>
                )}

                <button
                  className="account-page__btn account-page__btn--primary"
                  onClick={handleUpdateEmail}
                  disabled={isLoading || !currentEmail || !newEmail}
                >
                  {isHebrew ? "עדכן אימייל" : "Update Email"}
                </button>
              </div>

              <div className="account-page__divider" />

              {/* ─── Update Password ──────────────────────────── */}
              <div className="account-page__setting-block">
                <h3 className="account-page__setting-block-heading">
                  {isHebrew ? "עדכון סיסמה" : "Update Password"}
                </h3>

                <div className="account-page__field">
                  <label className="account-page__label">
                    {isHebrew ? "סיסמה נוכחית" : "Current Password"}
                  </label>
                  <input
                    className="account-page__input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                <div className="account-page__field">
                  <label className="account-page__label">
                    {isHebrew ? "סיסמה חדשה" : "New Password"}
                  </label>
                  <input
                    className="account-page__input"
                    type="password"
                    value={newPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPassword(val);
                      setPasswordChecks({
                        length: val.length >= 5,
                        uppercase: /[A-Z]/.test(val),
                        lowercase: /[a-z]/.test(val),
                        number: /[0-9]/.test(val),
                      });
                    }}
                    autoComplete="new-password"
                  />
                  {passwordFocused && (
                    <ul className="account-page__requirements">
                      <li
                        className={`account-page__requirement ${passwordChecks.length ? "account-page__requirement--met" : ""}`}
                      >
                        {passwordChecks.length ? "✓" : "✗"}{" "}
                        {isHebrew ? "לפחות 5 תווים" : "At least 5 characters"}
                      </li>
                      <li
                        className={`account-page__requirement ${passwordChecks.uppercase ? "account-page__requirement--met" : ""}`}
                      >
                        {passwordChecks.uppercase ? "✓" : "✗"}{" "}
                        {isHebrew
                          ? "לפחות אות גדולה אחת"
                          : "At least one uppercase letter"}
                      </li>
                      <li
                        className={`account-page__requirement ${passwordChecks.lowercase ? "account-page__requirement--met" : ""}`}
                      >
                        {passwordChecks.lowercase ? "✓" : "✗"}{" "}
                        {isHebrew
                          ? "לפחות אות קטנה אחת"
                          : "At least one lowercase letter"}
                      </li>
                      <li
                        className={`account-page__requirement ${passwordChecks.number ? "account-page__requirement--met" : ""}`}
                      >
                        {passwordChecks.number ? "✓" : "✗"}{" "}
                        {isHebrew ? "לפחות ספרה אחת" : "At least one number"}
                      </li>
                    </ul>
                  )}
                </div>

                <div className="account-page__field">
                  <label className="account-page__label">
                    {isHebrew ? "אימות סיסמה חדשה" : "Confirm New Password"}
                  </label>
                  <input
                    className="account-page__input"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                {passwordError && (
                  <p className="account-page__error">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="account-page__success">{passwordSuccess}</p>
                )}

                <button
                  className="account-page__btn account-page__btn--primary"
                  onClick={handleUpdatePassword}
                  disabled={
                    isLoading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmNewPassword
                  }
                >
                  {isHebrew ? "עדכן סיסמה" : "Update Password"}
                </button>
              </div>

              <div className="account-page__divider" />

              {/* ─── Logout ───────────────────────────────────── */}
              <div className="account-page__setting-row">
                <div className="account-page__setting-info">
                  <p className="account-page__setting-title">
                    {isHebrew ? "התנתקות" : "Logout"}
                  </p>
                  <p className="account-page__setting-description">
                    {isHebrew
                      ? "התנתק מהחשבון שלך"
                      : "Sign out of your account"}
                  </p>
                </div>
                <button
                  className="account-page__btn account-page__btn--primary"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isHebrew ? "התנתקות" : "Logout"}
                </button>
              </div>

              <div className="account-page__divider" />

              {/* ─── Delete Account ───────────────────────────── */}
              <div className="account-page__setting-row">
                <div className="account-page__setting-info">
                  <p className="account-page__setting-title account-page__setting-title--danger">
                    {isHebrew ? "מחיקת חשבון" : "Delete Account"}
                  </p>
                  <p className="account-page__setting-description">
                    {isHebrew
                      ? "מחק את החשבון שלך לצמיתות. פעולה זו אינה ניתנת לביטול."
                      : "Permanently delete your account. This action cannot be undone."}
                  </p>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    className="account-page__btn account-page__btn--danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    {isHebrew ? "מחק חשבון" : "Delete"}
                  </button>
                ) : (
                  <div className="account-page__confirm">
                    <p className="account-page__confirm-text">
                      {isHebrew
                        ? "האם אתה בטוח? פעולה זו אינה ניתנת לביטול."
                        : "Are you sure? This cannot be undone."}
                    </p>
                    {deleteError && (
                      <p className="account-page__error">{deleteError}</p>
                    )}
                    <div className="account-page__confirm-buttons">
                      <button
                        className="account-page__btn account-page__btn--danger"
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                      >
                        {isHebrew ? "כן, מחק" : "Yes, delete"}
                      </button>
                      <button
                        className="account-page__btn account-page__btn--secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        {isHebrew ? "ביטול" : "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
