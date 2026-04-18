import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { recalculateWeekTotals } from "@/lib/db/helpers";
import { z } from "zod";

type Params = { params: Promise<{ weekStart: string }> };

export async function GET(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { weekStart: weekStartStr } = await params;
  const weekStart = new Date(weekStartStr + "T00:00:00.000Z");

  const schedule = await db.weeklySchedule.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    include: {
      jobs: {
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        include: {
          cleaner: { select: { id: true, name: true, avatarColor: true, hourlyRate: true } },
          client: { select: { id: true, name: true, address: true } },
        },
      },
    },
  });

  if (!schedule) {
    return errorResponse("Week not found", 404);
  }

  return successResponse(schedule);
}

const updateWeekSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).optional(),
  recalculate: z.boolean().optional(),
});

export async function PUT(req: Request, { params }: Params) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const { weekStart: weekStartStr } = await params;
  const weekStart = new Date(weekStartStr + "T00:00:00.000Z");

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = updateWeekSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  const existing = await db.weeklySchedule.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  });
  if (!existing) {
    return errorResponse("Week not found", 404);
  }

  if (parsed.data.status) {
    await db.weeklySchedule.update({
      where: { id: existing.id },
      data: { status: parsed.data.status },
    });
  }

  if (parsed.data.recalculate) {
    await recalculateWeekTotals(existing.id);
  }

  const updated = await db.weeklySchedule.findUnique({
    where: { id: existing.id },
    include: {
      _count: { select: { jobs: true } },
    },
  });

  return successResponse(updated);
}

export async function DELETE(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { weekStart: weekStartStr } = await params;
  const weekStart = new Date(weekStartStr + "T00:00:00.000Z");

  const existing = await db.weeklySchedule.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  });
  if (!existing) {
    return errorResponse("Week not found", 404);
  }

  // Delete jobs, then the schedule
  await db.job.deleteMany({ where: { scheduleId: existing.id } });
  await db.weeklySchedule.delete({ where: { id: existing.id } });

  return successResponse({ deleted: true });
}
