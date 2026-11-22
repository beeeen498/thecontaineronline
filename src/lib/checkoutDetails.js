// ─── Checkout details: shared validation ──────────────────────
// Used by the checkout form (instant feedback) and by the server
// (the real check — browser checks can be skipped).
// Plain module: safe to import from client and server code.

import { isCountryCode, REGION_COUNTRIES } from "@/lib/countries";

export const CHECKOUT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "country",
  "address1",
  "address2",
  "city",
  "region",
  "zip",
];

// ─── Limits ───────────────────────────────────────────────────
export const MAX_LENGTH = {
  firstName: 60,
  lastName: 60,
  email: 200,
  phone: 30,
  country: 2,
  address1: 200,
  address2: 200,
  city: 100,
  region: 100,
  zip: 20,
};

const OPTIONAL = new Set(["address2", "zip"]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-()\s]{6,30}$/;
const ZIP_RE = /^[A-Za-z0-9\-\s]{2,20}$/;
// Control characters and "#" (Hyp cuts its redirect at "#") are refused.
const BAD_CHARS_RE = /[\u0000-\u001f\u007f#<>]/;

export function emptyCheckoutDetails(country = "") {
  const details = Object.fromEntries(CHECKOUT_FIELDS.map((f) => [f, ""]));
  details.country = country;
  return details;
}

export function needsRegion(country) {
  return REGION_COUNTRIES.has(country);
}

// ─── validateCheckoutDetails ──────────────────────────────────
// Returns { details, errors }. `details` is trimmed and only has
// known fields; `errors` maps field → "required" | "invalid".
export function validateCheckoutDetails(raw) {
  const details = emptyCheckoutDetails();
  const errors = {};

  for (const field of CHECKOUT_FIELDS) {
    let value = typeof raw?.[field] === "string" ? raw[field].trim() : "";
    if (field === "country") value = value.toUpperCase();
    if (field === "email") value = value.toLowerCase();
    details[field] = value;

    const optional =
      OPTIONAL.has(field) || (field === "region" && !needsRegion(details.country));

    if (!value) {
      if (!optional) errors[field] = "required";
      continue;
    }
    if (value.length > MAX_LENGTH[field] || BAD_CHARS_RE.test(value)) {
      errors[field] = "invalid";
    }
  }

  if (details.email && !errors.email && !EMAIL_RE.test(details.email)) {
    errors.email = "invalid";
  }
  if (details.phone && !errors.phone && !PHONE_RE.test(details.phone)) {
    errors.phone = "invalid";
  }
  if (details.zip && !errors.zip && !ZIP_RE.test(details.zip)) {
    errors.zip = "invalid";
  }
  if (details.country && !isCountryCode(details.country)) {
    errors.country = "invalid";
  }
  if (!needsRegion(details.country)) details.region = "";

  return { details, errors };
}
