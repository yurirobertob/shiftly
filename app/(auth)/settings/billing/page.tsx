import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isSubscribed, isTrialActive, daysLeftInTrial } from "@/lib/subscription";
import { BillingActions } from "./billing-actions";

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      trialEndsAt: true,
      stripeCustomerId: true,
      stripeCurrentPeriodEnd: true,
      stripePriceId: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const subscribed = isSubscribed(user);
  const trialActive = isTrialActive(user);
  const trialDays = daysLeftInTrial(user);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Faturamento</h1>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              Plano {user.plan === "PRO" ? "Pro" : user.plan === "TRIAL" ? "Trial" : "Free"}
            </h2>
            {trialActive && (
              <p className="text-sm text-muted-foreground mt-1">
                {trialDays} {trialDays === 1 ? "dia restante" : "dias restantes"} no período de teste
              </p>
            )}
            {subscribed && user.stripeCurrentPeriodEnd && (
              <p className="text-sm text-muted-foreground mt-1">
                Próxima cobrança:{" "}
                {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              subscribed
                ? "bg-green-50 text-green-700"
                : trialActive
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {subscribed ? "Ativo" : trialActive ? "Trial" : "Inativo"}
          </span>
        </div>

        {!subscribed && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">Plano Pro — R$ 149/mês</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>Até 30 colaboradores</li>
              <li>3 unidades</li>
              <li>Banco de horas e gestão de ausências</li>
              <li>Dashboard e portal do colaborador</li>
            </ul>
          </div>
        )}

        <BillingActions
          subscribed={subscribed}
          hasStripeCustomer={!!user.stripeCustomerId}
        />
      </div>
    </div>
  );
}
