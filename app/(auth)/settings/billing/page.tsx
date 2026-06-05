"use client";

import { usePlan } from "@/hooks/use-plan";
import { useLanguage } from "@/hooks/use-language";
import { PLAN_CONFIG } from "@/lib/plan-config";
import { BillingActions } from "./billing-actions";
import { Loader2 } from "lucide-react";

export default function BillingPage() {
  const { language } = useLanguage();
  const pt = language === "pt";

  const {
    plan,
    planLabel,
    status,
    isSubscribed,
    isTrialing,
    isPastDue,
    trialDaysLeft,
    cancelAtPeriodEnd,
    hasStripeCustomer,
    maxCleaners,
    maxClients,
    currentCleaners,
    currentClients,
    isLoading,
  } = usePlan();

  const planKey = plan as keyof typeof PLAN_CONFIG;
  const planFeatures = PLAN_CONFIG[planKey]?.features[pt ? "pt" : "en"] ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const statusBadge = () => {
    if (isPastDue) return { label: pt ? "Pagamento pendente" : "Payment due", cls: "bg-red-50 text-red-700" };
    if (isSubscribed) return { label: pt ? "Ativo" : "Active", cls: "bg-green-50 text-green-700" };
    if (isTrialing) return { label: "Trial", cls: "bg-blue-50 text-blue-700" };
    return { label: pt ? "Inativo" : "Inactive", cls: "bg-gray-100 text-gray-600" };
  };

  const badge = statusBadge();

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        {pt ? "Faturamento" : "Billing"}
      </h1>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {pt ? "Plano" : "Plan"} {planLabel}
            </h2>
            {isTrialing && trialDaysLeft !== null && (
              <p className="text-sm text-muted-foreground mt-1">
                {trialDaysLeft} {pt
                  ? (trialDaysLeft === 1 ? "dia restante" : "dias restantes") + " no período de teste"
                  : (trialDaysLeft === 1 ? "day left" : "days left") + " in your trial"}
              </p>
            )}
            {isPastDue && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                {pt
                  ? "Pagamento pendente — atualize seu método de pagamento"
                  : "Payment overdue — please update your payment method"}
              </p>
            )}
            {cancelAtPeriodEnd && (
              <p className="text-sm text-amber-600 mt-1">
                {pt
                  ? "Cancelamento programado para o final do período"
                  : "Cancellation scheduled at end of billing period"}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Usage */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{pt ? "Colaboradoras" : "Cleaners"}</p>
            <p className="text-lg font-bold text-gray-900">
              {currentCleaners}/{maxCleaners}
            </p>
            <div className="mt-1 h-1.5 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#22C55E]"
                style={{ width: `${Math.min((currentCleaners / maxCleaners) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{pt ? "Clientes" : "Clients"}</p>
            <p className="text-lg font-bold text-gray-900">
              {currentClients}/{maxClients}
            </p>
            <div className="mt-1 h-1.5 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#22C55E]"
                style={{ width: `${Math.min((currentClients / maxClients) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current plan features */}
        {planFeatures.length > 0 && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {pt ? "Seu plano inclui" : "Your plan includes"}
            </p>
            <ul className="space-y-1 text-sm text-gray-600">
              {planFeatures.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upgrade options */}
        {!isSubscribed && planKey !== "plus" && (
          <div className="mt-6 space-y-3">
            {planKey !== "pro" && (
              <div className="rounded-lg border border-[#22C55E]/30 bg-[#F0FDF4] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#15803D]">
                    {pt ? "Plano Pro — £39/mês" : "Pro Plan — £39/mo"}
                  </h3>
                  <span className="text-xs text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                    {pt ? "Recomendado" : "Recommended"}
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-[#15803D]/80">
                  {PLAN_CONFIG.pro.features[pt ? "pt" : "en"].map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-700">
                {pt ? "Plano Plus — £59/mês" : "Plus Plan — £59/mo"}
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-500">
                {PLAN_CONFIG.plus.features[pt ? "pt" : "en"].map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <BillingActions
          subscribed={isSubscribed}
          hasStripeCustomer={hasStripeCustomer}
          currentPlan={planKey}
          pt={pt}
        />
      </div>
    </div>
  );
}
