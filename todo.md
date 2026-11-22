# To-do

Working branch: `security-fixes` · Full details for each item are in [upgrade.md](upgrade.md).

## Before merging `security-fixes` into `main`
- [ ] **Full checkout test** (`pnpm dev`, with `SITE_URL=http://localhost:3000` added to `.env.local` so Hyp returns to your machine)
  - [ ] Hebrew: add an item → Checkout → Hyp page shows the right ₪ amount
  - [ ] English: add an item → Checkout → Hyp page shows the right $ amount
  - [ ] Shopify Admin → Orders → Drafts shows a `hyp-pending` draft order with the right items
  - [ ] Pay for a cheap item (then refund in Hyp), or use a Hyp test terminal if available
  - [ ] Success page shows "Payment Successful" and the cart is cleared
  - [ ] Shopify shows a real order tagged `hyp-paid`, with the Hyp transaction in the note, and stock went down
  - [ ] Refresh the success page → still success, no duplicate order
  - [ ] Cancel on the Hyp page → "Payment Failed" page, no order created
- [ ] Merge into `main` and deploy

## Next steps (from upgrade.md)
- [ ] **Step 3 (your part):** verify your domain in Resend, then add `CONTACT_FROM_EMAIL="The Container <contact@thecontaineronline.com>"` to `.env.local` and Vercel
- [ ] **Step 3 (your part):** open the site, use the cart + Negishot widget, check the browser console for `Content-Security-Policy` warnings; if none → switch the CSP to enforced (see `next.config.mjs`)
- [ ] Optional: stronger contact-form spam protection (Vercel KV/Upstash rate limit or Cloudflare Turnstile)
- [ ] **Step 4 (browser check):** in a private window: picker appears → choose Hebrew → reload → page loads in Hebrew with no picker; switch language with the nav button → reload → stays switched
- [ ] Optional: instant updates when you edit a product in Shopify (webhook → clear the `products` cache); right now changes show within 60 seconds
- [ ] **Step 5 (your part):** add GitHub repository secrets `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` (Settings → Secrets and variables → Actions) so CI can build
- [ ] **Step 5 (browser check):** log in with a real account → reload (still logged in) → change email/password → log out
- [ ] **Decide:** fix "Delete account" (never worked): needs Admin scope `write_customers`; customers with orders can't be deleted by Shopify → "request deletion" email instead?
- [ ] Optional: move to Shopify Customer Account API (newer login system, Shopify-hosted login page)

## Open questions / follow-ups
- [ ] Shipping address isn't collected anywhere: decide how to get it (checkout form, Hyp fields, or contact the customer)
- [ ] Abandoned checkouts leave open draft orders in Shopify: delete them from time to time, or automate it
- [ ] Products with several variants at different prices are charged the lowest price: confirm this is OK
- [ ] Two buyers paying for the same one-of-a-kind item at the same moment could both succeed: add rate limiting + a short stock hold later (see report.md)
- [ ] Optional: Shopify's suggestions for Inventory Manager (IP restrictions, expiring access tokens)

## Done
- [x] Upgrade Next.js 16.4.6 / React 19.3.1, `pnpm audit` clean (#5)
- [x] Remove logs that exposed Hyp keys (#4): key rotation not needed, no sales were made
- [x] Server-side checkout with Shopify draft orders (#1, #2, #3, #6, #7, #13, #14, #15)
- [x] Add draft order permissions to the Inventory Manager app
- [x] Quick test: create/read/delete a draft order through the site's code
- [x] Retest steps 1–2, fixed the stock-hold bug and made the Hyp return address configurable (report.md)
- [x] Step 3: contact form hardened (escaping, server validation, honeypot, rate limit, error message) (#8)
- [x] Step 3: security headers; full CSP in report-only mode (#10, #11)
- [x] Step 4: pages rendered on the server in the visitor's language (language cookie) (#9)
- [x] Step 4: 60-second product cache, sitemap refreshes, cart loads only its own products (#17, #18)
- [x] Step 4: missing product pages: kept loading screen, `noindex` instead of 404 (decided)
- [x] Step 5: customer token in httpOnly cookie via server actions (#12)
- [x] Step 5: lint clean (0 problems), CI + Dependabot, removed `package-lock.json`, README rewritten (#19–24)
