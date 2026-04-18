"use client";

import { useState } from "react";
import { Loader2, Sparkles, CreditCard } from "lucide-react";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import type { PlanKey } from "@/lib/stripe";

interface BillingActionsProps {
  subscribed: boolean;
  hasStripeCustomer: boolean;
  currentPlan?: PlanKey;
}

export function BillingActions({ subscribed, hasStripeCustomer, currentPlan = "basic" }: BillingActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-6 flex gap-3">
        {!subscribed && (
          <button
            onClick={() => setShowUpgrade(true)}
            className="rounded-lg bg-[#22C55E] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#16A34A] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Fazer upgrade
          </button>
        )}

        {hasStripeCustomer && (
          <button
            onClick={handlePortal}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {loading ? "Processando..." : "Gerenciar assinatura"}
          </button>
        )}
      </div>

      <UpgradePrompt
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentPlan={currentPlan}
        targetPlan={currentPlan === "pro" ? "plus" : "pro"}
      />
    </>
  );
}
