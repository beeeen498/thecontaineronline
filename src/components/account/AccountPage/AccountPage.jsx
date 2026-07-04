'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomer } from '@/contexts/CustomerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import './AccountPage.scss';

// ─── AccountPage ──────────────────────────────────────────────
// Protected page — redirects to /account/login if not logged in
// Shows greeting, customer details, order history
// Handles logout and account deletion

export default function AccountPage() {
  const { customer, isLoggedIn, isLoading, logout, deleteAccount } = useCustomer();
  const { language } = useLanguage();
  const isHebrew = language === 'Hebrew';
  const router = useRouter();

  // ─── Delete Confirmation State ────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ─── Redirect if not logged in ────────────────────────
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/account/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // ─── Logout Handler ───────────────────────────────────
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // ─── Delete Account Handler ───────────────────────────
  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      router.push('/');
    } else {
      setDeleteError(result.error || (isHebrew ? 'שגיאה במחיקת החשבון' : 'Failed to delete account'));
    }
  };

  // ─── Loading State ────────────────────────────────────
  if (isLoading || !customer) {
    return (
      <div className="account-page__loading">
        <p>{isHebrew ? 'טוען...' : 'Loading...'}</p>
      </div>
    );
  }

  const orders = customer.orders?.edges || [];

  return (
    <div className={`account-page ${isHebrew ? 'account-page--rtl' : ''}`}>

      {/* ─── Greeting ─────────────────────────────────────── */}
      <div className="account-page__greeting">
        <h1 className="account-page__heading">
          {isHebrew
            ? `ברוך הבא, ${customer.firstName}`
            : `Welcome back, ${customer.firstName}`
          }
        </h1>
        <p className="account-page__email">{customer.email}</p>
      </div>

      {/* ─── Divider ──────────────────────────────────────── */}
      <div className="account-page__divider" />

      {/* ─── Order History ────────────────────────────────── */}
      <div className="account-page__section">
        <h2 className="account-page__section-heading">
          {isHebrew ? 'היסטוריית הזמנות' : 'Order History'}
        </h2>

        {orders.length === 0 ? (
          // ─── Empty State ───────────────────────────────
          <p className="account-page__empty">
            {isHebrew
              ? 'עדיין לא ביצעת הזמנות'
              : "You haven't placed any orders yet"
            }
          </p>
        ) : (
          // ─── Orders List ───────────────────────────────
          <div className="account-page__orders">
            {orders.map(({ node: order }) => (
              <div key={order.id} className="account-page__order">

                {/* order header */}
                <div className="account-page__order-header">
                  <span className="account-page__order-number">
                    {isHebrew ? `הזמנה #${order.orderNumber}` : `Order #${order.orderNumber}`}
                  </span>
                  <span className="account-page__order-date">
                    {new Date(order.processedAt).toLocaleDateString(
                      isHebrew ? 'he-IL' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </span>
                </div>

                {/* order details */}
                <div className="account-page__order-details">
                  <span className="account-page__order-status">
                    {order.financialStatus}
                  </span>
                  <span className="account-page__order-total">
                    ₪{Math.round(order.currentTotalPrice.amount)}
                  </span>
                </div>

                {/* order items */}
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

      {/* ─── Divider ──────────────────────────────────────── */}
      <div className="account-page__divider" />

      {/* ─── Actions ──────────────────────────────────────── */}
      <div className="account-page__actions">

        {/* Logout */}
        <button
          className="account-page__logout"
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isHebrew ? 'התנתקות' : 'Logout'}
        </button>

        {/* Delete Account */}
        {!showDeleteConfirm ? (
          <button
            className="account-page__delete"
            onClick={() => setShowDeleteConfirm(true)}
          >
            {isHebrew ? 'מחיקת חשבון' : 'Delete Account'}
          </button>
        ) : (
          <div className="account-page__confirm">
            <p className="account-page__confirm-text">
              {isHebrew
                ? 'האם אתה בטוח? פעולה זו אינה ניתנת לביטול'
                : 'Are you sure? This cannot be undone'
              }
            </p>
            {deleteError && (
              <p className="account-page__error">{deleteError}</p>
            )}
            <div className="account-page__confirm-buttons">
              <button
                className="account-page__confirm-yes"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isHebrew ? 'כן, מחק את החשבון' : 'Yes, delete my account'}
              </button>
              <button
                className="account-page__confirm-no"
                onClick={() => setShowDeleteConfirm(false)}
              >
                {isHebrew ? 'ביטול' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}