"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import "./TermsPage.scss";

// ─── TermsPage ────────────────────────────────────────────────
// Terms of Service page — required by PayPlus and Israeli law
// Includes cancellation policy per Consumer Protection Law

export default function TermsPage() {
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const currentYear = new Date().getFullYear();

  return (
    <div className={`terms-page ${isHebrew ? "terms-page--rtl" : ""}`}>
      <div className="terms-page__inner">
        {isHebrew ? (
          <>
            <h1 className="terms-page__title">תקנון ומדיניות החנות</h1>
            <p className="terms-page__updated">
              {" "}
              {isHebrew
                ? `עודכן לאחרונה: ${currentYear}`
                : `Last updated: ${currentYear}`}
            </p>

            {/* ─── General ───────────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">כללי</h2>
              <p>
                ברוכים הבאים לחנות "דה קונטיינר". החנות עוסקת במכירת פריטי אמנות
                קרמית ואופנה יוקרתית. השימוש באתר ורכישת מוצרים כפופים לתנאי
                השימוש המפורטים להלן.
              </p>
            </section>

            {/* ─── Orders ────────────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">הזמנות ותשלום</h2>
              <p>
                כל הזמנה כפופה לאישור ולזמינות המלאי. התשלום מתבצע בעת ביצוע
                ההזמנה. במקרה של מוצר שאינו במלאי לאחר ביצוע ההזמנה, תינתן לך
                החזר מלא.
              </p>
            </section>

            {/* ─── Cancellation ──────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">מדיניות ביטול והחזרות</h2>
              <p>
                בהתאם לחוק הגנת הצרכן, התשמ"א-1981, ותקנות הגנת הצרכן (ביטול
                עסקה), התשע"א-2010:
              </p>
              <ul className="terms-page__list">
                <li>
                  ניתן לבטל עסקה תוך <strong>14 ימים</strong> מיום קבלת המוצר,
                  ללא עלות ביטול.
                </li>
                <li>המוצר חייב להיות לא פגום, לא שומש, ולא ניזוק.</li>
                <li>ערך הקנייה חייב לעלות על ₪50.</li>
                <li>
                  אנשים עם מוגבלות, בני 65 ומעלה, ועולים חדשים — רשאים לבטל תוך{" "}
                  <strong>4 חודשים</strong> מיום קבלת המוצר.
                </li>
                <li>ההחזר הכספי יבוצע תוך 14 ימים מיום קבלת הודעת הביטול.</li>
              </ul>

              <h3 className="terms-page__subheading">מוצרים שלא ניתן להחזיר</h3>
              <ul className="terms-page__list">
                <li>מוצרים בהזמנה אישית.</li>
                <li>מוצרים ללא תווית מקורית.</li>
              </ul>

              <h3 className="terms-page__subheading">כיצד לבטל עסקה</h3>
              <p>ניתן לשלוח הודעת ביטול באחת מהדרכים הבאות:</p>
              <ul className="terms-page__list">
                <li>
                  אימייל:{" "}
                  <a href="mailto:thecontaineronline@gmail.com">
                    thecontaineronline@gmail.com
                  </a>
                </li>
                <li>
                  טלפון: <a href="tel:+972553000357">055-3000357</a>
                </li>
              </ul>
              <p>יש לציין בהודעת הביטול: שם מלא, מספר הזמנה, וסיבת הביטול.</p>
            </section>

            {/* ─── Shipping ──────────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">משלוחים</h2>
              <ul className="terms-page__list">
                <li>זמן אספקה: עד 7 ימי עסקים מרגע אישור ההזמנה.</li>
                <li>בזמן חירום — השירות מוגבל לאזור המרכז.</li>
                <li>עלות המשלוח תוצג בעת התשלום.</li>
              </ul>
            </section>

            {/* ─── Contact ───────────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">צור קשר</h2>
              <p>לכל שאלה או פנייה:</p>
              <ul className="terms-page__list">
                <li>
                  אימייל:{" "}
                  <a href="mailto:thecontaineronline@gmail.com">
                    thecontaineronline@gmail.com
                  </a>
                </li>
                <li>
                  טלפון: <a href="tel:+972553000357">055-3000357</a>
                </li>
                <li>כתובת: המוריה 61, מושב תנובות, ישראל</li>
              </ul>
            </section>
          </>
        ) : (
          <>
            <h1 className="terms-page__title">Terms of Service</h1>
            <p className="terms-page__updated">
              {" "}
              {isHebrew
                ? `עודכן לאחרונה: ${currentYear}`
                : `Last updated: ${currentYear}`}
            </p>

            {/* ─── General ───────────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">General</h2>
              <p>
                Welcome to The Container. We sell handmade ceramic art and
                luxury fashion items. By using this site and purchasing
                products, you agree to the terms below.
              </p>
            </section>

            {/* ─── Orders ────────────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">Orders and Payment</h2>
              <p>
                All orders are subject to availability and confirmation. Payment
                is processed at the time of order. If an item becomes
                unavailable after your order, you will receive a full refund.
              </p>
            </section>

            {/* ─── Cancellation ──────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">
                Cancellation and Returns Policy
              </h2>
              <p>
                In accordance with the Israeli Consumer Protection Law (1981)
                and Consumer Protection Regulations (Cancellation of
                Transaction) 2010:
              </p>
              <ul className="terms-page__list">
                <li>
                  You may cancel an order within <strong>14 days</strong> of
                  receiving the product, free of charge.
                </li>
                <li>
                  The item must be unused, undamaged, and in its original
                  condition.
                </li>
                <li>The purchase value must exceed ₪50.</li>
                <li>
                  Persons with disabilities, those aged 65 and above, and new
                  immigrants may cancel within <strong>4 months</strong> of
                  receiving the product.
                </li>
                <li>
                  Refunds will be issued within 14 days of receiving the
                  cancellation notice.
                </li>
              </ul>

              <h3 className="terms-page__subheading">Non-Returnable Items</h3>
              <ul className="terms-page__list">
                <li>Custom or personalized orders.</li>
                <li>Items without their original tag.</li>
              </ul>

              <h3 className="terms-page__subheading">How to Cancel</h3>
              <p>Send your cancellation notice via one of the following:</p>
              <ul className="terms-page__list">
                <li>
                  Email:{" "}
                  <a href="mailto:thecontaineronline@gmail.com">
                    thecontaineronline@gmail.com
                  </a>
                </li>
                <li>
                  Phone: <a href="tel:+972553000357">055-3000357</a>
                </li>
              </ul>
              <p>
                Please include your full name, order number, and reason for
                cancellation.
              </p>
            </section>

            {/* ─── Shipping ──────────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">Shipping</h2>
              <ul className="terms-page__list">
                <li>
                  Delivery time: up to 7 business days from order confirmation.
                </li>
                <li>
                  During emergency situations — service is limited to the
                  central region of Israel.
                </li>
                <li>Shipping costs will be displayed at checkout.</li>
              </ul>
            </section>

            {/* ─── Contact ───────────────────────────────── */}
            <section className="terms-page__section">
              <h2 className="terms-page__heading">Contact Us</h2>
              <p>For any questions or requests:</p>
              <ul className="terms-page__list">
                <li>
                  Email:{" "}
                  <a href="mailto:thecontaineronline@gmail.com">
                    thecontaineronline@gmail.com
                  </a>
                </li>
                <li>
                  Phone: <a href="tel:+972553000357">055-3000357</a>
                </li>
                <li>Address: Hamoria 61, Tnuvot, Israel</li>
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
