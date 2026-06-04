import { db } from "@/lib/db";
import { unlockAchievement } from "@/lib/achievements";

async function tryUnlock(userId: string, slug: string) {
  try {
    await unlockAchievement(userId, slug);
  } catch {}
}

export async function onCleanerCreated(userId: string) {
  const count = await db.cleaner.count({
    where: { userId, status: { not: "INACTIVE" } },
  });
  if (count >= 10) void tryUnlock(userId, "10-cleaners-gerenciadas");
}

export async function onJobCreated(userId: string) {
  const count = await db.job.count({
    where: { schedule: { userId } },
  });
  if (count >= 100) void tryUnlock(userId, "100-servicos-agendados");
}

export async function onWeekGenerated(userId: string, scheduleId: string) {
  void tryUnlock(userId, "primeira-semana-completa");

  const [activeCleanerCount, cleanersWithJobs] = await Promise.all([
    db.cleaner.count({ where: { userId, status: "ACTIVE" } }),
    db.job.groupBy({
      by: ["cleanerId"],
      where: { scheduleId, cleanerId: { not: null } },
    }),
  ]);

  if (activeCleanerCount > 0 && cleanersWithJobs.length >= activeCleanerCount) {
    void tryUnlock(userId, "equipe-completa-semana");
  }
}

export async function onWeekClosed(userId: string, scheduleId: string, weekStart: Date) {
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const absenceCount = await db.absence.count({
    where: { userId, date: { gte: weekStart, lt: weekEnd } },
  });
  if (absenceCount === 0) void tryUnlock(userId, "zero-faltas-na-semana");

  // Closed before Sunday (day 0)
  if (new Date().getDay() !== 0) void tryUnlock(userId, "semana-fechada");

  // Cost reduced 15% vs previous week
  const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [currentWeek, prevWeek] = await Promise.all([
    db.weeklySchedule.findUnique({ where: { id: scheduleId }, select: { totalCost: true } }),
    db.weeklySchedule.findFirst({ where: { userId, weekStart: prevWeekStart }, select: { totalCost: true } }),
  ]);
  if (currentWeek?.totalCost && prevWeek?.totalCost) {
    const current = Number(currentWeek.totalCost);
    const prev = Number(prevWeek.totalCost);
    if (prev > 0 && current <= prev * 0.85) {
      void tryUnlock(userId, "custo-reduzido-15");
    }
  }
}

export async function onJobCompleted(userId: string) {
  const count = await db.job.count({
    where: { status: "COMPLETED", schedule: { userId } },
  });
  if (count >= 500) void tryUnlock(userId, "500-servicos-concluidos");
}

export async function onReportExported(userId: string) {
  void tryUnlock(userId, "relatorio-gerado");
}
