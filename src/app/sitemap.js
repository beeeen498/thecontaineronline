import { getAllProducts } from "@/lib/shopifyQueries";
import articlesData from "@/data/articlesData";

// ─── Sitemap ──────────────────────────────────────────────────
// Tells Google all the pages on the site
// Automatically generated at /sitemap.xml

export default async function sitemap() {
  const baseUrl = "https://thecontaineronline.com";

  // ─── Static Pages ─────────────────────────────────────
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/art`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/fashion`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/info`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: 0.3 },
  ];

  // ─── Product Pages ────────────────────────────────────
  const products = await getAllProducts();
  const productPages = products.map((product) => ({
    url: `${baseUrl}/item/${product.handle}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  // ─── Article Pages ────────────────────────────────────
  const articlePages = Object.keys(articlesData).map((id) => ({
    url: `${baseUrl}/info/article/${id}`,
    lastModified: new Date(),
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...articlePages];
}
