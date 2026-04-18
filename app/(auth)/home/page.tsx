"use client";

import { useSession } from "next-auth/react";
import { useLanguage } from "@/hooks/use-language";
import { HomeDashboard } from "@/components/home/home-dashboard";
import type { DashboardAlert } from "@/components/home/home-dashboard";
import {
  colaboradores,
  servicosHoje as servicosHojeMock,
  servicosSemana,
  unidades,
  rotasAtivas,
} from "@/lib/mock-data";
import { RotasFAB } from "@/components/rotas-ativas/rotas-fab";

export default function HomePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  const diaristasAtivas = colaboradores.filter((c) => c.status === "active").length;
  const custoSemanaBRL = 2068.5;

  const alerts: DashboardAlert[] = [
    {
      title: `Fabiana Souza — ${t("dashboard.home.absent")}`,
      description: t("dashboard.home.medicalNote"),
      severity: "critical",
    },
    {
      title: `Apt. Marques — ${t("dashboard.home.noCleaner")}`,
      description: t("dashboard.home.serviceNoAssignment"),
      severity: "critical",
    },
    {
      title: t("dashboard.home.lowCoverage"),
      description: t("dashboard.home.onlyCleanersConfirmed"),
      severity: "warning",
    },
  ];

  const userName = session?.user?.name || t("dashboard.sidebar.manager");

  return (
    <>
      <HomeDashboard
        userName={userName}
        avatarUrl={session?.user?.image || undefined}
        cleaners={colaboradores}
        services={servicosHojeMock}
        alerts={alerts}
        weekServices={servicosSemana}
        custoSemana={custoSemanaBRL}
        diaristasAtivas={diaristasAtivas}
        unidades={unidades.length}
      />
      <RotasFAB rotas={rotasAtivas} />
    </>
  );
}
