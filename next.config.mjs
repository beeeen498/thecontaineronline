// ─── Security headers ─────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const shopifyStore = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

// Enforced: directives that can't break the site or the accessibility widget
const enforcedCsp = [
  "frame-ancestors 'none'", // no one can embed the site (clickjacking)
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join('; ');

// Report-only: full allow-list. Browsers log violations in the console
// instead of blocking. Once the console shows no violations (including
// with the Negishot accessibility widget open), rename the header below
// to "Content-Security-Policy" to enforce it.
const reportOnlyCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://negishot.co.il https://cdn.jsdelivr.net https://va.vercel-scripts.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://negishot.co.il",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://negishot.co.il",
  "img-src 'self' data: blob: https://cdn.shopify.com https://negishot.co.il https://media.getmood.io",
  "media-src 'self' https://media.getmood.io",
  `connect-src 'self'${shopifyStore ? ` https://${shopifyStore}` : ''} https://negishot.co.il https://media.getmood.io https://vitals.vercel-insights.com https://challenges.cloudflare.com`,
  "frame-src 'self' https://challenges.cloudflare.com", // Turnstile widget
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: enforcedCsp },
  { key: 'Content-Security-Policy-Report-Only', value: reportOnlyCsp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
