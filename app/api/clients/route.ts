import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { clientSchema } from "@/lib/validations";
import { checkUsageLimit } from "@/lib/plan-limits";
import type { SubscriptionPlan } from "@prisma/client";

export async function GET(req: Request) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: any = { userId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { contactName: { contains: search, mode: "insensitive" } },
    ];
  }

  const clients = await db.client.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { jobs: true } } },
  });

  return successResponse(clients);
}

export async function POST(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  // Check plan limit
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });
  const plan = (sub?.plan ?? "BASIC") as SubscriptionPlan;
  const { allowed, current, limit } = await checkUsageLimit(userId, plan, "clients");

  if (!allowed) {
    return errorResponse(
      `Plan limit reached: ${current}/${limit} clients. Upgrade to add more.`,
      403
    );
  }

  const client = await db.client.create({
    data: {
      ...parsed.data,
      userId,
    },
  });

  return successResponse(client, 201);
}
