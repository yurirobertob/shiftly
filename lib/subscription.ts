import type { Plan } from "@/app/generated/prisma/client";

interface UserSubscription {
  plan: Plan;
  trialEndsAt: Date | string | null;
  stripeCurrentPeriodEnd: Date | string | null;
}

export function isTrialActive(user: UserSubscription): boolean {
  return (
    user.plan === "TRIAL" &&
    user.trialEndsAt !== null &&
    new Date(user.trialEndsAt) > new Date()
  );
}

export function isSubscribed(user: UserSubscription): boolean {
  return (
    user.plan === "PRO" &&
    user.stripeCurrentPeriodEnd !== null &&
    new Date(user.stripeCurrentPeriodEnd) > new Date()
  );
}

export function hasAccess(user: UserSubscription): boolean {
  return isTrialActive(user) || isSubscribed(user);
}

export function daysLeftInTrial(user: UserSubscription): number {
  if (!user.trialEndsAt) return 0;
  const diff = new Date(user.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
