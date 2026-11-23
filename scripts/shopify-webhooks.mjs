// ─── Shopify webhooks: one-time setup ─────────────────────────
// Tells Shopify to call the site whenever a product, its stock or a
// collection changes, so product pages update right away instead of
// within 60 seconds. Run AFTER the site (with /api/shopify-webhook)
// is live and SHOPIFY_WEBHOOK_TOKEN is set in Vercel:
//
//   node --env-file=.env.local scripts/shopify-webhooks.mjs           list
//   node --env-file=.env.local scripts/shopify-webhooks.mjs --create  set up
//   node --env-file=.env.local scripts/shopify-webhooks.mjs --delete  remove
//
// Uses SHOPIFY_ADMIN_ACCESS_TOKEN (Inventory Manager app); the
// webhooks belong to that app. SITE_URL overrides the live address.

const STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const WEBHOOK_TOKEN = process.env.SHOPIFY_WEBHOOK_TOKEN;
const SITE_URL = process.env.SITE_URL || "https://thecontaineronline.com";

const TOPICS = [
  "PRODUCTS_CREATE",
  "PRODUCTS_UPDATE",
  "PRODUCTS_DELETE",
  "INVENTORY_LEVELS_UPDATE",
  "COLLECTIONS_UPDATE",
];

async function admin(query, variables = {}) {
  const response = await fetch(`https://${STORE}/admin/api/2026-01/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ADMIN_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (!response.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors || response.status));
  }
  return json.data;
}

// The token is a secret: never print it
const mask = (uri) => uri.replace(/token=[^&]+/, "token=•••");

async function list() {
  const data = await admin(`{ webhookSubscriptions(first: 50) {
    edges { node { id topic uri } } } }`);
  return data.webhookSubscriptions.edges.map(({ node }) => node);
}

async function main() {
  if (!STORE || !ADMIN_TOKEN) throw new Error("Shopify env vars missing (.env.local)");
  const mode = process.argv[2] || "--list";
  const existing = await list();

  if (mode === "--list") {
    if (!existing.length) console.log("No webhooks set up.");
    for (const w of existing) console.log(`${w.topic.padEnd(24)} ${mask(w.uri)}`);
    return;
  }

  if (mode === "--delete") {
    for (const w of existing.filter((w) => w.uri.includes("/api/shopify-webhook"))) {
      await admin(`mutation($id: ID!) { webhookSubscriptionDelete(id: $id) { userErrors { message } } }`, { id: w.id });
      console.log(`Removed ${w.topic}`);
    }
    return;
  }

  if (mode === "--create") {
    if (!WEBHOOK_TOKEN || WEBHOOK_TOKEN.length < 32) {
      throw new Error("SHOPIFY_WEBHOOK_TOKEN missing or too short (.env.local)");
    }
    const uri = `${SITE_URL}/api/shopify-webhook?token=${encodeURIComponent(WEBHOOK_TOKEN)}`;

    // Check the site accepts the token before asking Shopify to call it
    const probe = await fetch(uri, { method: "POST", body: "{}" });
    if (probe.status !== 200) {
      throw new Error(`${mask(uri)} answered ${probe.status}: is the new version live, with SHOPIFY_WEBHOOK_TOKEN set in Vercel?`);
    }

    for (const topic of TOPICS) {
      const same = existing.find((w) => w.topic === topic && w.uri === uri);
      if (same) {
        console.log(`${topic.padEnd(24)} already set up`);
        continue;
      }
      const data = await admin(
        `mutation($topic: WebhookSubscriptionTopic!, $sub: WebhookSubscriptionInput!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $sub) {
            webhookSubscription { id }
            userErrors { field message }
          }
        }`,
        { topic, sub: { uri, format: "JSON", includeFields: ["id"] } },
      );
      const errors = data.webhookSubscriptionCreate.userErrors;
      console.log(`${topic.padEnd(24)} ${errors.length ? "FAILED: " + errors[0].message : "set up"}`);
    }
    return;
  }

  throw new Error(`Unknown option ${mode} (use --list, --create or --delete)`);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
