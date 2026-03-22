"use client";

import { useSession } from "next-auth/react";
import { hasAccess, daysLeftInTrial } from "@/lib/subscription";
import Link from "next/link";

interface PaywallGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PaywallGate({ children, fallback }: PaywallGateProps) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const user = {
    plan: session.user.plan,
    trialEndsAt: session.user.trialEndsAt,
    stripeCurrentPeriodEnd: session.user.stripeCurrentPeriodEnd,
  };

  if (hasAccess(user)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <svg
            className="h-6 w-6 text-[#2463EB]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Seu período de teste expirou
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Faça upgrade para o plano Pro e continue usando todos os recursos do
          Shiftly sem limitações.
        </p>
        <Link
          href="/settings/billing"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#2463EB] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1d4fc7] transition-colors"
        >
          Fazer upgrade
        </Link>
      </div>
    </div>
  );
}
