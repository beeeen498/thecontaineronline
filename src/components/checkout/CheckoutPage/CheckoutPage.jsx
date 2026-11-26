"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import imageLoader from "@/lib/imageLoader";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { createHypPayment } from "@/app/actions/createHypPayment";
import { COUNTRY_CODES } from "@/lib/countries";
import {
  MAX_LENGTH,
  emptyCheckoutDetails,
  needsRegion,
  validateCheckoutDetails,
} from "@/lib/checkoutDetails";
import "./CheckoutPage.scss";

// ─── Text ─────────────────────────────────────────────────────
const TEXT = {
  English: {
    title: "Checkout",
    shippingDetails: "Shipping details",
    summary: "Order summary",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    country: "Country",
    chooseCountry: "Choose a country",
    address1: "Street address",
    address2: "Apartment, floor, etc. (optional)",
    city: "City",
    region: "State / Province / Region",
    zip: "Postal code (optional)",
    shipping: "Shipping",
    free: "Free",
    total: "Total",
    pay: "Continue to payment",
    processing: "Processing...",
    paymentNote: "You'll enter your card details on Hyp's secure payment page.",
    required: "Required",
    invalid: "Please check this field",
    fixErrors: "Please check the highlighted fields.",
    failed: "Couldn't start checkout. Please try again or contact us.",
    emptyCart: "Your cart is empty.",
    backToShop: "Back to the shop",
    loading: "Loading...",
  },
  Hebrew: {
    title: "תשלום",
    shippingDetails: "פרטי משלוח",
    summary: "סיכום הזמנה",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    email: "אימייל",
    phone: "טלפון",
    country: "מדינה",
    chooseCountry: "בחרו מדינה",
    address1: "רחוב ומספר בית",
    address2: "דירה, קומה וכו׳ (לא חובה)",
    city: "עיר",
    region: "מחוז / אזור",
    zip: "מיקוד (לא חובה)",
    shipping: "משלוח",
    free: "חינם",
    total: 'סה"כ',
    pay: "המשך לתשלום",
    processing: "מעבד...",
    paymentNote: "את פרטי האשראי תזינו בעמוד התשלום המאובטח של Hyp.",
    required: "שדה חובה",
    invalid: "נא לבדוק את השדה",
    fixErrors: "נא לבדוק את השדות המסומנים.",
    failed: "לא ניתן להתחיל את התשלום כרגע. נסו שוב או צרו קשר.",
    emptyCart: "העגלה שלך ריקה.",
    backToShop: "חזרה לחנות",
    loading: "טוען...",
  },
};

// ─── Browser autofill hints ───────────────────────────────────
const AUTOCOMPLETE = {
  firstName: "given-name",
  lastName: "family-name",
  email: "email",
  phone: "tel",
  country: "country",
  address1: "address-line1",
  address2: "address-line2",
  city: "address-level2",
  region: "address-level1",
  zip: "postal-code",
};

// ─── Pre-fill from a logged-in customer ───────────────────────
// Only fills fields the shopper hasn't typed in yet.
function customerDefaults(customer) {
  const a = customer?.defaultAddress || {};
  return {
    firstName: a.firstName || customer?.firstName || "",
    lastName: a.lastName || customer?.lastName || "",
    email: customer?.email || "",
    phone: a.phone || customer?.phone || "",
    country: a.countryCodeV2 || "",
    address1: a.address1 || "",
    address2: a.address2 || "",
    city: a.city || "",
    region: a.provinceCode || "",
    zip: a.zip || "",
  };
}

