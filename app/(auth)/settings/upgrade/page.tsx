"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Sparkles,
  Clock,
  Users,
  Shield,
  Zap,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Star,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { usePlan } from "@/hooks/use-plan";
import { api } from "@/lib/api";
import { toast } from "sonner";

const plans = [
  {
    key: "basic" as const,
    name: "Basic",
    price: { monthly: 0, yearly: 0 },
    description: { pt: "Para quem está começando", en: "For getting started" },
    popular: false,
    features: [
      { name: { pt: "Até 5 colaboradoras", en: "Up to 5 cleaners" }, included: true },
      { name: { pt: "Até 10 clientes", en: "Up to 10 clients" }, included: true },
      { name: { pt: "Agenda semanal", en: "Weekly schedule" }, included: true },
      { name: { pt: "Cálculo básico", en: "Basic pay calc" }, included: true },
      { name: { pt: "Alertas de ausência", en: "Absence alerts" }, included: false },
      { name: { pt: "Relatórios PDF/CSV", en: "PDF/CSV reports" }, included: false },
      { name: { pt: "Exportar Excel", en: "Excel export" }, included: false },
      { name: { pt: "Suporte prioritário", en: "Priority support" }, included: false },
    ],
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: { monthly: 39, yearly: 29 },
    description: { pt: "Para equipes em crescimento", en: "For growing teams" },
    popular: true,
    features: [
      { name: { pt: "Até 15 colaboradoras", en: "Up to 15 cleaners" }, included: true },
      { name: { pt: "Até 50 clientes", en: "Up to 50 clients" }, included: true },
      { name: { pt: "Agenda semanal avançada", en: "Advanced weekly schedule" }, included: true },
      { name: { pt: "Alertas de ausência + 1 clique", en: "Absence alerts + 1-click" }, included: true },
      { name: { pt: "Relatórios PDF/CSV", en: "PDF/CSV reports" }, included: true },
      { name: { pt: "Gamificação e conquistas", en: "Gamification & achievements" }, included: true },
      { name: { pt: "Exportar Excel", en: "Excel export" }, included: false },
      { name: { pt: "Suporte prioritário", en: "Priority support" }, included: false },
    ],
  },
  {
    key: "plus" as const,
    name: "Plus",
    price: { monthly: 59, yearly: 44 },
    description: { pt: "Para operações profissionais", en: "For professional operations" },
    popular: false,
    features: [
      { name: { pt: "Até 30 colaboradoras", en: "Up to 30 cleaners" }, included: true },
      { name: { pt: "Até 100 clientes", en: "Up to 100 clients" }, included: true },
      { name: { pt: "Tudo do Pro", en: "Everything in Pro" }, included: true },
      { name: { pt: "Relatórios avançados com filtros", en: "Advanced reports with filters" }, included: true },
      { name: { pt: "Exportar Excel", en: "Excel export" }, included: true },
      { name: { pt: "Branding personalizado", en: "Custom branding" }, included: true },
      { name: { pt: "Suporte prioritário", en: "Priority support" }, included: true },
      { name: { pt: "Múltiplas zonas", en: "Multiple zones" }, included: true },
    ],
  },
];

const benefits = [
  { icon: Users, title: { pt: "Mais colaboradoras", en: "More cleaners" }, description: { pt: "Gerencie equipes maiores", en: "Manage larger teams" } },
  { icon: BarChart3, title: { pt: "Relatórios avançados", en: "Advanced reports" }, description: { pt: "Insights detalhados", en: "Detailed insights" } },
  { icon: Shield, title: { pt: "Alertas inteligentes", en: "Smart alerts" }, description: { pt: "Cobertura em 1 clique", en: "1-click coverage" } },
  { icon: Zap, title: { pt: "Exportar PDF", en: "Export PDF" }, description: { pt: "Relatórios profissionais", en: "Professional reports" } },
];

const faqs = [
  {
    q: { pt: "Posso cancelar a qualquer momento?", en: "Can I cancel anytime?" },
    a: { pt: "Sim, sem fidelidade ou multa.", en: "Yes, no lock-in or penalties." },
  },
  {
    q: { pt: "Como funciona o trial?", en: "How does the trial work?" },
    a: { pt: "14 dias grátis com acesso completo. Sem cobrança durante o trial.", en: "14 days free with full access. No charge during trial." },
  },
  {
    q: { pt: "Posso mudar de plano?", en: "Can I change plans?" },
    a: { pt: "Sim, o valor é ajustado proporcionalmente.", en: "Yes, prorated automatically." },
  },
  {
    q: { pt: "Os dados migram entre planos?", en: "Does data migrate between plans?" },
    a: { pt: "Sim, todos os dados são mantidos.", en: "Yes, all data is preserved." },
  },
];

