import { getAuthUserId, errorResponse, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

type Params = { params: Promise<{ scheduleId: string }> };

/**
 * GET: Get payment summaries for a specific week schedule
 */
export async function GET(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { scheduleId } = await params;

  // Verify schedule ownership
  const schedule = await db.weeklySchedule.findFirst({
    where: { id: scheduleId, userId },
  });
  if (!schedule) {
    return errorResponse("Schedule not found", 404);
  }

  const payments = await db.paymentSummary.findMany({
    where: { scheduleId },
    include: {
      cleaner: {
        select: { id: true, name: true, avatarColor: true, hourlyRate: true },
      },
    },
    orderBy: { totalAmount: "desc" },
  });

  // Calculate grand total
  const grandTotal = payments.reduce(
    (sum, p) => sum + Number(p.totalAmount),
    0
  );

  return successResponse({
    scheduleId,
    weekStart: schedule.weekStart,
    payments,
    grandTotal,
  });
}

/**
 * POST: Generate payment summaries for all cleaners in a week
 */
export async function POST(req: Request, { params }: Params) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const { scheduleId } = await params;

  // Verify schedule ownership
  const schedule = await db.weeklySchedule.findFirst({
    where: { id: scheduleId, userId },
  });
  if (!schedule) {
    return errorResponse("Schedule not found", 404);
  }

  // Get week date range from the schedule
  const weekStart = schedule.weekStart;
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Get all completed/scheduled jobs grouped by cleaner
  const [jobs, absences] = await Promise.all([
    db.job.findMany({
      where: {
        scheduleId,
        cleanerId: { not: null },
        status: { in: ["COMPLETED", "SCHEDULED"] },
      },
      select: {
        cleanerId: true,
        hoursWorked: true,
        hourlyRate: true,
        cost: true,
      },
    }),
    db.absence.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
      select: { cleanerId: true },
    }),
  ]);

  // Count absences per cleaner
  const absenceCount = new Map<string, number>();
  for (const a of absences) {
    absenceCount.set(a.cleanerId, (absenceCount.get(a.cleanerId) ?? 0) + 1);
  }

  // Group jobs by cleaner
  const cleanerMap = new Map<
    string,
    { totalHours: number; totalAmount: number; totalJobs: number }
  >();

  for (const job of jobs) {
    if (!job.cleanerId) continue;
    const existing = cleanerMap.get(job.cleanerId) ?? {
      totalHours: 0,
      totalAmount: 0,
      totalJobs: 0,
    };
    existing.totalHours += Number(job.hoursWorked ?? 0);
    existing.totalAmount += Number(job.cost ?? 0);
    existing.totalJobs += 1;
    cleanerMap.set(job.cleanerId, existing);
  }

  // Upsert payment summaries
  const results = [];
  for (const [cleanerId, data] of cleanerMap) {
    const payment = await db.paymentSummary.upsert({
      where: {
        scheduleId_cleanerId: { scheduleId, cleanerId },
      },
      update: {
        totalHours: data.totalHours,
        totalAmount: data.totalAmount,
        totalJobs: data.totalJobs,
        totalAbsences: absenceCount.get(cleanerId) ?? 0,
      },
      create: {
        userId,
        scheduleId,
        cleanerId,
        totalHours: data.totalHours,
        totalAmount: data.totalAmount,
        totalJobs: data.totalJobs,
        totalAbsences: absenceCount.get(cleanerId) ?? 0,
        status: "PENDING",
      },
      include: {
        cleaner: { select: { id: true, name: true, avatarColor: true } },
      },
    });
    results.push(payment);
  }

  return successResponse(results, 201);
}
