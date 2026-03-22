import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;
  const isTrialActive =
    user.plan === "TRIAL" &&
    user.trialEndsAt &&
    new Date(user.trialEndsAt) > new Date();
  const trialDaysLeft = user.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.trialEndsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
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
            <CardTitle className="text-lg">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={user.plan === "PRO" ? "default" : "secondary"}
            >
              {user.plan}
            </Badge>
            {isTrialActive && (
              <p className="mt-2 text-sm text-muted-foreground">
                {trialDaysLeft} days remaining in your trial
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{user.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
