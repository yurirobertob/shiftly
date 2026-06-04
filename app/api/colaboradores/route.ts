import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cleanerSchema } from "@/lib/validations";
import { checkUsageLimit } from "@/lib/plan-limits";
import { onCleanerCreated } from "@/lib/achievement-triggers";
import type { SubscriptionPlan } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cleaners = await db.cleaner.findMany({
      where: { userId: session.user.id, status: { not: "INACTIVE" } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(cleaners);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = cleanerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const sub = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    });
    const plan = (sub?.plan ?? "BASIC") as SubscriptionPlan;
    const { allowed, current, limit } = await checkUsageLimit(session.user.id, plan, "cleaners");

    if (!allowed) {
      return NextResponse.json(
        { error: `Plan limit reached: ${current}/${limit} cleaners. Upgrade to add more.` },
        { status: 403 }
      );
    }

    const cleaner = await db.cleaner.create({
      data: { userId: session.user.id, ...parsed.data },
    });

    void onCleanerCreated(session.user.id);

    return NextResponse.json(cleaner, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
