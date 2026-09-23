import "server-only";

// Server-only Stripe configuration. Never import this from a client component —
// STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must never reach the browser bundle.
export const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
export const stripePriceId = process.env.STRIPE_PRICE_ID;
export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function isStripeLiveKey(key: string | undefined | null) {
  return Boolean(key && /^(sk|rk)_live_/.test(key));
}

export function isStripeConfigured() {
  return Boolean(stripeSecretKey && stripePriceId);
}

export function isStripeWebhookConfigured() {
  return Boolean(stripeWebhookSecret);
}

export function getSafeAppUrl() {
  try {
    const url = new URL(appUrl);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password || url.hash) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
