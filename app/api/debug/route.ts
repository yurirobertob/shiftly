import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars (only show presence, not values)
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "✅ set" : "❌ missing";
  checks.AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID ? "✅ set" : "❌ missing";
  checks.AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET ? "✅ set" : "❌ missing";
  checks.DATABASE_URL = process.env.DATABASE_URL ? "✅ set" : "❌ missing";
  checks.AUTH_URL = process.env.AUTH_URL ? `✅ ${process.env.AUTH_URL}` : "❌ missing";
  checks.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST ? "✅ set" : "❌ missing";

  // Test DB connection
  try {
    const userCount = await db.user.count();
    checks.DB_CONNECTION = `✅ connected (${userCount} users)`;
  } catch (error: any) {
    checks.DB_CONNECTION = `❌ ${error.message}`;
  }

  return NextResponse.json(checks, { status: 200 });
}
