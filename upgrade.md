# The Container — Project Review & Upgrade Report
_Reviewed 2026-11-22 · commit 0348e9d_

## Overall opinion
The codebase is clean and easy to follow: consistent folder-per-component structure, BEM SCSS, good comments, proper bilingual (EN/HE + RTL) support, SEO basics (metadata, sitemap, robots, JSON-LD), and secrets correctly kept out of git (`.env*` is gitignored, never committed).

The weak spot is the **checkout/payment flow**. It was built client-first: the browser decides the price, the browser tells the server to reduce inventory, and no order is recorded anywhere. Next.js server actions are public HTTP endpoints, so anything the browser can call, an attacker can call too. Fix that first, then update dependencies.

---

## 🔴 Critical — fix now

### 1. Customers can choose their own price
`src/components/cart/CartDrawer/CartDrawer.jsx:52-69` works out `amount` in the browser and sends it to `createHypPayment` (`src/app/actions/createHypPayment.js:8`). The server trusts it. Anyone can call the action with `amount: 1` and pay ₪1 for any cart.
**Fix:** send only the cart ID to the server. On the server, load the cart from Shopify (`getCart`), look up the prices, and work out the total there. Also store `orderId → {cartId, amount, currency}` on the server (Shopify draft order, KV, or DB) so the payment can be matched to it later.

### 2. Anyone can wipe out the store's inventory
`updateInventoryAfterPayment` (`src/app/actions/handlePaymentSuccess.js:37`) is an exported server action with no checks. Anyone can call it with any variant ID and quantity, using the Admin API token. The only "guard" is the browser calling `verifyHypPayment` first (`SuccessPage.jsx:44-56`), and an attacker can simply skip that step.
**Fix:** don't export inventory changes as a server action. Run them only on the server, after verifying the payment, and only for the order stored in step 1. Make it idempotent: each `orderId` can reduce inventory only once.

### 3. Payment verification can be replayed and isn't linked to the order
`verifyHypPayment` (`handlePaymentSuccess.js:14-33`) spreads every URL parameter from the attacker into the Hyp request (`...searchParamsObj`). It also only checks `text.includes("CCode=0")`. It never checks the amount, the order ID, or whether that transaction was already used, so one real low-value payment URL can be reused.
**Fix:** forward only the fields Hyp's VERIFY documents (Id, CCode, Amount, ACode, Order, Sign, …). Parse the response properly. Check that `Order` and `Amount` match the stored order. Mark the order as paid exactly once. Better still, use a server-to-server notification/webhook route instead of relying on the browser redirect.

### 4. Payment secrets are written to logs
`createHypPayment.js:36` logs the full Hyp URL, which includes `KEY` and `PassP`. Line 11 logs the terminal number and line 43 logs the signed response. Anyone with access to Vercel logs can read the payment credentials.
**Fix:** remove these logs, then **rotate `HYP_API_KEY` / `HYP_PASS_P`**, because they are probably already in the log history.

### 5. Next.js has known critical vulnerabilities (16.2.9)
`pnpm audit --prod` finds **40 advisories (5 critical, 18 high)**. These include unauthenticated RCE in the Image Optimization API (this site uses `next/image`), DoS through Server Actions, SSRF, and cache poisoning. The patched version is ≥ 16.4.5.
**Fix:** `pnpm up next@^16.4.6 eslint-config-next@^16.4.6 react@^19.3.1 react-dom@^19.3.1`, then `pnpm up` for the transitive dependencies (postcss, sharp, nanoid, immutable, browserslist). Run `pnpm audit` again afterwards.

---

## 🟠 High

### 6. English customers are charged in the wrong currency
The drawer shows English users `globalPrice` (USD, `CartDrawer.jsx:43`). Checkout always sends `israelPrice` (`CartDrawer.jsx:56`), while `createHypPayment` sets `Coin: "2"` (USD) for non-Hebrew users (`createHypPayment.js:27`). So a ₪500 item is charged as **$500**, not the USD price shown. Fix this together with #1 (work out amount and currency on the server).

### 7. No order is recorded anywhere
Payment goes to Hyp, which receives only an amount and an order ID. Inventory is then adjusted with reason `correction`. The store owner gets no Shopify order, line items, or shipping address, and if the customer closes the tab before `/checkout/success` loads, inventory never changes. **Recommendation:** create a Shopify order (Admin `orderCreate` / draft order → complete) when payment is verified. Or switch to Shopify Checkout with Hyp as a Shopify payment provider, if that's possible. Either way, Shopify handles inventory, order emails, and the order history (`AccountPage` already reads `customer.orders`, which will stay empty under the current flow).

