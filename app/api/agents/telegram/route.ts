import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleCommand } from "@/lib/agents/runner";
import { sendMessage } from "@/lib/agents/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number };
    chat?: { id: number };
    text?: string;
  };
}

function authorized(req: NextRequest): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return false;
  const got = req.headers.get("x-telegram-bot-api-secret-token");
  return got === expected;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const msg = update.message;
  if (!msg?.text) return NextResponse.json({ ok: true });

  // Restrict to the configured user only — bot is single-user
  const allowedUserId = process.env.TELEGRAM_USER_ID;
  if (allowedUserId && String(msg.from?.id) !== allowedUserId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const reply = await handleCommand(msg.text);
    await sendMessage(reply, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("[agents/telegram] handler error", err);
    await sendMessage(`Erro: ${err instanceof Error ? err.message : String(err)}`).catch(
      () => undefined,
    );
  }

  return NextResponse.json({ ok: true });
}
