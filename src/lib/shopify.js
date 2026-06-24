import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// ─── Shopify Storefront API Client ────────────────────────────
const client = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  apiVersion: '2025-10',
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
});

export default client;