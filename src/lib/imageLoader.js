// ─── Image loader for next/image ──────────────────────────────
// Product photos come from Shopify's CDN, which can resize images
// itself (?width=…) and serves WebP/AVIF to browsers that support
// them. Sending those straight to Shopify avoids Vercel's image
// optimizer, whose monthly allowance on the current plan runs out
// (new photos then fail with "402 Payment Required").
//
// Anything else (the site's own files in /public) still goes through
// Vercel's optimizer, as before.
//
// Usage: <Image loader={imageLoader} src={shopifyUrl} … />

export default function imageLoader({ src, width, quality }) {
  if (typeof src === "string" && src.startsWith("https://cdn.shopify.com/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    return url.toString();
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
