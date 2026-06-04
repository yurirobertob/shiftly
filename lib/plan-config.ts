// Client-safe plan definitions — no Stripe SDK dependency.
// Server code in lib/stripe.ts imports from here and adds price IDs.

export const PLAN_CONFIG = {
  basic: {
    name: "Basic",
    maxCleaners: 5,
    maxClients: 10,
    price: { monthly: 0, yearly: 0 },
    features: {
      pt: ["Até 5 colaboradoras", "Até 10 clientes", "Agenda semanal", "Cálculo básico de pagamento"],
      en: ["Up to 5 cleaners", "Up to 10 clients", "Weekly schedule", "Basic pay calculation"],
    },
  },
  pro: {
    name: "Pro",
    maxCleaners: 15,
    maxClients: 50,
    price: { monthly: 39, yearly: 29 },
    features: {
      pt: ["Até 15 colaboradoras", "Até 50 clientes", "Alertas de ausência + cobertura em 1 clique", "Relatórios semanais PDF/CSV", "Gamificação e conquistas", "Suporte por email"],
      en: ["Up to 15 cleaners", "Up to 50 clients", "Absence alerts + 1-click cover", "Weekly PDF/CSV reports", "Gamification & achievements", "Email support"],
    },
  },
  plus: {
    name: "Plus",
    maxCleaners: 30,
    maxClients: 100,
    price: { monthly: 59, yearly: 44 },
    features: {
      pt: ["Até 30 colaboradoras", "Até 100 clientes", "Relatórios avançados com filtros", "Exportar Excel", "Suporte prioritário", "Branding personalizado"],
      en: ["Up to 30 cleaners", "Up to 100 clients", "Advanced reports with filters", "Excel export", "Priority support", "Custom branding"],
    },
  },
} as const;

export type PlanKey = keyof typeof PLAN_CONFIG;
export type PlanConfigKey = PlanKey;
