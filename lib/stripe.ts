import "server-only";
import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    // Pinning an API version makes upgrades explicit. Matches the version the
    // installed stripe-node ships with (see node_modules/stripe apiVersion).
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
