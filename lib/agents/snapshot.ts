import { db } from "@/lib/db";
import { stripe, PLANS } from "@/lib/stripe";
import type { Snapshot, FunnelStage } from "./types";

const TARGET_CUSTOMERS = 50;

function stageFor(paying: number): FunnelStage {
  if (paying <= 0) return "0";
  if (paying < 10) return "1-10";
  if (paying < 30) return "10-30";
  if (paying < 50) return "30-50";
  return "50+";
}

const STOPWORDS = new Set([
  "a","o","e","de","da","do","das","dos","em","no","na","nos","nas","um","uma","uns","umas",
  "que","com","por","para","pra","pro","se","mais","menos","ao","aos","à","às","ou","mas","nao","não",
  "sim","muito","muita","muitos","muitas","só","so","ja","já","tudo","todo","toda","tem","ter","ser","está",
  "esta","estão","fica","ficar","quando","onde","como","oque","aqui","ali","la","lá","sobre","entre","até","ate",
  "isso","isto","dessa","desse","disso","esse","essa","esses","essas","aquele","aquela","seu","sua","seus","suas",
  "meu","minha","meus","minhas","eu","voce","você","ele","ela","eles","elas","nós","nos","só","sao","são",
  "the","a","an","is","are","be","of","to","in","on","for","with","that","it","this","my","your",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}

function topThemes(
  texts: Array<string | null | undefined>,
  limit = 5,
): Array<{ token: string; count: number; samples: string[] }> {
  const counts = new Map<string, { count: number; samples: Set<string> }>();
  for (const raw of texts) {
    if (!raw) continue;
    const sample = raw.trim().slice(0, 140);
    const seen = new Set<string>();
    for (const tok of tokenize(raw)) {
      if (seen.has(tok)) continue;
      seen.add(tok);
      const entry = counts.get(tok) ?? { count: 0, samples: new Set<string>() };
      entry.count += 1;
      if (entry.samples.size < 3) entry.samples.add(sample);
      counts.set(tok, entry);
    }
  }
  return [...counts.entries()]
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([token, v]) => ({ token, count: v.count, samples: [...v.samples] }));
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}

async function safeStripeMrr(): Promise<number> {
  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("sk_placeholder")) {
      return 0;
    }
    let mrr = 0;
    for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100 }) as AsyncIterable<any>) {
      for (const item of sub.items?.data ?? []) {
        const unit = (item.price?.unit_amount ?? 0) / 100;
        const qty = item.quantity ?? 1;
        const interval = item.price?.recurring?.interval;
        const monthly = interval === "year" ? unit / 12 : interval === "week" ? unit * 4.33 : unit;
        mrr += monthly * qty;
      }
    }
    return Math.round(mrr * 100) / 100;
  } catch {
    return 0;
  }
}

