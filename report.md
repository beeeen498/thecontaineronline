# Test Report — "Delete account" fix
_2026-11-22 · branch `security-fixes`_

## Result: ✅ all checks pass, including a live end-to-end test (`write_customers` added)

### Live account test (real Shopify store, throwaway customer, deleted at the end)
| Check | Result |
|---|---|
| Register + automatic login; cookie is httpOnly, sameSite lax, with expiry | ✅ |
| Token never sent to the browser | ✅ |
| Still logged in after reload | ✅ |
| Email/password change without, or with the wrong, current password → refused | ✅ |
| Email change → still logged in with the new email | ✅ (bug fixed, see below) |
| Password change → still logged in; old password stops working | ✅ (bug fixed, see below) |
| Logout clears the session; log back in works | ✅ |
| Delete account (no orders) → deleted in Shopify, logged out | ✅ |
| No test customers left in the store | ✅ 0 |

### Bugs found by the live test (fixed)
- **Changing email logged the customer out.** Shopify cancels the login token when the email changes and doesn't issue a new one. This bug existed before. The email form now asks for the **current password**, and the server logs the customer back in with the new email. This is also safer: a hijacked session can't change the account email.
- **Changing the password logged the customer out (my mistake from step 5).** After checking the current password, the code revoked the "extra" token. Shopify actually returns the *same* token the customer is logged in with, so revoking it logged them out. Removed.

### Tests with fakes

| Check | Result |
|---|---|
| Customer with no orders → deleted in Shopify, logged out, no email | ✅ |
| Customer with orders → not deleted; deletion request emailed to the shop (customer details, reply-to, "Erase personal data" instructions); customer stays logged in and sees a message | ✅ |
| Shopify refuses to delete → falls back to an emailed request | ✅ |
| Permission missing → plain error, no email sent | ✅ |
| Logged out → refused, nothing called | ✅ |
| Admin API `customerDelete` input/output match Shopify's schema (checked live, read-only) | ✅ |
| `pnpm lint` (0 problems), `pnpm build`, earlier login tests (11) | ✅ |

The fake-based tests didn't delete any real customer or send any email. The live test used one throwaway `@example.com` customer, deleted at the end.

## What changed
- `deleteCustomerAccount` (`src/app/actions/customer.js`) now uses the **Admin API** (`deleteCustomer` in `src/lib/shopifyAdmin.js`). Removed the broken Storefront `customerDelete`.
- `src/lib/email.js`: server-only helper for emails to the shop. It isn't a server action, so the browser can't call it.
- `AccountPage.jsx` shows a "request received" message (EN/HE) when the request is emailed. The email form now has a **Current password** field.

---

# Test Report — Step 5
_2026-11-22 · branch `security-fixes`_

## Result: ✅ all checks pass · lint is now clean (0 problems, was 11)

| Area | Check | Result |
|---|---|---|
| Lint | `pnpm lint` | ✅ **0 problems** (was 8 errors + 3 warnings) |
| Build | `pnpm build` | ✅ |
| CI steps run locally | `pnpm install --frozen-lockfile`, `pnpm audit --prod --audit-level high` | ✅ |
| Login | Logged out: no customer, update/delete refused, logout works | ✅ |
| Login | Wrong password → error, no cookie set; Hebrew error translation still matches | ✅ |
| Login | Garbage input (objects, missing fields) rejected | ✅ |
| Login | Fake old-style token → ignored, no cookie | ✅ |
| Login | Expired/invalid cookie → logged out and cookie removed | ✅ |
| Login | Token never sent to the browser | ✅ |
| Pages | 12 pages incl. all account pages (Hebrew cookie) | ✅ 200, no server errors |

