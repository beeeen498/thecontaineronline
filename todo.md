# To-do

Working branch: `security-fixes` · Full details for each item are in [upgrade.md](upgrade.md).

## Before merging `security-fixes` into `main`
- [ ] **Check Hyp's dashboard first:** where are the success / error return pages set? (Hyp's docs say it's a terminal setting, so our `SuccessUrl` might be ignored and Hyp might always return to the live site.)
- [ ] **Full checkout test** (`pnpm dev`, with `SITE_URL=http://localhost:3000` added to `.env.local` so Hyp returns to your machine)
  - [ ] Cart → Checkout opens the shipping form; fill it in (use a **Hebrew name** in one test) → Hyp page shows your details pre-filled
  - [ ] Logged in: the form is pre-filled with your account details
  - [ ] Hebrew: add an item → Checkout → Hyp page shows the right ₪ amount
  - [ ] English: add an item → Checkout → Hyp page shows the right $ amount
  - [ ] Shopify Admin → Orders → Drafts shows a `hyp-pending` draft order with the right items
  - [ ] Pay for a cheap item (then refund in Hyp), or use a Hyp test terminal if available
  - [ ] Success page shows "Payment Successful" and the cart is cleared
  - [ ] Shopify shows a real order tagged `hyp-paid`, with the Hyp transaction in the note, and stock went down
  - [ ] The order has the shipping address, email, phone, "Free shipping", and total = amount paid
  - [ ] Refresh the success page → still success, no duplicate order
  - [ ] Cancel on the Hyp page → "Payment Failed" page, no order created
- [ ] Merge into `main` and deploy

## Right after deploying (only work on the live domain)
- [ ] Negishot accessibility widget appears and works (it only loads on thecontaineronline.com, not on localhost)
- [ ] Browser console on the live site: no `[Report Only] Refused to…` messages with the widget and Vercel Analytics running → then switch the CSP to enforced (`next.config.mjs`)

## Next steps (from upgrade.md)
- [ ] **Step 3 (your part):** verify your domain in Resend (DNS is at **GoDaddy**; use Resend's **Auto configure**, and check that it only *adds* records), then add `CONTACT_FROM_EMAIL="The Container <contact@thecontaineronline.com>"` to `.env.local` and Vercel
- [ ] Optional: stronger contact-form spam protection (Vercel KV/Upstash rate limit or Cloudflare Turnstile)
- [ ] Optional: instant updates when you edit a product in Shopify (webhook → clear the `products` cache); right now changes show within 60 seconds
- [ ] **Step 5 (your part):** add GitHub repository secrets `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` (Settings → Secrets and variables → Actions) so CI can build
- [ ] Optional: move to Shopify Customer Account API (newer login system, Shopify-hosted login page)

## Open questions / follow-ups
- [ ] **Ask your accountant:** orders are created tax-exempt so the total matches the price paid. Alternative: Shopify Settings → Taxes → "All prices include tax" (orders then show VAT inside the price). See report.md.
- [ ] English (USD) orders are recorded in Shopify in ₪ at the Israel price; the real amount paid in $ is in the order's `hyp_amount` / `hyp_currency` attributes
- [ ] Abandoned checkouts leave open draft orders in Shopify: delete them from time to time, or automate it
- [ ] Products with several variants at different prices are charged the lowest price: confirm this is OK
- [ ] Two buyers paying for the same one-of-a-kind item at the same moment could both succeed: add rate limiting + a short stock hold later (see report.md)
- [ ] Optional: Shopify's suggestions for Inventory Manager (IP restrictions, expiring access tokens)

## Done
- [x] Browser check on a local production build (2026-11-23): language picker + switching, all pages, cart, checkout form (both languages, phone view), "Current password" field; console has no CSP messages (only the Vercel Analytics script, which exists only on Vercel)
- [x] Cart: **+** greyed out when the cart already holds all the stock (was clickable, then said "No more in stock")
- [x] Shipping details at checkout: new `/checkout` page (address form + order summary), saved on the Shopify order, pre-fills Hyp's page; free shipping, Israel + worldwide, guest checkout (live-tested, report.md)
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
- [x] "Delete account" fixed: Admin API delete; accounts with orders → emailed deletion request; `write_customers` added
- [x] Live account test: register/login/reload/email+password change/logout/delete all pass; fixed 2 logout bugs
