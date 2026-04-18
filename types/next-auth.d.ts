import { DefaultSession, DefaultJWT } from "next-auth";
import { SubscriptionPlan } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: SubscriptionPlan;
      trialEndsAt: Date | null;
      currentPeriodEnd: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    plan: SubscriptionPlan;
    trialEndsAt: Date | null;
    currentPeriodEnd: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan: SubscriptionPlan;
    trialEndsAt: Date | null;
    currentPeriodEnd: Date | null;
  }
}
