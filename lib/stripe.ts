import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_placeholder_not_configured", {
  typescript: true,
});

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLANS = {
  basic: {
    name: "Basic",
    maxCleaners: 5,
    maxClients: 10,
    price: { monthly: 0, yearly: 0 },
    features: {
      pt: [
        "Até 5 colaboradoras",
        "Até 10 clientes",
        "Agenda semanal",
        "Cálculo básico de pagamento",
      ],
      en: [
        "Up to 5 cleaners",
        "Up to 10 clients",
        "Weekly schedule",
        "Basic pay calculation",
      ],
    },
  },
  pro: {
    name: "Pro",
    maxCleaners: 15,
    maxClients: 50,
    price: { monthly: 39, yearly: 29 },
    stripePriceId: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY || "",
    },
    features: {
      pt: [
        "Até 15 colaboradoras",
        "Até 50 clientes",
        "Alertas de ausência + cobertura em 1 clique",
        "Relatórios semanais PDF/CSV",
        "Gamificação e conquistas",
        "Suporte por email",
      ],
      en: [
        "Up to 15 cleaners",
        "Up to 50 clients",
        "Absence alerts + 1-click cover",
        "Weekly PDF/CSV reports",
        "Gamification & achievements",
        "Email support",
      ],
    },
  },
  plus: {
    name: "Plus",
    maxCleaners: 30,
    maxClients: 100,
    price: { monthly: 59, yearly: 44 },
    stripePriceId: {
      monthly: process.env.STRIPE_PRICE_PLUS_MONTHLY || "",
      yearly: process.env.STRIPE_PRICE_PLUS_YEARLY || "",
    },
    features: {
      pt: [
        "Até 30 colaboradoras",
        "Até 100 clientes",
        "Relatórios avançados com filtros",
        "Exportar Excel",
        "Suporte prioritário",
        "Branding personalizado",
      ],
      en: [
        "Up to 30 cleaners",
        "Up to 100 clients",
        "Advanced reports with filters",
        "Excel export",
        "Priority support",
        "Custom branding",
      ],
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

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
  const planConfig = PLANS[plan];
  const priceId = planConfig.stripePriceId[interval];

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
