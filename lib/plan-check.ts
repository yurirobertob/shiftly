import { db } from "@/lib/db";
import type { PlanKey } from "@/lib/stripe";

export async function getUserPlan(userId: string) {
  const [subscription, cleanerCount, clientCount] = await Promise.all([
    db.subscription.findUnique({ where: { userId } }),
    db.cleaner.count({ where: { userId, status: { not: "INACTIVE" } } }),
    db.client.count({ where: { userId, status: "ACTIVE" } }),
  ]);

  const plan = ((subscription?.plan ?? "BASIC").toLowerCase()) as PlanKey;
  const maxCleaners = subscription?.maxCleaners ?? 5;

  return {
    plan,
    status: subscription?.status ?? "ACTIVE",
    maxCleaners,
    currentCleaners: cleanerCount,
    currentClients: clientCount,
    canAddCleaner: cleanerCount < maxCleaners,
    canAddClient: clientCount < (plan === "plus" ? 100 : plan === "pro" ? 50 : 10),
    isTrialing: subscription?.status === "TRIALING",
    isPastDue: subscription?.status === "PAST_DUE",
    trialEndsAt: subscription?.trialEndsAt ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    hasStripeCustomer: !!subscription?.stripeCustomerId,
  };
}

// Feature gating: which features are available per plan
export const FEATURE_ACCESS = {
  basic: {
    weeklySchedule: true,
    basicPayCalc: true,
    absenceAlerts: false,
    reportExport: false,
    excelExport: false,
    gamification: false,
    prioritySupport: false,
  },
  pro: {
    weeklySchedule: true,
    basicPayCalc: true,
    absenceAlerts: true,
    reportExport: true,
    excelExport: false,
    gamification: true,
    prioritySupport: false,
  },
  plus: {
    weeklySchedule: true,
    basicPayCalc: true,
    absenceAlerts: true,
    reportExport: true,
    excelExport: true,
    gamification: true,
    prioritySupport: true,
  },
} as const;

export type FeatureKey = keyof (typeof FEATURE_ACCESS)["basic"];

export function canAccessFeature(plan: PlanKey, feature: FeatureKey): boolean {
  return FEATURE_ACCESS[plan]?.[feature] ?? false;
}
