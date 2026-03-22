import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCustomerPortalSession } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer found" },
      { status: 400 }
    );
  }

  const portalSession = await createCustomerPortalSession(
    user.stripeCustomerId
  );

  return NextResponse.json({ url: portalSession.url });
}
