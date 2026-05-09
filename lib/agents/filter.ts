import type { Candidate, ScoredCandidate, Snapshot, Heuristic } from "./types";
import { getHeuristics } from "./heuristics";

const IMPACT_WEIGHT = { L: 1, M: 3, H: 5 } as const;
const EFFORT_PENALTY = { S: 0, M: 1, L: 2 } as const;

const MAX_PER_CATEGORY = 1;
const DEFAULT_TOP_N = 3;
const MIN_SCORE = 2.0;

interface FilterOptions {
  topN?: number;
  // Allow north-star recap to always pass (it's informational, not advice)
  alwaysIncludeRecap?: boolean;
}

function heuristicMap(): Map<string, Heuristic> {
  const m = new Map<string, Heuristic>();
  for (const h of getHeuristics()) m.set(h.id, h);
  return m;
}

function baseId(templateId: string): string {
  // Heuristics that vary per token use "id:token" — strip the suffix to match
  const i = templateId.indexOf(":");
  return i === -1 ? templateId : templateId.slice(0, i);
}

function daysSince(date: Date | undefined, now: Date): number {
  if (!date) return Infinity;
  return (now.getTime() - date.getTime()) / 86_400_000;
}

export function filterAndScore(
  candidates: Candidate[],
  snapshot: Snapshot,
  opts: FilterOptions = {},
): ScoredCandidate[] {
  const topN = opts.topN ?? DEFAULT_TOP_N;
  const alwaysRecap = opts.alwaysIncludeRecap !== false;
  const heuristics = heuristicMap();
  const now = snapshot.capturedAt;
  const scored: ScoredCandidate[] = [];

  for (const c of candidates) {
    const reasons: string[] = [];
    const h = heuristics.get(baseId(c.templateId));
    const cooldown = h?.cooldownDays ?? 7;

    // 1. Cooldown filter
    const lastSent = snapshot.insightHistory.sentByTemplate.get(c.templateId);
    const sinceTemplate = daysSince(lastSent, now);
    if (sinceTemplate < cooldown) {
      // skip silently — still in cooldown
      if (!(alwaysRecap && c.templateId === "north-star-recap")) continue;
    }

    // 2. Base score
    const impactPts = IMPACT_WEIGHT[c.impact];
    const effortPts = EFFORT_PENALTY[c.effort];
    let score = impactPts * 2 - effortPts;
    reasons.push(`impact ${c.impact} (${impactPts}×2)`);
    reasons.push(`effort ${c.effort} (-${effortPts})`);

    // 3. Evidence boost — concrete data beats playbook
    const evCount = Math.min(c.evidence.length, 5);
    if (evCount > 0) {
      const boost = evCount * 0.6;
      score += boost;
      reasons.push(`evidence ×${evCount} (+${boost.toFixed(1)})`);
    }

    // 4. Freshness — categories untouched for a while go up
    const sinceCat = daysSince(snapshot.insightHistory.sentByCategory.get(c.category), now);
    if (sinceCat === Infinity) {
      score += 1.5;
      reasons.push(`new category (+1.5)`);
    } else if (sinceCat >= 7) {
      const f = Math.min(sinceCat / 7, 3) * 0.5;
      score += f;
      reasons.push(`category fresh ${sinceCat.toFixed(0)}d (+${f.toFixed(1)})`);
    } else {
      score -= 1;
      reasons.push(`category seen recently (-1)`);
    }

    // 5. Stage relevance — already handled in evaluateAll, no extra modifier

    scored.push({ ...c, score, reasons });
  }

  // 6. Sort, dedupe by category, cap, keep recap separate
  scored.sort((a, b) => b.score - a.score);

  const recap = alwaysRecap ? scored.find((c) => c.templateId === "north-star-recap") : undefined;
  const others = scored.filter((c) => c.templateId !== "north-star-recap");

  const picked: ScoredCandidate[] = [];
  const perCategory = new Map<string, number>();
  for (const c of others) {
    if (c.score < MIN_SCORE) break;
    const used = perCategory.get(c.category) ?? 0;
    if (used >= MAX_PER_CATEGORY) continue;
    perCategory.set(c.category, used + 1);
    picked.push(c);
    if (picked.length >= topN) break;
  }

  return recap ? [recap, ...picked] : picked;
}
