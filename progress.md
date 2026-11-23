# Progress — Security & Upgrade Work

> **Read this first when resuming.** Then `todo.md` (what's left) and `report.md` (test results).
> `upgrade.md` is the original review; findings are referenced as #1–#24.

_Last updated: 2026-11-22_

## Project in one paragraph
**The Container** (thecontaineronline.com): Next.js 16 App Router + React 19, plain JS, SCSS, pnpm. Bilingual English/Hebrew (RTL). Products come from the **Shopify Storefront API** (`src/lib/shopifyQueries.js`). Payment goes through **Hyp Pay** (Israeli gateway), not Shopify Checkout. The contact form sends email through **Resend**. Hosted on **Vercel**. Secrets are in `.env.local` (gitignored; never paste or commit it).

## Git state
- Branch **`security-fixes`** (all work is here). `main` and GitHub are untouched; branch not pushed.
- Commits on top of `main` (`0348e9d`):
  1. `1d40193`: steps 1–2: dependency upgrade, removed secret logs, server-side checkout
  2. `766e125`: fixes from the retest: removed draft-order stock hold; `SITE_URL` for the Hyp return address
  3. `b7b481b`: step 3: contact form hardening + security headers
  4. `bb43060`: step 4: server-rendered language, caching, cart lookup
  5. `9a144e0`: progress.md
  6. `9f76bda`: step 5: httpOnly login cookie, lint clean, CI, cleanup
  7. `1e603ca`: Delete account via Admin API; email/password change keeps the customer logged in
  8. `8661a3b`: progress.md commit list
  9. `2b1f607`: shipping details at checkout
  10. `bb429db`: canonical URL fix (found in full re-check)
  11. `a145e6b`: cart + button greyed out at the stock limit
  12. `651aace`: Turnstile on the contact form + instant product updates (webhook)
- To undo everything: `git checkout main`. To return to a step: `git reset --hard <hash>`.

## Plan (from upgrade.md "Suggested order of work")
| Step | Scope | Status |
|---|---|---|
| 1 | Upgrade Next/React (#5), remove secret logs (#4) | ✅ done |
| 2 | Server-side checkout (#1 #2 #3 #6 #7 #13 #14 #15) | ✅ code done + tested · ⏳ full paid test pending |
| 3 | Contact form (#8), security headers / CSP (#10 #11) | ✅ done · ⏳ user tasks (Resend domain, CSP console check) |
| 4 | SEO language rendering (#9), caching + cart catalog (#17 #18) | ✅ done · ⏳ browser check |
| 5 | Auth token → httpOnly cookie (#12); CI, remove `package-lock.json`, README, lint errors (#19–24); "Delete account" fix | ✅ done, live-tested · ⏳ GitHub secrets, browser look check |
| + | Shipping details at checkout | ✅ done, live-tested · ⏳ paid test |

## What changed, by area

### Step 1: dependencies & logs
- next 16.2.9 → **16.4.6**, react/react-dom → **19.3.1**, plus indirect dependencies. `pnpm audit --prod` = 0 vulnerabilities (was 40, incl. 5 critical).
- Removed `console.log`s that printed the Hyp `KEY`/`PassP`. **Key rotation skipped:** user confirmed no sales were ever made, so the logging code never ran in production.

### Step 2: checkout (most important)
Flow now:
1. `CartDrawer.jsx` sends only `{ cartId, language }` to `createHypPayment` (`src/app/actions/createHypPayment.js`).
2. The server loads the cart (`getCart`) and prices it with `getVariantPricing` (`shopifyQueries.js`), using the same rules as the display (`parseIsraelPrice` / `parseGlobalPrice`). Hebrew → ILS `israelPrice`, Coin 1. English → USD `globalPrice`, Coin 2.
3. It creates a Shopify **draft order** (`createDraftOrder` in `src/lib/shopifyAdmin.js`, tag `hyp-pending`, custom attributes `hyp_amount` / `hyp_currency` / `language`). The draft order's numeric ID becomes Hyp's `Order` parameter.
4. Hyp redirects to `/checkout/success`, and `SuccessPage.jsx` calls `confirmHypPayment` (`src/app/actions/handlePaymentSuccess.js`). That function:
   - sends the redirect params to Hyp VERIFY (our credentials can't be overridden) and requires `CCode=0`;
   - checks the amount against the draft order;
   - calls `completeDraftOrder`, which tags `hyp-paid`, adds the transaction to the note, and completes the draft. Shopify then creates the order and lowers inventory.

   Idempotent: an already-completed draft returns success.
- Removed: the exported `updateInventoryAfterPayment` / `decreaseInventory` and the `sessionStorage` cart lines.
- **No stock hold** on draft orders: it allowed anyone to make items look sold out, and didn't prevent double booking.
- `SITE_URL` env (optional) overrides the Hyp return address for local testing.
- Shopify Admin app **"Inventory Manager"** (Dev Dashboard app) now has scopes `write_inventory, read_inventory, read_products, write_draft_orders, read_draft_orders`. The token didn't change.
- Product lookup by handle now uses GraphQL variables (#13).

### Step 3: contact form & headers
- `src/app/actions/sendEmail.js`: HTML escaping, server-side validation and length limits, honeypot field `website`, in-memory rate limit (3 messages per 10 minutes per IP), `replyTo`, sender from `CONTACT_FROM_EMAIL` env (falls back to `onboarding@resend.dev`). Resend errors are now reported (before, failures showed "Sent!").
- `ContactUs.jsx`: honeypot input, `maxLength`, phone validation, error message. New translation keys `phoneInvalid`, `sendFailed`, `rateLimited` (EN + HE).
- `next.config.mjs` `headers()`:
  - **enforced:** `frame-ancestors`/`base-uri`/`object-src`/`form-action`, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS;
  - **full CSP in `Content-Security-Policy-Report-Only`**, because the Negishot accessibility widget loads from negishot.co.il, cdn.jsdelivr.net, Google Fonts and media.getmood.io.

### Step 4: SEO, language, caching
- Language is saved in cookie `language` (constants in `src/lib/language.js`) plus localStorage.
- `src/app/layout.js` (now async) reads the cookie, sets `<html lang dir>`, and passes `initialLanguage` to `LanguageProvider`.
- `LanguageContext.js` no longer returns `null` before mount (that made every server page empty). It exposes `ready` and migrates old localStorage choices to the cookie.
- `LanguageGate.jsx` always renders the page. When `ready && !language` it shows `SelectLanguagePage` on top, with the page wrapped in a `display: contents` + `inert` wrapper.
- Fixed `language.toLowerCase()` crashes when no language is set (4 components → `language !== 'Hebrew'`).
- `src/lib/catalog.js`: `unstable_cache` wrappers (60 s, tag `products`) used by server pages. Removed `revalidate = 0`. Sitemap now revalidates.
- `CartContext.js`: `getProductsForVariants` (in `shopifyQueries.js`) loads only the products in the cart, instead of the whole catalog.
- Missing product: `generateMetadata` calls `notFound()`. **User chose to keep** `item/[handle]/loading.js`, so the status is 200 with `noindex`, not 404.

### Step 5: login token, lint, CI, cleanup
- `src/app/actions/customer.js` (server actions): `getCurrentCustomer`, `adoptLegacyToken`, `loginCustomer`, `registerCustomer`, `logoutCustomer`, `deleteCustomerAccount`, `updateCurrentCustomer`. Token in cookie `customer_token` (httpOnly, secure in prod, sameSite lax, expires = Shopify `expiresAt`).
- `CustomerContext.js` calls them; same API for pages (`login`, `register`, `logout`, `deleteAccount`, `updateCustomer`, `isLoggedIn`, `isLoading`). `isLoading` now starts `true` until the session check finishes. Old localStorage token `shopify-customer-token` is migrated once, then removed.
- Password reset pages (`ResetPage`, `ConfirmResetPage`) still call the Storefront API from the browser (no token stored).
- **"Delete account" fixed** (it never worked: the Storefront API has no `customerDelete`). It now uses the Admin `deleteCustomer` in `shopifyAdmin.js`. If the customer has orders, or Shopify refuses, the shop is emailed a deletion request through `src/lib/email.js` (server-only, not an action), and the result is `{ requested: true }`, shown as a message on AccountPage. Scope `write_customers` added by the user (Shopify adds `read_customers` with it).
- Changing email or password now requires the **current password** (new field on AccountPage). After the update the server logs in again if Shopify returns no new token (Shopify revokes the token on email change). **Never revoke the verification token:** `customerAccessTokenCreate` returns the SAME token the customer already has.
- Lint fixes: Nav `<a>` → `<Link>`; Header bounce and ItemPage color reset use state adjusted during render; ItemPage `images` in `useMemo`; CookieConsent and LanguageContext read localStorage via `useSyncExternalStore`; SuccessPage effect has proper deps plus a cancel guard; one commented `eslint-disable` in CartContext (restore-cart loading flag).
- `package-lock.json` removed; `"packageManager": "pnpm@11.5.0"`; README rewritten; `.github/workflows/ci.yml` (install, audit high, lint, build; needs 2 GitHub secrets); `.github/dependabot.yml`.
- **Lint baseline is now 0.** Any lint problem is new.

### Spam protection + instant product updates
- **Turnstile:** `src/lib/turnstile.js` (server verify; skipped when `TURNSTILE_SECRET_KEY` is unset) and `src/components/shared/Turnstile/Turnstile.jsx` (explicit render; re-mounted via `key` after each send, because tokens are single-use). `sendEmail.js` checks it after validation and before the rate limit (error `captcha`). CSP allows `challenges.cloudflare.com` (script, connect, frame). Test keys: site `1x00000000000000000000AA`; secrets `1x0000000000000000000000000000000AA` (pass) and `2x0000000000000000000000000000000AA` (fail). `NEXT_PUBLIC_*` is inlined at build time.
- **Webhook:** `src/app/api/shopify-webhook/route.js` checks `?token=` against `SHOPIFY_WEBHOOK_TOKEN` (timing-safe; 503 if unset), then calls `revalidateTag("products", { expire: 0 })` (Next 16 needs the 2nd arg; `{ expire: 0 }` = never serve stale). `scripts/shopify-webhooks.mjs` (`--list`, `--create`, `--delete`) registers PRODUCTS_CREATE/UPDATE/DELETE, INVENTORY_LEVELS_UPDATE and COLLECTIONS_UPDATE on the Inventory Manager app (`uri` field, `includeFields: ["id"]`). It probes the live URL first and never prints the token.
- Vercel env vars added by the user: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `SHOPIFY_WEBHOOK_TOKEN`.

### Re-check fixes
- SEO: the layout no longer sets `alternates.canonical` (every page inherited the home page). `metadataBase` is set in the layout; each public page sets `alternates: { canonical: "/path" }`.

### Shipping details at checkout
- Cart drawer "Checkout" now goes to **`/checkout`** (`src/app/checkout/page.js`, `src/components/checkout/CheckoutPage/`): shipping form + order summary. Hebrew → Israel preselected; logged-in customers pre-filled from their account (`defaultAddress` added to `getCustomer`). Pre-fill and defaults are set during render, not in effects (lint).
- `src/lib/checkoutDetails.js`: one validation used by the form and the server. `src/lib/countries.js`: Shopify's country codes; names via `Intl.DisplayNames`; `REGION_COUNTRIES` need a state field.
- `createHypPayment({ cartId, language, details })` validates details (`invalid_details` + `fields`), links the logged-in customer (cookie name now in `src/lib/session.js`), passes `details` to `createDraftOrder`, and pre-fills Hyp with `ClientName`, `ClientLName`, `email`, `cell`, `street`, `city`. If Hyp refuses to sign, it retries once without those fields.
- Hyp: `UTF8=True` (Hyp's page is windows-1255; Hyp converts) and `UTF8out=True` (redirect back in UTF-8). Hyp has **no zip/country fields**; the full address lives in Shopify.
- `createDraftOrder`: `email`, `shippingAddress` (phone goes here: the order-level `phone` rejects local formats), `shippingLine` "Free shipping" ₪0, **`taxExempt: true`** (store prices exclude tax; otherwise Shopify adds 18% VAT and the total ≠ amount paid), `purchasingEntity.customerId` when logged in. A region that isn't a 2–3 letter code goes on the city line; the region is also saved as attribute `region`.
- `CartContext` exposes `isRestored` (saved cart finished loading), so `/checkout` doesn't flash "empty cart".
- Shopify creates a customer record from a guest's email when a draft order is created; tests delete it.

## Decisions made by the user
- Fix work happens on branch `security-fixes`; commit after each step.
- No Hyp key rotation (no sales ever made).
- Keep the product loading screen (noindex instead of a real 404).
- Keep track of remaining work in `todo.md`; report test results in `report.md`.
- Shipping: own form before Hyp (details pre-filled on Hyp's page), **free shipping**, **Israel + worldwide**, **guest checkout allowed**.

## How to test (reusable)
- `pnpm audit --prod`, `pnpm build`, `pnpm lint`. Lint baseline: **0 problems** (since step 5).
- Run the site: `PORT=3123 pnpm start`, test with curl, then stop it. Don't leave servers running.
- Live checkout tests ran node scripts against the real store, using an alias loader for `@/` imports. They created draft orders and deleted them afterwards (`draftOrderDelete`). Never complete a draft order in tests: that creates a real order and lowers stock.
- Contact-form tests stubbed `resend` and `next/headers` so no email is sent.
- Login tests stub `next/headers` cookies with an in-memory jar. The live account test registers a throwaway `delete-test-<time>@example.com` customer and deletes it (the Admin `customerDelete` cleanup runs in `finally`). Afterwards, check that no `email:delete-test*` customers are left.
- Shipping test (`shipping-test.mjs` in the scratchpad) also deletes guest customers Shopify creates from test emails (`buyer@example.com`).
- Hyp's payment page is windows-1255: decode it with `TextDecoder("windows-1255")` when checking pre-filled values. Signing alone (APISign What=SIGN) never charges anything.
- Product used in tests: Dor Jug `gid://shopify/ProductVariant/45347877388322` (stock 1, ₪89 / $31).

## Open items needing the user
See `todo.md`. Main ones:
1. Check where Hyp's return pages are configured, then the full paid checkout test (needs `SITE_URL=http://localhost:3000` in `.env.local`), including a Hebrew name.
2. Verify the domain in Resend and set `CONTACT_FROM_EMAIL`.
3. Check the browser console for CSP report-only warnings; if none, enforce the CSP.
4. Browser check of the language picker and language switching.
5. Merge `security-fixes` into `main` and deploy (only after the tests above).
