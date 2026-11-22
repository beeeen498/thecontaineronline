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
