import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isSubscribed, isTrialActive, daysLeftInTrial } from "@/lib/subscription";
import { BillingActions } from "./billing-actions";
import { PLANS } from "@/lib/stripe";

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const sub = {
    plan: subscription?.plan ?? "BASIC",
    trialEndsAt: subscription?.trialEndsAt ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
  };

  const subscribed = isSubscribed(sub);
  const trialActive = isTrialActive(sub);
  const trialDays = daysLeftInTrial(sub);
  const isPastDue = subscription?.status === "PAST_DUE";

  const planKey = (sub.plan.toLowerCase()) as keyof typeof PLANS;
  const planLabel = PLANS[planKey]?.name ?? "Basic";

  const [cleanerCount, clientCount] = await Promise.all([
    db.cleaner.count({ where: { userId: session.user.id, status: { not: "INACTIVE" } } }),
    db.client.count({ where: { userId: session.user.id, status: "ACTIVE" } }),
  ]);

  const limits = PLANS[planKey];

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Faturamento</h1>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Plano {planLabel}</h2>
            {trialActive && (
              <p className="text-sm text-muted-foreground mt-1">
                {trialDays} {trialDays === 1 ? "dia restante" : "dias restantes"} no período de teste
              </p>
            )}
            {subscribed && sub.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground mt-1">
                Próxima cobrança:{" "}
                {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}
              </p>
            )}
            {isPastDue && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                Pagamento pendente — atualize seu método de pagamento
              </p>
            )}
            {subscription?.cancelAtPeriodEnd && (
              <p className="text-sm text-amber-600 mt-1">
                Cancelamento programado para o final do período
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              isPastDue
                ? "bg-red-50 text-red-700"
                : subscribed
                ? "bg-green-50 text-green-700"
                : trialActive
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isPastDue ? "Pagamento pendente" : subscribed ? "Ativo" : trialActive ? "Trial" : "Inativo"}
          </span>
        </div>

        {/* Usage */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Colaboradoras</p>
            <p className="text-lg font-bold text-gray-900">
              {cleanerCount}/{limits.maxCleaners}
            </p>
            <div className="mt-1 h-1.5 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#22C55E]"
                style={{ width: `${Math.min((cleanerCount / limits.maxCleaners) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Clientes</p>
            <p className="text-lg font-bold text-gray-900">
              {clientCount}/{limits.maxClients}
            </p>
            <div className="mt-1 h-1.5 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#22C55E]"
                style={{ width: `${Math.min((clientCount / limits.maxClients) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Plan features */}
        {!subscribed && (
          <div className="mt-6 space-y-3">
            <div className="rounded-lg border border-[#22C55E]/30 bg-[#F0FDF4] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#15803D]">Plano Pro — £39/mês</h3>
                <span className="text-xs text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">Recomendado</span>
              </div>
              <ul className="space-y-1 text-sm text-[#15803D]/80">
                {PLANS.pro.features.pt.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-700">Plano Plus — £59/mês</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-500">
                {PLANS.plus.features.pt.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <BillingActions
          subscribed={subscribed}
          hasStripeCustomer={!!subscription?.stripeCustomerId}
          currentPlan={planKey}
        />
      </div>
    </div>
  );
}
