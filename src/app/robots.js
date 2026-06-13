// ─── Robots ───────────────────────────────────────────────────
// Tells search engine crawlers what to index
// Automatically generated at /robots.txt

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/privacy',
    },
    sitemap: 'https://thecontaineronline.com/sitemap.xml',
  };
}