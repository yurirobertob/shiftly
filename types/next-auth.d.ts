import { DefaultSession, DefaultJWT } from "next-auth";
import { Plan } from "../app/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: Plan;
      trialEndsAt: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    plan: Plan;
    trialEndsAt: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan: Plan;
    trialEndsAt: Date | null;
  }
}
