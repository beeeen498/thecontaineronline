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
