// ─── Robots.txt ─────────────────────────────────────────────
// Tells search engines which pages they can crawl, and points
// them to the sitemap so they can find every page on the site.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account"], // login/account pages — no SEO value, keep out of search results
    },
    sitemap: "https://thecontaineronline.com/sitemap.xml",
  };
}
