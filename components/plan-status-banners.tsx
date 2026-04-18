"use client";

import { useState } from "react";
import { AlertTriangle, Clock, CreditCard, X } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { usePlan } from "@/hooks/use-plan";
import { UpgradePrompt } from "./upgrade-prompt";
import { api } from "@/lib/api";

export function PlanStatusBanners() {
  const { language } = useLanguage();
  const { isTrialing, trialDaysLeft, isPastDue, cancelAtPeriodEnd, plan, hasAccess } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Past due banner (highest priority)
  if (isPastDue) {
    return (
      <>
        <div className="mx-4 md:mx-6 lg:mx-8 mt-4 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-red-600 shrink-0" />
            <p className="text-red-800">
              <strong>{language === "pt" ? "Pagamento falhou" : "Payment failed"}.</strong>{" "}
              {language === "pt"
                ? "Atualize seu método de pagamento para continuar."
                : "Update your payment method to continue."}
            </p>
          </div>
          <button
            onClick={async () => {
              const data = await api.post<{ url: string }>("/stripe/portal", {});
              if (data.url) window.location.href = data.url;
            }}
            className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
          >
            {language === "pt" ? "Atualizar pagamento" : "Update payment"}
          </button>
        </div>
        <UpgradePrompt open={showUpgrade} onClose={() => setShowUpgrade(false)} currentPlan={plan} />
      </>
    );
  }

  // Trial ending soon (≤3 days)
  if (isTrialing && trialDaysLeft !== null && trialDaysLeft <= 3) {
    return (
      <>
        <div className="mx-4 md:mx-6 lg:mx-8 mt-4 flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-[#FEF3C7] px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-[#92400E]">
              <strong>
                {language === "pt"
                  ? `Seu trial acaba em ${trialDaysLeft} dia${trialDaysLeft !== 1 ? "s" : ""}`
                  : `Your trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""}`}
              </strong>
              .{" "}
              {language === "pt" ? "Escolha um plano para continuar." : "Choose a plan to continue."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpgrade(true)}
              className="shrink-0 rounded-md bg-[#22C55E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#16A34A] transition-colors"
            >
              {language === "pt" ? "Escolher plano" : "Choose plan"}
            </button>
            <button onClick={() => setDismissed(true)} className="p-1 hover:bg-amber-200 rounded transition-colors">
              <X className="h-3.5 w-3.5 text-amber-600" />
            </button>
          </div>
        </div>
        <UpgradePrompt open={showUpgrade} onClose={() => setShowUpgrade(false)} trigger="trial_ending" currentPlan={plan} />
      </>
    );
  }

  // Cancellation pending
  if (cancelAtPeriodEnd) {
    return (
      <div className="mx-4 md:mx-6 lg:mx-8 mt-4 flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-amber-800">
            {language === "pt"
              ? "Sua assinatura será cancelada no final do período atual."
              : "Your subscription will be cancelled at the end of the current period."}
          </p>
        </div>
        <button
          onClick={async () => {
            const data = await api.post<{ url: string }>("/stripe/portal", {});
            if (data.url) window.location.href = data.url;
          }}
          className="shrink-0 rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
        >
          {language === "pt" ? "Reativar" : "Reactivate"}
        </button>
      </div>
    );
  }

  return null;
}