### 8. Contact form: HTML injection and spam
`src/app/actions/sendEmail.js:13-21` puts `fullName`, `phone`, `email`, and `message` straight into HTML without escaping. The action has no server-side validation and no rate limiting, so it can be scripted to flood the inbox with phishing-style HTML. It also sends from `onboarding@resend.dev` (Resend's test sender).
**Fix:** escape values (or use `text:`), validate and limit length on the server, add rate limiting (Vercel KV / Upstash) or a honeypot field / Cloudflare Turnstile, set `replyTo: email`, and verify your own sending domain in Resend.

### 9. Whole site renders client-only behind the language gate (SEO)
`LanguageGate` (`src/components/selectLanguage/LanguageGate.jsx:13`) shows `SelectLanguagePage` until `localStorage` has a language. On the server it's always null, so **every page's server HTML contains only the language picker**, and crawlers and link previews see no product content. **Fix:** default to a language (e.g. from `Accept-Language` or a cookie) on the server, and show the picker as an overlay or banner on top of rendered content. Longer term, use locale routes (`/en/...`, `/he/...`) with `hreflang`.

---

## 🟡 Medium

10. **No security headers.** `next.config.mjs` sets no CSP, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`, or HSTS. Add them through `headers()`. The CSP must allow Shopify CDN, Vercel Analytics, `negishot.co.il`, and `pay.hyp.co.il`.
11. **Third-party script runs with full page access.** The Negishot widget (`src/app/layout.js:100-103`) loads with no integrity check and can read the customer token from localStorage (see #12). Limit it with CSP and accept the risk knowingly.
12. **Customer access token is stored in `localStorage`** (`src/contexts/CustomerContext.js:79,110`). Any XSS or third-party script can steal it. Better: keep it in an `httpOnly; Secure; SameSite=Lax` cookie set by a server action/route handler, and make customer calls from the server. Also consider migrating to Shopify's **Customer Account API**, since the legacy Storefront customer mutations (`customerCreate`, `customerAccessTokenCreate`, …) are deprecated.
13. **GraphQL built with string interpolation.** `getProductByHandle` puts `handle` (from the URL) directly into the query (`src/lib/shopifyQueries.js:215`). `decreaseInventory` does the same with `variantId` (`src/lib/shopifyAdmin.js:23`). This is a GraphQL injection risk, especially for the Admin call. Use `$variables` like the cart mutations already do.
14. **Inventory adjustment isn't atomic.** `decreaseInventory` reads and then adjusts separately (`shopifyAdmin.js:58-100`), so two purchases at the same moment can oversell a one-of-a-kind item. Use `inventoryAdjustQuantities` with `changeFromQuantity` (compare-and-set) or `inventorySetQuantities` with `compareQuantity`. Also, the Admin API version `2025-10` is behind the Storefront version `2026-01`. Keep them in sync.
15. **Admin calls ignore HTTP and GraphQL `errors`.** Only `userErrors` is checked. An expired token fails silently. Also, `SuccessPage.jsx:66` shows "success" even when processing throws.
16. **Password reset accepts any `reset_url`** (`ConfirmResetPage.jsx:20`). Shopify validates it, but check that it starts with `https://<your-store-domain>/account/reset/` before sending.

---

## 🔵 Performance & code quality

17. **Every page fetches the whole catalog in the browser.** `CartProvider` calls `getAllProducts()` on mount (`src/contexts/CartContext.js:33`), which pages through both collections with 100 variants each, on every visit. The item page also calls `getAllProducts()` just to show related items (`src/app/item/[handle]/page.js:36`). Instead, fetch prices for the cart lines only (the Shopify cart already returns `merchandise` and `cost`). For related items, query the collection with a `first:` limit.
18. **`revalidate = 0` on every route** turns off caching completely, so each page view makes several Shopify calls. Use `revalidate = 60` (or tag-based revalidation from a Shopify product webhook). Stock is still checked live in the cart.
19. **Two lockfiles**: `package-lock.json` and `pnpm-lock.yaml` are both committed. Delete `package-lock.json`, add `"packageManager": "pnpm@…"` to package.json.
20. **Leftover debug logs**: `FashionStorePage.jsx:185`, the Hyp logs (#4), and cart `console.error`s in production.
21. **`ErrorUrl` = `SuccessUrl`** in Hyp (`createHypPayment.js:32-33`). Point it to a dedicated failure page. Also, the domain is hard-coded in 6+ places; move it to `NEXT_PUBLIC_SITE_URL`.
22. **JSON-LD** (`item/[handle]/page.js:71`): uses `next/script` for structured data. A plain `<script type="application/ld+json">` is recommended, with `<` escaped (`.replace(/</g,'\\u003c')`). It also always says `priceCurrency: 'USD'`, but `globalPrice` can be null.
23. **No tests, no TypeScript, no CI.** At minimum, add a GitHub Action running `pnpm lint && pnpm build && pnpm audit --prod`. Turn on Dependabot/Renovate. Converting the `lib/` and `actions/` files to TypeScript would catch shape bugs like #6.
24. **README** is still the create-next-app template. Document the env vars, the Hyp flow, and the deploy process.

---

## 📦 Dependency upgrades
| Package | Current | Latest | Note |
|---|---|---|---|
| next / eslint-config-next | 16.2.9 | 16.4.6 | **Security — do first** |
| react / react-dom | 19.2.4 | 19.3.1 | upgrade together with next |
| resend | 6.14.0 | 6.39.0 | minor |
| sass | 1.101.0 | 1.108.2 | minor |
| react-icons | 5.6.0 | 5.7.0 | minor |
| @shopify/storefront-api-client | 1.0.10 | 2.0.1 | major; check changelog |
| eslint | 9.39.4 | 10.15.0 | major; optional |

---

## Suggested order of work
1. Upgrade Next.js / React (#5). Remove the secret logs and rotate Hyp keys (#4).
2. Rebuild checkout on the server: server-side total + currency, stored order, strict verify, idempotent inventory/order creation, no exported inventory action (#1, #2, #3, #6, #7, #13, #14).
3. Harden the contact form (#8). Add security headers / CSP (#10, #11).
4. SSR the language gate for SEO (#9). Fix caching and remove the client-side catalog fetch (#17, #18).
5. Move auth to httpOnly cookies / Customer Account API (#12). Add CI, clean up lockfiles and the README (#19–24).
