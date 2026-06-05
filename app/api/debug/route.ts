import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const checks: Record<string, string> = {};

  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "✅ set" : "❌ missing";
  checks.AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID ? "✅ set" : "❌ missing";
  checks.AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET ? "✅ set" : "❌ missing";
  checks.DATABASE_URL = process.env.DATABASE_URL ? "✅ set" : "❌ missing";
  checks.AUTH_URL = process.env.AUTH_URL ? "✅ set" : "❌ missing";
  checks.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST ? "✅ set" : "❌ missing";

  try {
    const userCount = await db.user.count();
    checks.DB_CONNECTION = `✅ connected (${userCount} users)`;
  } catch (error: any) {
    checks.DB_CONNECTION = `❌ ${error.message}`;
  }

  return NextResponse.json(checks, { status: 200 });
}
