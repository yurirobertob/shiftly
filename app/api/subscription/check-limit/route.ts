import { getAuthUserId, errorResponse, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { checkUsageLimit } from "@/lib/plan-limits";
import type { SubscriptionPlan } from "@prisma/client";

export async function GET(req: Request) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource") as "cleaners" | "clients" | null;

  if (!resource || !["cleaners", "clients"].includes(resource)) {
    return errorResponse("resource query parameter must be 'cleaners' or 'clients'");
  }

  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });

  const plan = (sub?.plan ?? "BASIC") as SubscriptionPlan;
  const result = await checkUsageLimit(userId, plan, resource);

  return successResponse(result);
}
