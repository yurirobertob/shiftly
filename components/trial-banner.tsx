"use client";

import { useSession } from "next-auth/react";
import { isTrialActive, daysLeftInTrial } from "@/lib/subscription";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";

export function TrialBanner() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const pt = language === "pt";

  if (!session?.user) return null;

  const user = {
    plan: session.user.plan,
    trialEndsAt: session.user.trialEndsAt,
    currentPeriodEnd: session.user.currentPeriodEnd,
  };

  if (!isTrialActive(user)) return null;

  const days = daysLeftInTrial(user);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm">
      <p className="text-blue-800">
        <strong>
          {days} {pt ? (days === 1 ? "dia restante" : "dias restantes") : (days === 1 ? "day left" : "days left")}
        </strong>{" "}
        {pt ? "no seu período de teste." : "remaining in your trial."}
      </p>
      <Link
        href="/settings/billing"
        className="shrink-0 rounded-md bg-[#2463EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1d4fc7] transition-colors"
      >
        {pt ? "Fazer upgrade" : "Upgrade"}
      </Link>
    </div>
  );
}
