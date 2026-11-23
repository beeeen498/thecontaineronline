// ─── Shopify product webhook ──────────────────────────────────
// Shopify calls this when a product or its stock changes, so the
// site drops its 60-second product cache right away.
// Set up once with: node --env-file=.env.local scripts/shopify-webhooks.mjs
//
// Protected by a long random token in the URL (SHOPIFY_WEBHOOK_TOKEN).
// The worst a leaked token allows is an extra cache refresh.
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

function tokenMatches(given, expected) {
  const a = Buffer.from(given || "");
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  const expected = process.env.SHOPIFY_WEBHOOK_TOKEN;
  if (!expected || expected.length < 32) {
    return new Response("Not configured", { status: 503 });
  }

  const token = new URL(request.url).searchParams.get("token");
  if (!tokenMatches(token, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // { expire: 0 }: the next visitor gets fresh data, never stale
  revalidateTag("products", { expire: 0 });
  return new Response("ok");
}