## What changed
- **Login token moved to an httpOnly cookie** (#12). New server actions in `src/app/actions/customer.js`. `CustomerContext.js` calls them and never sees the token. Customers already logged in are moved over automatically on their next visit.
- **Lint errors fixed** in Nav, Header, ItemPage, CookieConsent, LanguageContext, CartContext and SuccessPage. Behaviour is unchanged. One line in `CartContext.js` is an intentional, commented exception.
- **Cleanup:** removed `package-lock.json`, pinned `pnpm@11.5.0`, rewrote the README.
- **CI** (`.github/workflows/ci.yml`): audit, lint and build on every push. **Dependabot** (`.github/dependabot.yml`): weekly dependency-update PRs.

## Bugs found
- **"Delete account" has never worked (fixed afterwards, see the section above).** Shopify's Storefront API has no delete-customer action (confirmed by asking the API). The button always showed an error. Fixing it needs the Admin API permission `write_customers`. Shopify also refuses to delete customers who have orders, so for those the shop would need a "request deletion" flow instead.
- **Old account-page flicker (fixed).** On a fresh page load, a logged-in customer could be bounced to the login page for a moment, because the login check started as "not loading".
- **Cookie banner crashed if browser storage was blocked (fixed).** The banner now stays hidden in that case.

## Not tested (needs a real account / browser)
- Logging in with a real account, staying logged in after reload, updating email/password, logging out. No test customer was created, because it couldn't be deleted afterwards (see above).

## Notes
- Login requests now reach Shopify from Vercel's servers instead of each shopper's browser. Shopify's per-IP protection against password guessing therefore sees Vercel's IP. That's fine at this shop's traffic level.
- **Customer Account API** (Shopify's newer login system) wasn't adopted. It means a redirect-based login hosted by Shopify, which is a bigger UX change. The current classic login keeps working.

---

# Test Report — Step 4
_2026-11-22 · branch `security-fixes`_

## Result: ✅ all checks pass

| Area | Check | Result |
|---|---|---|
| Build / lint | `pnpm build`, `pnpm lint` | ✅ builds · ⚠️ same 11 lint issues as before |
| SEO | Visitor/crawler with no language chosen gets real page content (e.g. products on `/art`) | ✅ (before: **empty page**) |
| SEO | No language chosen → English, `lang="en" dir="ltr"`; picker appears after load | ✅ |
| Language | Hebrew cookie → server sends Hebrew page with `lang="he" dir="rtl"` (no flash) | ✅ |
| Language | English cookie → English page | ✅ |
| Language | Invalid cookie value ignored | ✅ |
| Pages | `/`, `/art`, `/fashion`, `/info`, `/privacy`, `/terms`, `/account/login`, `/checkout/success`, articles, a real product | ✅ 200 |
| 404 | Missing product → `noindex` (Google won't index it) | ✅ (status stays 200, see below) |
| Sitemap | Includes products, now refreshes automatically | ✅ 101 URLs |
| Caching | Repeat visits to `/fashion` served from cache | ✅ ~13 ms |
| Cart | Cart loads only its own products; same names/prices/images as before | ✅ 4 KB instead of 206 KB (94 products) per visit |

## Bugs found and fixed
- **The server sent an empty page.** `LanguageContext` rendered nothing until the browser had loaded, so Google and link previews (WhatsApp, Facebook) saw a blank page on every URL. The page is now rendered on the server in the visitor's language.
- **The sitemap never updated.** It was generated once at build time, so new products didn't appear until the next deploy. It now refreshes automatically.
- **Pages would crash with no language chosen** (`FeaturedItemsClient`, `YouMayAlsoLike`, `ArtStorePage`, `FashionStorePage` called `language.toLowerCase()`). This didn't happen before because nothing rendered without a language, but the new SEO rendering would have exposed it. Fixed.
- **New lint issue in my cart change.** Found and fixed before testing.

## Decision
- **Missing product pages keep the loading screen** (your choice). They answer 200 with `noindex` rather than a 404. Removing the loading screen gave a real 404 in testing, but at the cost of no placeholder while products load.

## Not tested (needs a real browser)
- The language picker appearing over the page for first-time visitors, and choosing a language.
- Returning visitors who chose a language before this change (saved only in the browser): they should be switched automatically without seeing the picker.
- Switching language with the nav button, then reloading: the page should load in the new language straight away.

---

# Test Report — Step 3
_2026-11-22 · branch `security-fixes`_

## Result: ✅ all checks pass

| Area | Check | Result |
|---|---|---|
| Build / lint | `pnpm build`, `pnpm lint` | ✅ builds · ⚠️ same 11 lint issues as before, none in changed files |
| Contact form | Hidden anti-bot field filled → nothing sent | ✅ |
| Contact form | Missing name / bad email / bad phone / garbage input rejected on the server | ✅ |
| Contact form | HTML and links typed into the form are shown as plain text in the email | ✅ |
| Contact form | Line breaks kept, subject can't inject extra email headers | ✅ |
| Contact form | Reply-To = sender's email (just press Reply) | ✅ |
| Contact form | Long input trimmed (message max 5000 characters) | ✅ |
| Contact form | 4th message from the same visitor within 10 minutes blocked | ✅ |
| Contact form | Resend errors now shown as failures | ✅ (bug found, see below) |
| Headers | All security headers present on every page | ✅ |
| Pages | `/`, `/art`, `/fashion`, `/info`, `/privacy`, `/checkout/success`, `/account/login`, `/sitemap.xml` load | ✅ |

The contact tests used a fake email sender, so no real emails were sent.

## Bug found in the old code (fixed)
- **The contact form showed "Sent!" even when the email failed.** Resend reports problems (e.g. an unverified domain) by returning an error, not by throwing one, and the old code never checked for it. Messages could be lost without anyone knowing. The form now shows an error and suggests WhatsApp.

## Found, not fixed yet (added to todo.md)
- A product page that doesn't exist (`/item/doesnotexist`) answers with status 200 instead of 404. This existed before. It's caused by the product page's loading screen and affects SEO, so it's part of step 4.

## Notes
- **Rate limiting is basic.** It's kept in the server's memory, so it resets on restart and each Vercel instance counts separately. It stops casual scripted spam; for stronger protection, add Vercel KV/Upstash or Cloudflare Turnstile later.
- **The full Content Security Policy is in report-only mode.** The browser only logs what it *would* block, so nothing can break yet. Before enforcing it, open the site, use the cart and the Negishot accessibility widget, and check the browser console for `Content-Security-Policy` messages.

---

# Test Report — Steps 1 & 2
_2026-11-22 · branch `security-fixes`_

## Result: ✅ all checks pass (after 2 fixes)

| Area | Check | Result |
|---|---|---|
| Dependencies | `pnpm audit --prod` | ✅ No known vulnerabilities (was 40) |
| Build | `pnpm build` | ✅ Compiles, all 18 routes |
| Lint | `pnpm lint` | ⚠️ 11 issues, all in files not changed by us (existed before) |
| Checkout | Bad / unknown cart ID rejected | ✅ |
| Checkout | Price set by server, client `amount` ignored | ✅ ₪89 (Hebrew) / $31 (English) for Dor Jug |
| Checkout | Correct currency sent to Hyp | ✅ Coin 1 = ILS, Coin 2 = USD |
| Checkout | Hyp payment page opens | ✅ HTTP 200, both languages |
| Checkout | No secrets in the payment URL | ✅ |
| Payment confirm | Failed payment (`CCode≠0`) rejected | ✅ |
| Payment confirm | Fake success URL (no valid Hyp signature) rejected | ✅ |
| Payment confirm | Attempt to override our Hyp credentials rejected | ✅ |
| Payment confirm | Order untouched after forged attempts | ✅ stays OPEN |
| Stock | Starting checkout without paying doesn't change stock | ✅ (after fix 1) |
| Cleanup | All test draft orders deleted from the store | ✅ none left |

All tests ran against the live Shopify store and Hyp without charging anything.

## Bugs found and fixed

### 1. Anyone could make products look sold out (fixed)
Each click on Checkout held the items for 30 minutes, whether or not the customer paid. The test also showed that two checkouts could hold the same single item (stock went to −1), so holding stock didn't prevent double sales either.
**Fix:** removed the hold (`src/lib/shopifyAdmin.js`). Re-tested: stock stays the same until a payment is confirmed.

### 2. Checkout couldn't be tested locally (fixed)
Hyp's return address was hard-coded to the live site, so a test payment from `pnpm dev` would return to the old code on the live site.
**Fix:** the return address now comes from an optional `SITE_URL` setting (`src/app/actions/createHypPayment.js`) and defaults to the live site. Re-tested: `SITE_URL=http://localhost:3000` is used.

### Not a bug: wrong test expectation
The first run expected 2 × Dor Jug. You have only 1 in stock, so Shopify correctly limits the cart to 1.

## Not tested yet
- **The successful-payment path** (a real Hyp payment → Shopify order created, stock reduced). It needs a real or test payment and is in `todo.md` under "Full checkout test". To run it locally, add `SITE_URL=http://localhost:3000` to `.env.local`.

## Notes
- Without the stock hold, two people paying for the same one-of-a-kind item within the same few minutes could both succeed. This is rare; the shop would refund one of them. A safe fix needs rate limiting, which is in todo.md.
- The `globalprice` metafield on products is labelled `ILS` in Shopify but holds the USD price. The site already treats it as USD, so nothing breaks, but the label in Shopify Admin is misleading.
