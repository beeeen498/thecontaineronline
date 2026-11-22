# To-do

Working branch: `security-fixes` · Full details for each item are in [upgrade.md](upgrade.md).

## Before merging `security-fixes` into `main`
- [ ] **Full checkout test** (`pnpm dev`)
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
- [ ] **Step 3:** contact form: escape HTML, validate on the server, spam protection, verify own sending domain in Resend (#8)
- [ ] **Step 3:** security headers / CSP in `next.config.mjs` (#10, #11)
- [ ] **Step 4:** render real content for search engines instead of only the language picker (#9)
- [ ] **Step 4:** caching (`revalidate`) + stop loading the whole catalog in the browser (#17, #18)
- [ ] **Step 5:** customer login token → httpOnly cookie / Customer Account API (#12)
- [ ] **Step 5:** CI, remove `package-lock.json`, rewrite README, fix existing lint errors (#19–24)

## Open questions / follow-ups
- [ ] Shipping address isn't collected anywhere: decide how to get it (checkout form, Hyp fields, or contact the customer)
- [ ] Abandoned checkouts leave open draft orders in Shopify: delete them from time to time, or automate it
- [ ] Products with several variants at different prices are charged the lowest price: confirm this is OK
- [ ] Optional: Shopify's suggestions for Inventory Manager (IP restrictions, expiring access tokens)

## Done
- [x] Upgrade Next.js 16.4.6 / React 19.3.1, `pnpm audit` clean (#5)
- [x] Remove logs that exposed Hyp keys (#4): key rotation not needed, no sales were made
- [x] Server-side checkout with Shopify draft orders (#1, #2, #3, #6, #7, #13, #14, #15)
- [x] Add draft order permissions to the Inventory Manager app
- [x] Quick test: create/read/delete a draft order through the site's code
