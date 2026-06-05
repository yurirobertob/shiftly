import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientSchema } from "@/lib/validations";
import { checkUsageLimit } from "@/lib/plan-limits";
import type { SubscriptionPlan } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await db.client.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(clients);
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
    const parsed = clientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const sub = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    });
    const plan = (sub?.plan ?? "BASIC") as SubscriptionPlan;
    const { allowed, current, limit } = await checkUsageLimit(session.user.id, plan, "clients");

    if (!allowed) {
      return NextResponse.json(
        { error: `Plan limit reached: ${current}/${limit} clients. Upgrade to add more.` },
        { status: 403 }
      );
    }

    const client = await db.client.create({
      data: { userId: session.user.id, ...parsed.data },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
