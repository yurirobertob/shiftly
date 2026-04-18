import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { db } from "@/lib/db";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { trialEndingTemplate, paymentFailedTemplate } from "@/lib/email-templates";
import type Stripe from "stripe";

export async function POST(req: Request) {
  console.log("=== STRIPE WEBHOOK RECEIVED ===");

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[WEBHOOK] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[WEBHOOK] Event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = typeof session.customer === "string"
          ? session.customer
          : (session.customer as any)?.id;
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription as any)?.id;

        console.log(`[WEBHOOK] checkout.session.completed — userId=${userId}, customerId=${customerId}, subscriptionId=${subscriptionId}`);

        if (!userId) {
          console.error("[WEBHOOK] No userId in checkout session metadata!");
          break;
        }
        if (!subscriptionId) {
          console.error("[WEBHOOK] No subscription ID in checkout session!");
          break;
        }

        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        // Detect plan from price ID (v20: period on item, not subscription)
        const subItem = sub.items.data[0];
        const priceId = subItem?.price.id;
        const planInfo = getPlanFromPriceId(priceId);
        const plan = planInfo?.plan ?? (session.metadata?.plan as string) ?? "pro";
        const maxCleaners = plan === "plus" ? 30 : plan === "pro" ? 15 : 5;
        const planUpper = plan.toUpperCase() as "PRO" | "PLUS" | "BASIC";

        // Map Stripe status
        let status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELLED" = "ACTIVE";
        if (sub.status === "trialing") status = "TRIALING";

        const periodStart = subItem ? new Date(subItem.current_period_start * 1000) : new Date();
        const periodEnd = subItem ? new Date(subItem.current_period_end * 1000) : new Date();

        console.log(`[WEBHOOK] Upserting subscription: userId=${userId}, plan=${planUpper}, status=${status}, customerId=${customerId}`);

        await db.subscription.upsert({
          where: { userId },
          update: {
            plan: planUpper,
            status,
            maxCleaners,
            stripeCustomerId: customerId,
            stripeSubscriptionId: sub.id,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
          create: {
            userId,
            plan: planUpper,
            status,
            maxCleaners,
            stripeCustomerId: customerId,
            stripeSubscriptionId: sub.id,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        });

        console.log(`[WEBHOOK] checkout.session.completed — SUCCESS`);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string"
          ? sub.customer
          : (sub.customer as any)?.id;

        console.log(`[WEBHOOK] ${event.type} — customerId=${customerId}, status=${sub.status}`);

        // Try to find by stripeCustomerId first
        let dbSub = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        // Fallback: find by userId from subscription metadata
        if (!dbSub && sub.metadata?.userId) {
          console.log(`[WEBHOOK] Fallback: looking up by metadata userId=${sub.metadata.userId}`);
          dbSub = await db.subscription.findFirst({
            where: { userId: sub.metadata.userId },
          });
          // If found, link the stripeCustomerId
          if (dbSub) {
            await db.subscription.update({
              where: { id: dbSub.id },
              data: { stripeCustomerId: customerId },
            });
            console.log(`[WEBHOOK] Linked stripeCustomerId=${customerId} to userId=${sub.metadata.userId}`);
          }
        }

        if (!dbSub) {
          console.error(`[WEBHOOK] No subscription found for customerId=${customerId} or metadata userId=${sub.metadata?.userId}`);
          break;
        }

        // Detect plan from price ID (v20: period on item)
        const subItem = sub.items.data[0];
        const priceId = subItem?.price.id;
        const planInfo = getPlanFromPriceId(priceId);

        const updateData: any = {
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        };

        // Periods from item level (Stripe v20+)
        if (subItem) {
          updateData.currentPeriodStart = new Date(subItem.current_period_start * 1000);
          updateData.currentPeriodEnd = new Date(subItem.current_period_end * 1000);
        }

        // Map status
        switch (sub.status) {
          case "trialing": updateData.status = "TRIALING"; break;
          case "active": updateData.status = "ACTIVE"; break;
          case "past_due": updateData.status = "PAST_DUE"; break;
          case "canceled":
          case "unpaid": updateData.status = "CANCELLED"; break;
        }

        // Update plan if detectable
        if (planInfo) {
          const planUpper = planInfo.plan.toUpperCase() as "PRO" | "PLUS";
          updateData.plan = planUpper;
          updateData.maxCleaners = planInfo.plan === "plus" ? 30 : 15;
        }

        console.log(`[WEBHOOK] Updating subscription id=${dbSub.id}:`, JSON.stringify(updateData));

        await db.subscription.update({
          where: { id: dbSub.id },
          data: updateData,
        });

        console.log(`[WEBHOOK] ${event.type} — SUCCESS`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string"
          ? sub.customer
          : (sub.customer as any)?.id;

        console.log(`[WEBHOOK] customer.subscription.deleted — customerId=${customerId}`);

        const dbSub = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (!dbSub) {
          console.error(`[WEBHOOK] No subscription found for deleted customerId=${customerId}`);
          break;
        }

        await db.subscription.update({
          where: { id: dbSub.id },
          data: {
            plan: "BASIC",
            status: "CANCELLED",
            maxCleaners: 5,
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          },
        });

        console.log(`[WEBHOOK] Downgraded to BASIC — SUCCESS`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | null;

        console.log(`[WEBHOOK] invoice.payment_succeeded — subscriptionId=${subscriptionId}`);

        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const subItem = sub.items.data[0];

        await db.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: "ACTIVE",
            ...(subItem ? {
              currentPeriodStart: new Date(subItem.current_period_start * 1000),
              currentPeriodEnd: new Date(subItem.current_period_end * 1000),
            } : {}),
          },
        });

        console.log(`[WEBHOOK] invoice.payment_succeeded — SUCCESS`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : (invoice.customer as any)?.id;

        console.log(`[WEBHOOK] invoice.payment_failed — customerId=${customerId}`);

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "PAST_DUE" },
        });

        // Send payment failed email
        try {
          const dbSub = await db.subscription.findFirst({
            where: { stripeCustomerId: customerId },
            include: { user: true },
          });
          if (dbSub?.user?.email) {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: dbSub.user.email,
              subject: "⚠️ Payment failed — update your card",
              html: paymentFailedTemplate(dbSub.user.name),
            });
          }
        } catch (emailErr) {
          console.error("[WEBHOOK] Payment failed email error:", emailErr);
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string"
          ? sub.customer
          : (sub.customer as any)?.id;

        console.log(`[WEBHOOK] trial_will_end — customerId=${customerId}`);

        try {
          const dbSub = await db.subscription.findFirst({
            where: { stripeCustomerId: customerId },
            include: { user: true },
          });
          if (dbSub?.user?.email) {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: dbSub.user.email,
              subject: "Your Shiftsly trial ends in 3 days",
              html: trialEndingTemplate(dbSub.user.name, dbSub.plan),
            });
            console.log(`[WEBHOOK] Trial ending email sent to ${dbSub.user.email}`);
          }
        } catch (emailErr) {
          console.error("[WEBHOOK] Trial ending email error:", emailErr);
        }
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("[WEBHOOK ERROR]", event.type, err);
  }

  return NextResponse.json({ received: true });
}
