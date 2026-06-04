import Stripe from "stripe";
import { PLAN_CONFIG, type PlanKey } from "@/lib/plan-config";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Re-export so existing server imports keep working
export { PLAN_CONFIG as PLANS, type PlanKey } from "@/lib/plan-config";

// ─── Stripe price IDs (server-only) ──────────────────────────────────────────

const STRIPE_PRICE_IDS = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || "",
  },
  plus: {
    monthly: process.env.STRIPE_PRICE_PLUS_MONTHLY || "",
    yearly: process.env.STRIPE_PRICE_PLUS_YEARLY || "",
  },
} as const;

export function getPlanFromPriceId(
  priceId: string
): { plan: PlanKey; interval: "monthly" | "yearly" } | null {
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return { plan: "pro", interval: "monthly" };
  if (priceId === process.env.STRIPE_PRICE_PRO_YEARLY) return { plan: "pro", interval: "yearly" };
  if (priceId === process.env.STRIPE_PRICE_PLUS_MONTHLY) return { plan: "plus", interval: "monthly" };
  if (priceId === process.env.STRIPE_PRICE_PLUS_YEARLY) return { plan: "plus", interval: "yearly" };
  return null;
}

// ─── Checkout & Portal helpers ────────────────────────────────────────────────

export async function createCheckoutSession({
  userId,
  email,
  stripeCustomerId,
  plan,
  interval,
}: {
  userId: string;
  email: string;
  stripeCustomerId?: string | null;
  plan: "pro" | "plus";
  interval: "monthly" | "yearly";
}) {
  const priceId = STRIPE_PRICE_IDS[plan][interval];

  if (!priceId) {
    throw new Error(`Price ID not configured for ${plan} ${interval}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: stripeCustomerId ?? undefined,
    customer_email: stripeCustomerId ? undefined : email,
    metadata: { userId, plan },
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId, plan },
    },
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard?checkout=cancelled`,
  });

  return session;
}

export async function createCustomerPortalSession(stripeCustomerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/dashboard`,
  });

  return session;
}

