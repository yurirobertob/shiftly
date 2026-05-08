import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const responses = await db.usabilityResponse.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(responses);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      experienceYears,
      currentTools,
      currentToolsOther,
      completedWeek,
      weekBlocker,
      weekEasiest,
      weekHardest,
      quitMoment,
      exploredSections,
      brokenFeature,
      missingFeature,
      dailyPainPoint,
      oneWordDescription,
      visualHelped,
      npsScore,
      npsReason,
      oneChange,
    } = body;

    if (!name || !experienceYears || !completedWeek || !visualHelped || npsScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.usabilityResponse.create({
      data: {
        name: String(name),
        experienceYears: String(experienceYears),
        currentTools: Array.isArray(currentTools) ? currentTools : [],
        currentToolsOther: currentToolsOther || null,
        completedWeek: String(completedWeek),
        weekBlocker: weekBlocker || null,
        weekEasiest: weekEasiest || null,
        weekHardest: weekHardest || null,
        quitMoment: quitMoment || null,
        exploredSections: Array.isArray(exploredSections) ? exploredSections : [],
        brokenFeature: brokenFeature || null,
        missingFeature: missingFeature || null,
        dailyPainPoint: dailyPainPoint || null,
        oneWordDescription: oneWordDescription || null,
        visualHelped: String(visualHelped),
        npsScore: Number(npsScore),
        npsReason: npsReason || null,
        oneChange: oneChange || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Usability API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
