import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { generateWeekFromTemplate } from "@/lib/db/helpers";
import { z } from "zod";

export async function GET(req: Request) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") ?? "12");

  const where: any = { userId };
  if (status) where.status = status;

  const weeks = await db.weeklySchedule.findMany({
    where,
    orderBy: { weekStart: "desc" },
    take: Math.min(limit, 52),
    include: {
      _count: { select: { jobs: true } },
    },
  });

  return successResponse(weeks);
}

const generateSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "weekStart must be YYYY-MM-DD"),
  templateId: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  const weekStart = new Date(parsed.data.weekStart + "T00:00:00.000Z");

  // If no templateId, create an empty week schedule (or return existing)
  if (!parsed.data.templateId) {
    const existing = await db.weeklySchedule.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
      include: {
        jobs: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
          include: {
            cleaner: { select: { id: true, name: true, avatarColor: true } },
            client: { select: { id: true, name: true, address: true } },
          },
        },
      },
    });
    if (existing) return successResponse(existing);

    const schedule = await db.weeklySchedule.create({
      data: {
        userId,
        weekStart,
        status: "ACTIVE",
        totalCost: 0,
        totalJobs: 0,
        totalAbsences: 0,
      },
      include: {
        jobs: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
          include: {
            cleaner: { select: { id: true, name: true, avatarColor: true } },
            client: { select: { id: true, name: true, address: true } },
          },
        },
      },
    });
    return successResponse(schedule, 201);
  }

  // Verify template ownership
  const template = await db.scheduleTemplate.findFirst({
    where: { id: parsed.data.templateId, userId },
  });
  if (!template) {
    return errorResponse("Template not found", 404);
  }

  // Check if week already has jobs
  const existing = await db.weeklySchedule.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    include: { _count: { select: { jobs: true } } },
  });

  if (existing && existing._count.jobs > 0) {
    return errorResponse(
      "This week already has jobs. Delete them first or use a different week.",
      409
    );
  }

  const scheduleId = await generateWeekFromTemplate(
    userId,
    weekStart,
    parsed.data.templateId
  );

  const schedule = await db.weeklySchedule.findUnique({
    where: { id: scheduleId },
    include: {
      jobs: {
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        include: {
          cleaner: { select: { id: true, name: true, avatarColor: true } },
          client: { select: { id: true, name: true } },
        },
      },
    },
  });

  return successResponse(schedule, 201);
}
