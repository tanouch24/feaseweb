import "server-only";
import Stripe from "stripe";
import { stripeSecretKey } from "@/lib/stripe/config";

let cached: Stripe | null = null;

/**
 * Returns a server-only Stripe client, or null if not configured.
 * LIVE keys are accepted here because billing is intentionally configured
 * for LIVE; tests mock this module and never call the Stripe API. No
 * apiVersion is pinned: the installed SDK's own default
 * (currently "2026-08-26.dahlia") is used, so upgrading the `stripe`
 * package is what changes the API version, not a hardcoded string here.
 */
export function getStripe(): Stripe | null {
  if (!stripeSecretKey) return null;
  if (cached) return cached;
  cached = new Stripe(stripeSecretKey);
  return cached;
}