export async function buildSnapshot(): Promise<Snapshot> {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86_400_000);
  const d30 = new Date(now.getTime() - 30 * 86_400_000);

  const [
    totalUsers,
    newUsers7d,
    newUsers30d,
    lastUser,
    subs,
    lastPayingSub,
    newPaying7d,
    newPaying30d,
    feedbackAll,
    feedback30d,
    insights,
    mrrUsd,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: d7 } } }),
    db.user.count({ where: { createdAt: { gte: d30 } } }),
    db.user.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    db.subscription.findMany({
      select: { plan: true, status: true, createdAt: true },
    }),
    db.subscription.findFirst({
      where: { status: { in: ["ACTIVE", "TRIALING"] }, plan: { not: "BASIC" } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    db.subscription.count({
      where: { createdAt: { gte: d7 }, status: { in: ["ACTIVE", "TRIALING"] }, plan: { not: "BASIC" } },
    }),
    db.subscription.count({
      where: { createdAt: { gte: d30 }, status: { in: ["ACTIVE", "TRIALING"] }, plan: { not: "BASIC" } },
    }),
    db.usabilityResponse.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.usabilityResponse.findMany({
      where: { createdAt: { gte: d30 } },
      orderBy: { createdAt: "desc" },
    }),
    db.insight.findMany({
      where: { sentAt: { gte: new Date(now.getTime() - 60 * 86_400_000) } },
      select: {
        templateId: true,
        category: true,
        sentAt: true,
        status: true,
      },
    }),
    safeStripeMrr(),
  ]);

  // Funnel
  const paying = subs.filter((s) => s.status === "ACTIVE" && s.plan !== "BASIC").length;
  const trialing = subs.filter((s) => s.status === "TRIALING").length;
  const pastDue = subs.filter((s) => s.status === "PAST_DUE").length;
  const planDist = {
    basic: subs.filter((s) => s.plan === "BASIC").length,
    pro: subs.filter((s) => s.plan === "PRO").length,
    plus: subs.filter((s) => s.plan === "PLUS").length,
  };

  // Feedback
  const npsScores = feedbackAll.map((r) => r.npsScore);
  const npsAvg = npsScores.length ? avg(npsScores) : null;
  const nps30 = feedback30d.map((r) => r.npsScore);
  const npsAvg30d = nps30.length ? avg(nps30) : null;
  const detractors30d = nps30.filter((s) => s <= 6).length;
  const promoters30d = nps30.filter((s) => s >= 9).length;
  const passives30d = nps30.length - detractors30d - promoters30d;
  const completedWeekRate = feedback30d.length
    ? feedback30d.filter((r) => r.completedWeek === "yes").length / feedback30d.length
    : null;
  const visualHelpedRate = feedback30d.length
    ? feedback30d.filter((r) => r.visualHelped === "yes").length / feedback30d.length
    : null;

  const topMissingFeatures = topThemes(feedback30d.map((r) => r.missingFeature));
  const topPainPoints = topThemes(feedback30d.map((r) => r.dailyPainPoint));
  const weekBlockerThemes = topThemes(feedback30d.map((r) => r.weekBlocker));
  const brokenFeatureMentions = feedback30d
    .map((r) => r.brokenFeature?.trim())
    .filter((s): s is string => Boolean(s && s.length >= 3))
    .slice(0, 5);
  const quitMomentMentions = feedback30d
    .map((r) => r.quitMoment?.trim())
    .filter((s): s is string => Boolean(s && s.length >= 3))
    .slice(0, 5);

  // Insight history
  const sentByTemplate = new Map<string, Date>();
  const sentByCategory = new Map<string, Date>();
  let doneCount = 0;
  let dismissedCount = 0;
  let sentLast30d = 0;
  let sentLast24h = 0;
  let sentLast7d = 0;
  for (const ins of insights) {
    const prevT = sentByTemplate.get(ins.templateId);
    if (!prevT || prevT < ins.sentAt) sentByTemplate.set(ins.templateId, ins.sentAt);
    const prevC = sentByCategory.get(ins.category);
    if (!prevC || prevC < ins.sentAt) sentByCategory.set(ins.category, ins.sentAt);
    if (ins.status === "done") doneCount += 1;
    if (ins.status === "dismissed") dismissedCount += 1;
    if (ins.sentAt >= d30) sentLast30d += 1;
    if (ins.sentAt >= d7) sentLast7d += 1;
    if (ins.sentAt >= new Date(now.getTime() - 86_400_000)) sentLast24h += 1;
  }

  return {
    capturedAt: now,
    funnel: {
      stage: stageFor(paying),
      payingCustomers: paying,
      trialingCustomers: trialing,
      pastDueCustomers: pastDue,
      totalUsers,
      mrrUsd,
      targetCustomers: TARGET_CUSTOMERS,
      customersToTarget: Math.max(0, TARGET_CUSTOMERS - paying),
    },
    plans: planDist,
    growth: {
      newUsers7d,
      newUsers30d,
      newPaying7d,
      newPaying30d,
      daysSinceLastNewPaying: lastPayingSub ? daysBetween(now, lastPayingSub.createdAt) : null,
      daysSinceLastNewUser: lastUser ? daysBetween(now, lastUser.createdAt) : null,
    },
    feedback: {
      total: feedbackAll.length,
      last30d: feedback30d.length,
      last7d: feedbackAll.filter((r) => r.createdAt >= d7).length,
      npsAvg,
      npsAvg30d,
      detractors30d,
      promoters30d,
      passives30d,
      topMissingFeatures,
      topPainPoints,
      brokenFeatureMentions,
      weekBlockerThemes,
      quitMomentMentions,
      completedWeekRate,
      visualHelpedRate,
    },
    insightHistory: {
      sentLast24h,
      sentLast7d,
      sentByTemplate,
      sentByCategory,
      doneCount,
      dismissedCount,
      actedRate: sentLast30d > 0 ? doneCount / sentLast30d : null,
    },
  };
}

function avg(xs: number[]): number {
  return Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10;
}

// Re-export plan info for heuristics that need to reference current pricing
export { PLANS };
