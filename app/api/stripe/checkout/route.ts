import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse plan + interval from body (defaults for backward compat)
  let plan: "pro" | "plus" = "pro";
  let interval: "monthly" | "yearly" = "monthly";

  try {
    const body = await req.json();
    if (body.plan === "pro" || body.plan === "plus") plan = body.plan;
    if (body.interval === "monthly" || body.interval === "yearly") interval = body.interval;
  } catch {
    // Body is optional — default to pro/monthly
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (!user?.email) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { stripeCustomerId: true },
  });

  try {
    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      email: user.email,
      stripeCustomerId: subscription?.stripeCustomerId,
      plan,
      interval,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("[STRIPE CHECKOUT]", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
