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
  const { customer, isLoggedIn, isLoading, logout, deleteAccount } =
    useCustomer();
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const router = useRouter();

  // ─── Active Tab State ─────────────────────────────────
  const [activeTab, setActiveTab] = useState("orders");

  // ─── Delete Confirmation State ────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  return (
    <div className={`account-page ${isHebrew ? "account-page--rtl" : ""}`}>
      {/* ─── Sidebar ──────────────────────────────────────── */}
      <aside className="account-page__sidebar">
        {/* Greeting */}
        <div className="account-page__greeting">
          <p className="account-page__welcome">
            {isHebrew ? "שלום," : "Welcome,"}
          </p>
          <h1 className="account-page__name">{customer.firstName}!</h1>
        </div>

        <div className="account-page__divider" />

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
              {/* Logout */}
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

              {/* Delete Account */}
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
