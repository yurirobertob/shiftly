import { NextResponse } from "next/server";
import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { cleanerSchema } from "@/lib/validations";
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
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const cleaners = await db.cleaner.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      rates: {
        orderBy: { effectiveFrom: "desc" },
        take: 5,
      },
    },
  });

  return successResponse(cleaners);
}

export async function POST(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = cleanerSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  // Check plan limit
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });
  const plan = (sub?.plan ?? "BASIC") as SubscriptionPlan;
  const { allowed, current, limit } = await checkUsageLimit(userId, plan, "cleaners");

  if (!allowed) {
    return errorResponse(
      `Plan limit reached: ${current}/${limit} cleaners. Upgrade to add more.`,
      403
    );
  }

  const cleaner = await db.cleaner.create({
    data: {
      ...parsed.data,
      userId,
    },
  });

  // Create initial rate history entry
  if (parsed.data.hourlyRate) {
    await db.cleanerRate.create({
      data: {
        cleanerId: cleaner.id,
        hourlyRate: parsed.data.hourlyRate,
        effectiveFrom: new Date(),
      },
    });
  }

  return successResponse(cleaner, 201);
}
