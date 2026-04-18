import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { SubscriptionPlan } from "@prisma/client";
import { resend as resendClient, FROM_EMAIL } from "@/lib/resend";
import { welcomeEmailTemplate } from "@/lib/email-templates";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as any,
  // Trust the incoming Host header — required when running behind a
  // custom domain on Vercel so OAuth callbacks resolve to the live host
  // (shiftsly.com) instead of being rejected as mismatched.
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "Shiftsly <noreply@shiftsly.com>",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account }) {
      try {
        // On first login, create a subscription with trial
        if (account && user.id) {
          const existingSub = await db.subscription.findUnique({
            where: { userId: user.id },
          });

          if (!existingSub) {
            await db.subscription.create({
              data: {
                userId: user.id,
                plan: "PRO",
                status: "TRIALING",
                maxCleaners: 15,
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              },
            });

            // Send welcome email
            if (user.email) {
              try {
                await resendClient.emails.send({
                  from: FROM_EMAIL,
                  to: user.email,
                  subject: "Welcome to Shiftsly! 🎉",
                  html: welcomeEmailTemplate(user.name ?? null),
                });
              } catch (emailErr) {
                console.error("[AUTH] Welcome email failed:", emailErr);
              }
            }
          }
        }
      } catch (error) {
        console.error("[AUTH] signIn callback error:", error);
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
      }
      // Refresh subscription data from DB
      if (token.id) {
        try {
          const sub = await db.subscription.findUnique({
            where: { userId: token.id as string },
            select: { plan: true, trialEndsAt: true, currentPeriodEnd: true },
          });
          if (sub) {
            token.plan = sub.plan;
            token.trialEndsAt = sub.trialEndsAt;
            token.currentPeriodEnd = sub.currentPeriodEnd;
          } else {
            token.plan = "BASIC" as SubscriptionPlan;
            token.trialEndsAt = null;
            token.currentPeriodEnd = null;
          }
        } catch (error) {
          console.error("[AUTH] jwt callback error:", error);
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.plan = token.plan;
        session.user.trialEndsAt = token.trialEndsAt;
        session.user.currentPeriodEnd = token.currentPeriodEnd;
      }
      return session;
    },
  },
});
