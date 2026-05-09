import { db } from "@/lib/db";
import { buildSnapshot } from "./snapshot";
import { evaluateAll } from "./heuristics";
import { filterAndScore } from "./filter";
import { sendMessage, formatInsight, formatRecapHeader } from "./telegram";
import type { ScoredCandidate, Snapshot } from "./types";

export interface CycleResult {
  snapshot: Pick<Snapshot, "funnel" | "growth"> & { feedbackTotal: number };
  candidatesEvaluated: number;
  picked: Array<{ id: string; templateId: string; title: string; score: number }>;
  sent: number;
}

export async function runCycle(opts: { topN?: number } = {}): Promise<CycleResult> {
  const snapshot = await buildSnapshot();
  const candidates = evaluateAll(snapshot);
  const picked = filterAndScore(candidates, snapshot, { topN: opts.topN });

  // 1. Persist all picked insights first (so we have IDs to put in messages)
  const persisted: Array<{ id: string; cand: ScoredCandidate }> = [];
  for (const c of picked) {
    const row = await db.insight.create({
      data: {
        templateId: c.templateId,
        category: c.category,
        title: c.title,
        body: c.body,
        evidence: c.evidence,
        effort: c.effort,
        impact: c.impact,
        score: c.score,
        funnelStage: snapshot.funnel.stage,
        status: "sent",
      },
      select: { id: true },
    });
    persisted.push({ id: row.id, cand: c });
  }

  // 2. Send to Telegram
  let sent = 0;
  if (persisted.length > 0) {
    const header = formatRecapHeader(
      snapshot.funnel.mrrUsd,
      snapshot.funnel.payingCustomers,
      snapshot.funnel.targetCustomers,
    );
    await sendMessage(header, { parse_mode: "Markdown" }).catch(() => undefined);

    for (const { id, cand } of persisted) {
      // Skip the recap card — we already sent the header
      if (cand.templateId === "north-star-recap") continue;
      const text = formatInsight({
        insightId: id,
        category: cand.category,
        title: cand.title,
        body: cand.body,
        effort: cand.effort,
        impact: cand.impact,
      });
      const r = await sendMessage(text, { parse_mode: "Markdown" });
      if (r.ok) {
        sent += 1;
        if (r.messageId !== undefined) {
          await db.insight.update({
            where: { id },
            data: { telegramMsgId: r.messageId },
          }).catch(() => undefined);
        }
      }
    }
  }

  return {
    snapshot: {
      funnel: snapshot.funnel,
      growth: snapshot.growth,
      feedbackTotal: snapshot.feedback.total,
    },
    candidatesEvaluated: candidates.length,
    picked: persisted.map(({ id, cand }) => ({
      id,
      templateId: cand.templateId,
      title: cand.title,
      score: cand.score,
    })),
    sent,
  };
}

// ─── Webhook command handlers ────────────────────────────────────────────────

export async function handleCommand(text: string): Promise<string> {
  const trimmed = text.trim();
  const [cmdRaw, ...rest] = trimmed.split(/\s+/);
  const cmd = cmdRaw.toLowerCase().replace(/^\/+/, "").split("@")[0];
  const arg = rest.join(" ").trim();

  switch (cmd) {
    case "ajuda":
    case "help":
    case "start":
      return [
        "*Comandos do agente:*",
        "/pensa — gera insights agora (1 ciclo)",
        "/status — mostra snapshot do funil",
        "/ultimas — lista últimos 5 insights",
        "/done [id] — marca como feito (vazio = último)",
        "/ruim [id] — marca como ruim (vazio = último)",
        "/skip [id] — adia 14 dias (vazio = último)",
      ].join("\n");

    case "pensa":
    case "tick": {
      const r = await runCycle();
      return `Ciclo rodado. ${r.candidatesEvaluated} candidatos, ${r.sent} enviado(s).`;
    }

    case "status": {
      const s = await buildSnapshot();
      return [
        `*Funil*`,
        `Stage: \`${s.funnel.stage}\``,
        `Pagantes: ${s.funnel.payingCustomers} / ${s.funnel.targetCustomers}`,
        `Trialing: ${s.funnel.trialingCustomers}  ·  Past due: ${s.funnel.pastDueCustomers}`,
        `MRR: $${s.funnel.mrrUsd.toFixed(0)}`,
        `Usuários: ${s.funnel.totalUsers}`,
        ``,
        `*Últimos 30d*`,
        `Novos pagantes: ${s.growth.newPaying30d}`,
        `Novos usuários: ${s.growth.newUsers30d}`,
        `Respostas /teste: ${s.feedback.last30d}`,
        s.feedback.npsAvg30d !== null ? `NPS: ${s.feedback.npsAvg30d}` : `NPS: —`,
      ].join("\n");
    }

    case "ultimas":
    case "ultimos":
    case "last": {
      const recent = await db.insight.findMany({
        orderBy: { sentAt: "desc" },
        take: 5,
        select: { id: true, title: true, category: true, status: true, sentAt: true },
      });
      if (recent.length === 0) return "Nenhum insight enviado ainda.";
      return recent
        .map((r) => `\`${r.id.slice(0, 8)}\` · ${r.status} · ${r.category}\n  ${r.title}`)
        .join("\n\n");
    }

    case "done":
    case "ruim":
    case "skip":
    case "dismiss": {
      const target = arg
        ? await db.insight.findFirst({ where: { id: { startsWith: arg } } })
        : await db.insight.findFirst({ orderBy: { sentAt: "desc" } });
      if (!target) return "Não achei nenhum insight pra atualizar.";
      const newStatus = cmd === "done" ? "done" : cmd === "ruim" ? "dismissed" : "dismissed";
      await db.insight.update({
        where: { id: target.id },
        data: { status: newStatus, actedAt: new Date() },
      });
      return `\`${target.id.slice(0, 8)}\` → ${newStatus} ✓`;
    }

    default:
      return "Não entendi. Manda /ajuda pra ver comandos.";
  }
}
