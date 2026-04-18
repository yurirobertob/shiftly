import { db } from "@/lib/db";

// ─── XP & Level System ──────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1800, 2500];

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export function getLevelLabel(level: number, lang: "pt" | "en" = "pt"): string {
  const labelsPt = [
    "",
    "Iniciante",
    "Organizada",
    "Eficiente",
    "Gestora experiente",
    "Profissional",
    "Expert",
    "Mestre",
    "Mestre",
  ];
  const labelsEn = [
    "",
    "Beginner",
    "Organised",
    "Efficient",
    "Experienced Manager",
    "Professional",
    "Expert",
    "Master",
    "Master",
  ];
  const labels = lang === "pt" ? labelsPt : labelsEn;
  return labels[level] ?? labels[labels.length - 1];
}

export function getXpForNextLevel(xp: number): number {
  const level = getLevel(xp);
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getLevelProgress(xp: number): number {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 100;
  return Math.min(100, ((xp - currentThreshold) / range) * 100);
}

// ─── Unlock Achievement ──────────────────────────────────────────────────────

export async function unlockAchievement(userId: string, slug: string) {
  const achievement = await db.achievement.findUnique({ where: { slug } });
  if (!achievement) return null;

  const existing = await db.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return null; // already unlocked

  const [userAchievement] = await db.$transaction([
    db.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    }),
    db.user.update({
      where: { id: userId },
      data: { xp: { increment: achievement.xpReward } },
    }),
  ]);

  return { achievement, userAchievement, xpEarned: achievement.xpReward };
}
