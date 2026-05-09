// Minimal Telegram Bot API client.
// Uses sendMessage + setWebhook + setMyCommands. No SDK to keep deps tight.

const API_BASE = "https://api.telegram.org";

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN not set");
  return t;
}

function chatId(): string {
  const id = process.env.TELEGRAM_USER_ID;
  if (!id) throw new Error("TELEGRAM_USER_ID not set");
  return id;
}

interface SendMessageOptions {
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  reply_markup?: unknown;
  disable_web_page_preview?: boolean;
}

export async function sendMessage(
  text: string,
  opts: SendMessageOptions = {},
): Promise<{ ok: boolean; messageId?: number; description?: string }> {
  const url = `${API_BASE}/bot${token()}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId(),
      text,
      parse_mode: opts.parse_mode ?? "Markdown",
      disable_web_page_preview: opts.disable_web_page_preview ?? true,
      reply_markup: opts.reply_markup,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok: boolean;
    result?: { message_id: number };
    description?: string;
  };
  return {
    ok: !!data.ok,
    messageId: data.result?.message_id,
    description: data.description,
  };
}

export async function setWebhook(url: string, secretToken: string): Promise<{ ok: boolean; description?: string }> {
  const res = await fetch(`${API_BASE}/bot${token()}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      secret_token: secretToken,
      allowed_updates: ["message"],
    }),
  });
  return (await res.json()) as { ok: boolean; description?: string };
}

export async function setMyCommands(): Promise<void> {
  await fetch(`${API_BASE}/bot${token()}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "pensa", description: "Forçar um ciclo de geração agora" },
        { command: "ultimas", description: "Listar últimos 5 insights enviados" },
        { command: "status", description: "Ver snapshot atual do funil" },
        { command: "done", description: "Marcar último insight como feito" },
        { command: "ruim", description: "Marcar último como ruim (calibra filtro)" },
        { command: "skip", description: "Pular último insight (cooldown)" },
        { command: "ajuda", description: "Mostrar comandos" },
      ],
    }),
  }).catch(() => undefined);
}

// ─── Markdown formatting helpers ─────────────────────────────────────────────

const ALIAS_BY_CATEGORY: Record<string, string> = {
  acquisition: "🎣 Aquisição",
  conversion: "💸 Conversão",
  retention: "🪢 Retenção",
  product: "🛠️ Produto",
  pricing: "🏷️ Pricing",
  bug: "🐛 Bug",
  activation: "⚡ Ativação",
  positioning: "🧭 Posicionamento",
  measurement: "📊 Mensuração",
  trust: "🤝 Confiança",
  "growth-loop": "🔁 Growth loop",
  discovery: "🔎 Discovery",
  meta: "🧠 Meta",
  "north-star": "🎯 Norte",
};

export function formatInsight(args: {
  insightId: string;
  category: string;
  title: string;
  body: string;
  effort: string;
  impact: string;
  funnelStage?: string;
}): string {
  const cat = ALIAS_BY_CATEGORY[args.category] ?? args.category;
  const tag = `${cat} · ${args.impact}/${args.effort}`;
  const idLine = `_id: ${args.insightId.slice(0, 8)}_`;
  return [`*${args.title}*`, tag, "", args.body, "", idLine].join("\n");
}

export function formatRecapHeader(snapshotMrr: number, paying: number, target: number): string {
  return `🎯 *Ciclo · ${paying}/${target} pagantes · MRR ~$${Math.round(snapshotMrr)}*`;
}