export default function UpgradePage() {
  const { language } = useLanguage();
  const { symbol } = useCurrency();
  const { plan: currentPlan } = usePlan();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planKey: "pro" | "plus") => {
    setLoadingPlan(planKey);
    try {
      const data = await api.post<{ url: string }>("/stripe/checkout", {
        plan: planKey,
        interval,
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-1 text-sm font-medium text-[#22C55E]">
          <Sparkles className="h-3.5 w-3.5" />
          {language === "pt" ? "Upgrade disponível" : "Upgrade available"}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {language === "pt" ? "Escolha o plano ideal" : "Choose the right plan"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {language === "pt" ? "14 dias de trial grátis em qualquer plano pago" : "14-day free trial on any paid plan"}
        </p>
      </div>

      {/* Interval toggle */}
      <div className="mb-8 flex justify-center">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              interval === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            {language === "pt" ? "Mensal" : "Monthly"}
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              interval === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            {language === "pt" ? "Anual" : "Yearly"}
            <span className="ml-1.5 text-xs text-[#22C55E] font-bold">-25%</span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const price = plan.price[interval];
          return (
            <Card
              key={plan.key}
              className={`relative overflow-visible ${
                plan.popular ? "ring-2 ring-[#22C55E] shadow-lg scale-[1.02]" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#22C55E] text-white border-0 shadow-md px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    {language === "pt" ? "Mais popular" : "Most popular"}
                  </Badge>
                </div>
              )}
              <CardContent className="py-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {plan.description[language]}
                  </p>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold">
                    {price === 0 ? (language === "pt" ? "Grátis" : "Free") : `${symbol}${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-muted-foreground">
                      /{language === "pt" ? "mês" : "mo"}
                    </span>
                  )}
                </div>

                {isCurrent ? (
                  <Button variant="outline" className="mb-5 w-full" disabled>
                    {language === "pt" ? "Plano atual" : "Current plan"}
                  </Button>
                ) : plan.key === "basic" ? (
                  <Button variant="outline" className="mb-5 w-full" disabled>
                    {language === "pt" ? "Plano gratuito" : "Free plan"}
                  </Button>
                ) : (
                  <Button
                    className={`mb-5 w-full ${
                      plan.popular ? "bg-[#22C55E] hover:bg-[#16A34A]" : ""
                    }`}
                    onClick={() => handleSelectPlan(plan.key as "pro" | "plus")}
                    disabled={loadingPlan === plan.key}
                  >
                    {loadingPlan === plan.key ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : plan.popular ? (
                      <Sparkles className="h-4 w-4 mr-1" />
                    ) : null}
                    {loadingPlan === plan.key
                      ? (language === "pt" ? "Processando..." : "Processing...")
                      : (language === "pt" ? "Começar trial grátis" : "Start free trial")}
                  </Button>
                )}

                <ul className="space-y-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat.name.en} className="flex items-center gap-2 text-sm">
                      {feat.included ? (
                        <Check className="h-4 w-4 shrink-0 text-[#22C55E]" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-gray-300" />
                      )}
                      <span className={feat.included ? "text-gray-700" : "text-gray-400"}>
                        {feat.name[language]}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits */}
      <div className="mb-12">
        <h2 className="mb-6 text-center text-xl font-bold">
          {language === "pt" ? "Por que fazer upgrade?" : "Why upgrade?"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.title.en}>
                <CardContent className="py-4 text-center">
                  <div className="mb-3 mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0FDF4]">
                    <Icon className="h-5 w-5 text-[#22C55E]" />
                  </div>
                  <h3 className="text-sm font-semibold">{b.title[language]}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{b.description[language]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="mb-6 text-center text-xl font-bold">
          {language === "pt" ? "Perguntas frequentes" : "FAQ"}
        </h2>
        <div className="mx-auto max-w-2xl space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border bg-white overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-gray-50"
              >
                {faq.q[language]}
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                )}
              </button>
              {openFaq === i && (
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  {faq.a[language]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#15803D] p-8 text-center text-white">
        <h2 className="text-2xl font-bold">
          {language === "pt" ? "Pronto para escalar?" : "Ready to scale?"}
        </h2>
        <p className="mt-2 text-sm text-white/80">
          {language === "pt" ? "Comece agora com 14 dias grátis." : "Start now with a 14-day free trial."}
        </p>
        <Button
          className="mt-4 bg-white text-[#22C55E] hover:bg-white/90"
          size="lg"
          onClick={() => handleSelectPlan("pro")}
          disabled={!!loadingPlan}
        >
          {loadingPlan ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1" />
          )}
          {language === "pt" ? "Começar trial grátis" : "Start free trial"}
        </Button>
      </div>
    </div>
  );
}
