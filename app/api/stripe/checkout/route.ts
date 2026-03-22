import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user?.email) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  const checkoutSession = await createCheckoutSession({
    userId: session.user.id,
    email: user.email,
    stripeCustomerId: user.stripeCustomerId,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
