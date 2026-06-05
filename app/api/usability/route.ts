import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const usabilitySchema = z.object({
  name: z.string().min(1).max(200),
  experienceYears: z.string().min(1).max(50),
  currentTools: z.array(z.string().max(100)).max(20).default([]),
  currentToolsOther: z.string().max(300).optional().nullable(),
  completedWeek: z.string().min(1).max(50),
  weekBlocker: z.string().max(1000).optional().nullable(),
  weekEasiest: z.string().max(1000).optional().nullable(),
  weekHardest: z.string().max(1000).optional().nullable(),
  quitMoment: z.string().max(1000).optional().nullable(),
  exploredSections: z.array(z.string().max(100)).max(20).default([]),
  brokenFeature: z.string().max(1000).optional().nullable(),
  missingFeature: z.string().max(1000).optional().nullable(),
  dailyPainPoint: z.string().max(1000).optional().nullable(),
  oneWordDescription: z.string().max(100).optional().nullable(),
  visualHelped: z.string().min(1).max(50),
  npsScore: z.number().int().min(0).max(10),
  npsReason: z.string().max(1000).optional().nullable(),
  oneChange: z.string().max(1000).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ADMIN_EMAIL || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const responses = await db.usabilityResponse.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(responses);
}

export async function POST(req: Request) {
  const token = req.headers.get("x-usability-token");
  if (!process.env.USABILITY_TOKEN || token !== process.env.USABILITY_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = usabilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    await db.usabilityResponse.create({
      data: {
        name: data.name,
        experienceYears: data.experienceYears,
        currentTools: data.currentTools,
        currentToolsOther: data.currentToolsOther ?? null,
        completedWeek: data.completedWeek,
        weekBlocker: data.weekBlocker ?? null,
        weekEasiest: data.weekEasiest ?? null,
        weekHardest: data.weekHardest ?? null,
        quitMoment: data.quitMoment ?? null,
        exploredSections: data.exploredSections,
        brokenFeature: data.brokenFeature ?? null,
        missingFeature: data.missingFeature ?? null,
        dailyPainPoint: data.dailyPainPoint ?? null,
        oneWordDescription: data.oneWordDescription ?? null,
        visualHelped: data.visualHelped,
        npsScore: data.npsScore,
        npsReason: data.npsReason ?? null,
        oneChange: data.oneChange ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Usability API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
