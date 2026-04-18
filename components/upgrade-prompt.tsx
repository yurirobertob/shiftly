"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, X, Crown } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { api } from "@/lib/api";
import { PLANS, type PlanKey } from "@/lib/stripe";
import { toast } from "sonner";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  trigger?: "cleaner_limit" | "client_limit" | "feature_locked" | "trial_ending";
  targetPlan?: "pro" | "plus";
  currentPlan?: PlanKey;
}

export function UpgradePrompt({
  open,
  onClose,
  trigger = "feature_locked",
  targetPlan: initialTarget,
  currentPlan = "basic",
}: UpgradePromptProps) {
  const { language } = useLanguage();
  const { format, symbol } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");

  if (!open) return null;

  const targetPlan = initialTarget ?? (currentPlan === "basic" ? "pro" : "plus");
  const planConfig = PLANS[targetPlan];

  const headlines: Record<string, { pt: string; en: string }> = {
    cleaner_limit: {
      pt: "Limite de colaboradoras atingido",
      en: "Cleaner limit reached",
    },
    client_limit: {
      pt: "Limite de clientes atingido",
      en: "Client limit reached",
    },
    feature_locked: {
      pt: `Disponível no plano ${planConfig.name}`,
      en: `Available on ${planConfig.name} plan`,
    },
    trial_ending: {
      pt: "Seu trial está acabando",
      en: "Your trial is ending",
    },
  };

  const descriptions: Record<string, { pt: string; en: string }> = {
    cleaner_limit: {
      pt: `Faça upgrade para o plano ${planConfig.name} e gerencie até ${planConfig.maxCleaners} colaboradoras.`,
      en: `Upgrade to ${planConfig.name} to manage up to ${planConfig.maxCleaners} cleaners.`,
    },
    client_limit: {
      pt: `Faça upgrade para o plano ${planConfig.name} e cadastre até ${planConfig.maxClients} clientes.`,
      en: `Upgrade to ${planConfig.name} to register up to ${planConfig.maxClients} clients.`,
    },
    feature_locked: {
      pt: `Desbloqueie este recurso com o plano ${planConfig.name}.`,
      en: `Unlock this feature with the ${planConfig.name} plan.`,
    },
    trial_ending: {
      pt: "Escolha um plano para continuar usando todos os recursos.",
      en: "Choose a plan to keep using all features.",
    },
  };

  const price = planConfig.price[interval];
  const features = planConfig.features[language];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const data = await api.post<{ url: string }>("/stripe/checkout", {
        plan: targetPlan,
        interval,
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || (language === "pt" ? "Erro ao iniciar checkout" : "Failed to start checkout"));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 mx-4">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="h-5 w-5 text-gray-400" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-[#F0FDF4] flex items-center justify-center">
            <Crown className="h-6 w-6 text-[#22C55E]" />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-xl font-bold text-center text-gray-900">
          {headlines[trigger]?.[language] ?? headlines.feature_locked[language]}
        </h2>
        <p className="mt-2 text-sm text-gray-500 text-center">
          {descriptions[trigger]?.[language] ?? descriptions.feature_locked[language]}
        </p>

        {/* Interval toggle */}
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              interval === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            {language === "pt" ? "Mensal" : "Monthly"}
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              interval === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            {language === "pt" ? "Anual" : "Yearly"}
            <span className="ml-1.5 text-xs text-[#22C55E] font-bold">
              {language === "pt" ? "-25%" : "-25%"}
            </span>
          </button>
        </div>

        {/* Price */}
        <div className="mt-4 text-center">
          <span className="text-3xl font-bold text-gray-900">{symbol}{price}</span>
          <span className="text-sm text-gray-500">/{language === "pt" ? "mês" : "mo"}</span>
          {interval === "yearly" && (
            <p className="text-xs text-gray-400 mt-1">
              {language === "pt" ? `Cobrado anualmente (${symbol}${price * 12}/ano)` : `Billed annually (${symbol}${price * 12}/year)`}
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="mt-5 space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <Check className="h-4 w-4 text-[#22C55E] shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          className="mt-6 w-full bg-[#22C55E] hover:bg-[#16A34A] text-white h-11"
          onClick={handleUpgrade}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {language === "pt" ? "Processando..." : "Processing..."}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {language === "pt" ? `Fazer upgrade para ${planConfig.name}` : `Upgrade to ${planConfig.name}`}
            </>
          )}
        </Button>

        <p className="mt-3 text-center text-xs text-gray-400">
          {language === "pt" ? "14 dias de trial grátis. Cancele quando quiser." : "14-day free trial. Cancel anytime."}
        </p>
      </div>
    </div>
  );
}
