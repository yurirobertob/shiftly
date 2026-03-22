import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { Plan } from "@/app/generated/prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as any,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "Shiftly <noreply@shiftly.app>",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // On first login, set trial plan
      if (account && user.id) {
        const existingUser = await db.user.findUnique({
          where: { id: user.id },
          select: { plan: true },
        });

        if (existingUser && existingUser.plan === "FREE") {
          await db.user.update({
            where: { id: user.id },
            data: {
              plan: "TRIAL",
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.plan = (user as any).plan as Plan;
        token.trialEndsAt = (user as any).trialEndsAt as Date | null;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.plan = token.plan;
        session.user.trialEndsAt = token.trialEndsAt;
      }
      return session;
    },
  },
});
