export type Effort = "S" | "M" | "L";
export type Impact = "L" | "M" | "H";

export type FunnelStage = "0" | "1-10" | "10-30" | "30-50" | "50+";

export interface Snapshot {
  capturedAt: Date;
  funnel: {
    stage: FunnelStage;
    payingCustomers: number;
    trialingCustomers: number;
    pastDueCustomers: number;
    totalUsers: number;
    mrrUsd: number;
    targetCustomers: number;
    customersToTarget: number;
  };
  plans: {
    basic: number;
    pro: number;
    plus: number;
  };
  growth: {
    newUsers7d: number;
    newUsers30d: number;
    newPaying7d: number;
    newPaying30d: number;
    daysSinceLastNewPaying: number | null;
    daysSinceLastNewUser: number | null;
  };
  feedback: {
    total: number;
    last30d: number;
    last7d: number;
    npsAvg: number | null;
    npsAvg30d: number | null;
    detractors30d: number;
    promoters30d: number;
    passives30d: number;
    topMissingFeatures: Array<{ token: string; count: number; samples: string[] }>;
    topPainPoints: Array<{ token: string; count: number; samples: string[] }>;
    brokenFeatureMentions: string[];
    weekBlockerThemes: Array<{ token: string; count: number; samples: string[] }>;
    quitMomentMentions: string[];
    completedWeekRate: number | null; // 0..1
    visualHelpedRate: number | null;
  };
  insightHistory: {
    sentLast24h: number;
    sentLast7d: number;
    sentByTemplate: Map<string, Date>; // last sent date per template
    sentByCategory: Map<string, Date>; // last sent date per category
    doneCount: number;
    dismissedCount: number;
    actedRate: number | null; // (done) / (sent in last 30d)
  };
}

export interface Candidate {
  templateId: string;
  category: string;
  title: string;
  body: string;
  evidence: string[];
  effort: Effort;
  impact: Impact;
  funnelStage?: FunnelStage[];
  baseScore?: number; // optional override — defaults from impact/effort
}

export interface Heuristic {
  id: string;
  category: string;
  cooldownDays: number;
  // Stages where this heuristic is allowed to fire. Omit = any stage.
  stages?: FunnelStage[];
  evaluate(snapshot: Snapshot): Candidate | null;
}

export interface ScoredCandidate extends Candidate {
  score: number;
  reasons: string[];
}