export default function CheckoutPage() {
  const { cart, products, isRestored } = useCart();
  const { customer } = useCustomer();
  const { language } = useLanguage();
  const isHebrew = language === "Hebrew";
  const t = TEXT[isHebrew ? "Hebrew" : "English"];

  const [form, setForm] = useState(() => emptyCheckoutDetails());
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Defaults (adjusted during render, not in an effect) ──
  // Hebrew shoppers start with Israel selected; a logged-in
  // customer's saved details fill any empty fields.
  const [defaultedLanguage, setDefaultedLanguage] = useState(null);
  if (language && defaultedLanguage !== language) {
    setDefaultedLanguage(language);
    if (isHebrew && !form.country) setForm((f) => ({ ...f, country: "IL" }));
  }

  const [prefilledFor, setPrefilledFor] = useState(null);
  if (customer?.id && prefilledFor !== customer.id) {
    setPrefilledFor(customer.id);
    const defaults = customerDefaults(customer);
    setForm((f) => {
      const next = { ...f };
      for (const [key, value] of Object.entries(defaults)) {
        if (value && (!f[key] || (key === "country" && f[key] === "IL"))) {
          next[key] = value;
        }
      }
      return next;
    });
  }

  // ─── Country list in the visitor's language ───────────────
  const countries = useMemo(() => {
    const locale = isHebrew ? "he" : "en";
    let names;
    try {
      names = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      names = null;
    }
    const list = COUNTRY_CODES.map((code) => ({
      code,
      name: names?.of(code) || code,
    })).sort((a, b) => a.name.localeCompare(b.name, locale));
    // Israel first — most orders ship there
    const israel = list.find((c) => c.code === "IL");
    return [israel, ...list.filter((c) => c.code !== "IL")];
  }, [isHebrew]);

  // ─── Cart lines with our prices ───────────────────────────
  const lines = cart?.lines?.edges || [];
  const currencySymbol = isHebrew ? "₪" : "$";
  const items = lines.map(({ node: line }) => {
    const matched = products.find((p) =>
      p.variants?.some((v) => v.id === line.merchandise.id),
    );
    const title = isHebrew
      ? matched?.hebrewName || line.merchandise.product.title
      : matched?.englishName || line.merchandise.product.title;
    const price = isHebrew ? matched?.israelPrice : matched?.globalPrice;
    return {
      id: line.id,
      title,
      variant:
        line.merchandise.title !== "Default Title" ? line.merchandise.title : "",
      quantity: line.quantity,
      image:
        matched?.images?.[0] ||
        line.merchandise.product.images?.edges?.[0]?.node?.url,
      lineTotal: price ? price * line.quantity : null,
    };
  });
  const total = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  const formatMoney = (n) => `${currencySymbol}${Math.round(n).toLocaleString()}`;

  // ─── Form handlers ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !cart?.id) return;
    setFormError("");

    const { errors: found } = validateCheckoutDetails(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setFormError(t.fixErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createHypPayment({
        cartId: cart.id,
        language,
        details: form,
      });
      if (result.success) {
        window.location.href = result.paymentUrl;
        return;
      }
      if (result.error === "invalid_details") {
        setErrors(result.fields || {});
        setFormError(t.fixErrors);
      } else {
        console.error("Checkout error:", result.error);
        setFormError(t.failed);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setFormError(t.failed);
    }
    setIsSubmitting(false);
  };

  // ─── Field renderer ───────────────────────────────────────
  const field = (name, { type = "text", ltr = false, wide = false } = {}) => (
    <div className={`checkout__field ${wide ? "checkout__field--wide" : ""}`}>
      <label className="checkout__label" htmlFor={`checkout-${name}`}>
        {t[name]}
      </label>
      <input
        id={`checkout-${name}`}
        className={`checkout__input ${errors[name] ? "checkout__input--error" : ""}`}
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        maxLength={MAX_LENGTH[name]}
        autoComplete={AUTOCOMPLETE[name]}
        dir={ltr ? "ltr" : undefined}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `checkout-${name}-error` : undefined}
      />
      {errors[name] && (
        <span id={`checkout-${name}-error`} className="checkout__error">
          {t[errors[name]]}
        </span>
      )}
    </div>
  );

  // ─── Loading / empty states ───────────────────────────────
  const pageClass = `checkout ${isHebrew ? "checkout--rtl" : ""}`;

  if (!isRestored) {
    return (
      <main className={pageClass}>
        <p className="checkout__status">{t.loading}</p>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className={pageClass}>
        <div className="checkout__empty">
          <p className="checkout__status">{t.emptyCart}</p>
          <Link href="/" className="checkout__btn checkout__btn--secondary">
            {t.backToShop}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={pageClass}>
      <h1 className="checkout__title">{t.title}</h1>

      <div className="checkout__layout">
        {/* ─── Shipping form ─────────────────────────────── */}
        <form className="checkout__form" onSubmit={handleSubmit} noValidate>
          <h2 className="checkout__heading">{t.shippingDetails}</h2>

          <div className="checkout__grid">
            {field("firstName")}
            {field("lastName")}
            {field("email", { type: "email", ltr: true })}
            {field("phone", { type: "tel", ltr: true })}

            <div className="checkout__field checkout__field--wide">
              <label className="checkout__label" htmlFor="checkout-country">
                {t.country}
              </label>
              <select
                id="checkout-country"
                className={`checkout__input ${errors.country ? "checkout__input--error" : ""}`}
                name="country"
                value={form.country}
                onChange={handleChange}
                autoComplete={AUTOCOMPLETE.country}
                aria-invalid={errors.country ? true : undefined}
              >
                <option value="">{t.chooseCountry}</option>
                {countries.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <span className="checkout__error">{t[errors.country]}</span>
              )}
            </div>

            {field("address1", { wide: true })}
            {field("address2", { wide: true })}
            {field("city")}
            {needsRegion(form.country) && field("region")}
            {field("zip", { ltr: true })}
          </div>

          {formError && (
            <p className="checkout__form-error" role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            className="checkout__btn checkout__btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.processing : t.pay}
          </button>
          <p className="checkout__note">{t.paymentNote}</p>
        </form>

        {/* ─── Order summary ─────────────────────────────── */}
        <aside className="checkout__summary">
          <h2 className="checkout__heading">{t.summary}</h2>
          <ul className="checkout__items">
            {items.map((item) => (
              <li key={item.id} className="checkout__item">
                <div className="checkout__item-image">
                  {item.image && (
                    <Image
                      src={item.image}
                      loader={imageLoader}
                      alt={item.title}
                      fill
                      sizes="64px"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="checkout__item-details">
                  <span className="checkout__item-name">{item.title}</span>
                  {item.variant && (
                    <span className="checkout__item-variant">{item.variant}</span>
                  )}
                  <span className="checkout__item-qty">× {item.quantity}</span>
                </div>
                <span className="checkout__item-price">
                  {item.lineTotal ? formatMoney(item.lineTotal) : ""}
                </span>
              </li>
            ))}
          </ul>
          <div className="checkout__row">
            <span>{t.shipping}</span>
            <span>{t.free}</span>
          </div>
          <div className="checkout__row checkout__row--total">
            <span>{t.total}</span>
            <span>{formatMoney(total)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
