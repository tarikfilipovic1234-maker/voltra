import "server-only";
import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    // Pinning an API version makes upgrades explicit.
    apiVersion: "2025-09-30.clover" as Stripe.StripeConfig["apiVersion"],
    typescript: true,
  });
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
