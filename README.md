# The Container

Online store for **thecontaineronline.com**: handmade ceramic art and luxury fashion, in English and Hebrew.

- **Framework:** Next.js 16 (App Router), React 19, JavaScript, SCSS
- **Products & orders:** Shopify (Storefront API for the catalog, Admin API for orders)
- **Payments:** Hyp Pay (Israeli payment gateway)
- **Contact form email:** Resend
- **Hosting:** Vercel
- **Package manager:** pnpm (version pinned in `package.json`)

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm audit --prod`.

## Environment variables

Put these in `.env.local` (never commit it), and in Vercel → Project → Settings → Environment Variables.

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Shopify store domain (`xxx.myshopify.com`) |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Storefront API token (public, read-only catalog + carts + customer login) |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Admin API token from the **Inventory Manager** app. Scopes: `read_products`, `read_inventory`, `write_inventory`, `read_draft_orders`, `write_draft_orders`, `write_customers` |
| `HYP_TERMINAL_NUMBER`, `HYP_API_KEY`, `HYP_PASS_P` | Hyp Pay terminal credentials |
| `RESEND_API_KEY` | Sending contact-form emails |
| `CONTACT_FROM_EMAIL` | _Optional._ Sender for contact emails once your domain is verified in Resend |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | _Optional._ Cloudflare Turnstile "are you human" check on the contact form (Cloudflare → Turnstile). Without them the form still works (hidden trap field + rate limit) |
| `SHOPIFY_WEBHOOK_TOKEN` | Long random secret for `/api/shopify-webhook` (instant product updates). Set up the Shopify side once with `node --env-file=.env.local scripts/shopify-webhooks.mjs --create` |
| `SITE_URL` | _Optional._ Where Hyp sends customers back after paying (defaults to the live site; set `http://localhost:3000` to test checkout locally) |

## How checkout works

1. The cart is a Shopify cart; its ID is kept in the browser.
2. **Checkout:** the cart's Checkout button opens `/checkout`, where the customer enters shipping details (free shipping, Israel + worldwide, guests allowed). The browser sends the cart ID and those details. The server validates them, prices the cart (₪ for Hebrew, $ for English), creates a Shopify **draft order** with the address (tag `hyp-pending`), and redirects to Hyp's payment page with the customer's details pre-filled. See `src/app/actions/createHypPayment.js`.
3. **After payment:** Hyp redirects to `/checkout/success`. The server verifies the payment with Hyp and checks the amount against the draft order. It then completes the draft order, so Shopify creates the real order (tag `hyp-paid`) and lowers stock. See `src/app/actions/handlePaymentSuccess.js`.
4. Abandoned checkouts leave open draft orders in Shopify Admin → Orders → Drafts. Those can be deleted.

## Other notes

- **Language:** saved in a `language` cookie so pages render in the right language on the server. First-time visitors see a language picker.
- **Customer login:** the Shopify customer token is kept in an httpOnly cookie by server actions (`src/app/actions/customer.js`).
- **Caching:** product data is cached for 60 seconds (`src/lib/catalog.js`). Shopify calls `/api/shopify-webhook` when products, stock or collections change, which clears it immediately.
- **Security headers:** see `next.config.mjs`. The full Content-Security-Policy is report-only for now.
- **CI:** `.github/workflows/ci.yml` runs audit, lint and build on every push. It needs the two `NEXT_PUBLIC_SHOPIFY_*` values as GitHub repository secrets.

## Project docs

- `progress.md`: what has been done and why (read first)
- `todo.md`: what's left
- `report.md`: test results
- `upgrade.md`: original review and recommendations
