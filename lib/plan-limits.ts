import type { SubscriptionPlan } from "@prisma/client";
import { db } from "@/lib/db";

export const PLAN_LIMITS: Record<SubscriptionPlan, { cleaners: number; clients: number }> = {
  BASIC: {
    cleaners: 5,
    clients: 10,
  },
  PRO: {
    cleaners: 15,
    clients: 50,
  },
  PLUS: {
    cleaners: 30,
    clients: 100,
  },
} as const;

type Resource = "cleaners" | "clients";

export async function checkUsageLimit(
  userId: string,
  plan: SubscriptionPlan,
  resource: Resource
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.BASIC;
  const limit = limits[resource];

  let current = 0;
  switch (resource) {
    case "cleaners":
      current = await db.cleaner.count({ where: { userId, status: { not: "INACTIVE" } } });
      break;
    case "clients":
      current = await db.client.count({ where: { userId, status: "ACTIVE" } });
      break;
  }

  return { allowed: current < limit, current, limit };
}
