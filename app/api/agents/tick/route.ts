import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { runCycle } from "@/lib/agents/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  // Vercel sends Authorization: Bearer for Vercel Cron when CRON_SECRET is set.
  // Also allow ?key= for manual trigger via curl during setup.
  const key = new URL(req.url).searchParams.get("key");
  return key === secret;
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await runCycle();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[agents/tick] error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
