import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrialBanner } from "@/components/trial-banner";
import { isTrialActive as checkTrial, daysLeftInTrial } from "@/lib/subscription";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;
  const trialActive = checkTrial({
    plan: user.plan,
    trialEndsAt: user.trialEndsAt,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
  });
  const trialDays = daysLeftInTrial({
    plan: user.plan,
    trialEndsAt: user.trialEndsAt,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
  });

  return (
    <div className="mx-auto max-w-4xl p-8">
      <TrialBanner />

      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Shiftly
        </h1>
        <p className="mt-1 text-muted-foreground">
          Hello, {user.name || user.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={user.plan === "PRO" ? "default" : "secondary"}
            >
              {user.plan}
            </Badge>
            {trialActive && (
              <p className="mt-2 text-sm text-muted-foreground">
                {trialDays} {trialDays === 1 ? "dia restante" : "dias restantes"} no período de teste
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conta</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{user.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
