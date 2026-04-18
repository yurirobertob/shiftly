import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { recalculateWeekTotals } from "@/lib/db/helpers";
import { z } from "zod";

const updateJobSchema = z.object({
  cleanerId: z.string().nullable().optional(),
  clientId: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "ABSENT", "CANCELLED", "UNCOVERED"]).optional(),
  notes: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { id } = await params;

  const job = await db.job.findFirst({
    where: { id, schedule: { userId } },
    include: {
      cleaner: { select: { id: true, name: true, avatarColor: true, hourlyRate: true } },
      client: { select: { id: true, name: true, address: true } },
      schedule: { select: { weekStart: true, status: true } },
    },
  });

  if (!job) {
    return errorResponse("Job not found", 404);
  }

  return successResponse(job);
}

export async function PUT(req: Request, { params }: Params) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const { id } = await params;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = updateJobSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  const existing = await db.job.findFirst({
    where: { id, schedule: { userId } },
    include: { schedule: { select: { id: true } } },
  });
  if (!existing) {
    return errorResponse("Job not found", 404);
  }

  // Build update data
  const updateData: any = { ...parsed.data };

  // Recalculate cost if cleaner or times changed
  const newCleanerId = parsed.data.cleanerId !== undefined ? parsed.data.cleanerId : existing.cleanerId;
  const newStartTime = parsed.data.startTime ?? existing.startTime;
  const newEndTime = parsed.data.endTime ?? existing.endTime;

  if (newCleanerId) {
    const cleaner = await db.cleaner.findFirst({
      where: { id: newCleanerId, userId },
      select: { hourlyRate: true },
    });
    if (!cleaner) return errorResponse("Cleaner not found", 404);

    const [sh, sm] = newStartTime.split(":").map(Number);
    const [eh, em] = newEndTime.split(":").map(Number);
    const hours = eh + em / 60 - (sh + sm / 60);

    updateData.hourlyRate = Number(cleaner.hourlyRate);
    updateData.hoursWorked = hours;
    updateData.cost = Number(cleaner.hourlyRate) * hours;
  } else if (parsed.data.cleanerId === null) {
    // Cleaner removed
    updateData.hourlyRate = 0;
    updateData.hoursWorked = 0;
    updateData.cost = 0;
    if (!parsed.data.status) {
      updateData.status = "UNCOVERED";
    }
  }

  const job = await db.job.update({
    where: { id },
    data: updateData,
    include: {
      cleaner: { select: { id: true, name: true, avatarColor: true } },
      client: { select: { id: true, name: true } },
    },
  });

  // Recalculate week totals
  await recalculateWeekTotals(existing.schedule.id);

  return successResponse(job);
}

export async function DELETE(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { id } = await params;

  const existing = await db.job.findFirst({
    where: { id, schedule: { userId } },
    include: { schedule: { select: { id: true } } },
  });
  if (!existing) {
    return errorResponse("Job not found", 404);
  }

  await db.job.delete({ where: { id } });

  // Recalculate week totals
  await recalculateWeekTotals(existing.schedule.id);

  return successResponse({ deleted: true });
}
