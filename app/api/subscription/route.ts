import { getAuthUserId, errorResponse, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { isSubscribed, isTrialActive, daysLeftInTrial, hasAccess } from "@/lib/subscription";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import type { SubscriptionPlan } from "@prisma/client";

export async function GET(req: Request) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const subscription = await db.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return successResponse({
      plan: "BASIC",
      status: "ACTIVE",
      subscribed: false,
      trialActive: false,
      hasAccess: false,
      daysLeft: 0,
      limits: PLAN_LIMITS.BASIC,
    });
  }

  const sub = {
    plan: subscription.plan as SubscriptionPlan,
    trialEndsAt: subscription.trialEndsAt,
    currentPeriodEnd: subscription.currentPeriodEnd,
  };

  const cleanerCount = await db.cleaner.count({
    where: { userId, status: { not: "INACTIVE" } },
  });
  const clientCount = await db.client.count({
    where: { userId, status: "ACTIVE" },
  });

  const limits = PLAN_LIMITS[subscription.plan] ?? PLAN_LIMITS.BASIC;

  return successResponse({
    plan: subscription.plan,
    status: subscription.status,
    subscribed: isSubscribed(sub),
    trialActive: isTrialActive(sub),
    hasAccess: hasAccess(sub),
    daysLeft: daysLeftInTrial(sub),
    trialEndsAt: subscription.trialEndsAt,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    limits,
    usage: {
      cleaners: { current: cleanerCount, limit: limits.cleaners },
      clients: { current: clientCount, limit: limits.clients },
    },
  });
}
