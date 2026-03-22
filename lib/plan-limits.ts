import type { Plan } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";

export const PLAN_LIMITS = {
  FREE: {
    colaboradores: 0,
    unidades: 0,
    clientes: 0,
  },
  TRIAL: {
    colaboradores: 30,
    unidades: 3,
    clientes: 50,
  },
  PRO: {
    colaboradores: 30,
    unidades: 3,
    clientes: 50,
  },
  SCALE: {
    colaboradores: Infinity,
    unidades: Infinity,
    clientes: Infinity,
  },
} as const;

type Resource = keyof (typeof PLAN_LIMITS)["TRIAL"];

export async function checkUsageLimit(
  empresaId: string,
  plan: Plan,
  resource: Resource
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
  const limit = limits[resource];

  let current = 0;
  switch (resource) {
    case "colaboradores":
      current = await db.colaborador.count({ where: { empresaId, active: true } });
      break;
    case "unidades":
      current = await db.unidade.count({ where: { empresaId } });
      break;
    case "clientes":
      current = await db.cliente.count({ where: { empresaId } });
      break;
  }

  return { allowed: current < limit, current, limit };
}
