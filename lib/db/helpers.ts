import { db } from "@/lib/db";
import { JobStatus, WeekStatus } from "@prisma/client";

/**
 * Generate a week of jobs from a schedule template.
 * Creates a WeeklySchedule if it doesn't exist, then copies all
 * template slots into concrete Job records for that week.
 */
export async function generateWeekFromTemplate(
  userId: string,
  weekStart: Date,
  templateId: string
): Promise<string> {
  // 1. Upsert weekly schedule
  const schedule = await db.weeklySchedule.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    update: {},
    create: {
      userId,
      weekStart,
      status: WeekStatus.DRAFT,
    },
  });

  // 2. Fetch template slots
  const slots = await db.templateSlot.findMany({
    where: { templateId },
    include: { cleaner: { select: { hourlyRate: true } } },
  });

  // 3. Create jobs from slots
  const jobs = slots.map((slot) => {
    const jobDate = new Date(weekStart);
    jobDate.setDate(jobDate.getDate() + slot.dayOfWeek);

    // Calculate hours from start/end time strings
    const [sh, sm] = slot.startTime.split(":").map(Number);
    const [eh, em] = slot.endTime.split(":").map(Number);
    const hours = eh + em / 60 - (sh + sm / 60);

    return {
      scheduleId: schedule.id,
      cleanerId: slot.cleanerId,
      clientId: slot.clientId,
      date: jobDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: JobStatus.SCHEDULED,
      hoursWorked: hours,
      hourlyRate: slot.cleaner.hourlyRate,
      cost: Number(slot.cleaner.hourlyRate) * hours,
      createdFromTemplate: true,
    };
  });

  await db.job.createMany({ data: jobs });

  // 4. Recalculate totals
  await recalculateWeekTotals(schedule.id);

  return schedule.id;
}

/**
 * Recalculate cached totals on a weekly schedule from its jobs.
 */
export async function recalculateWeekTotals(
  scheduleId: string
): Promise<{ totalCost: number; totalJobs: number; totalAbsences: number }> {
  const jobs = await db.job.findMany({
    where: { scheduleId },
    select: { status: true, cost: true },
  });

  const totalJobs = jobs.length;
  const totalAbsences = jobs.filter(
    (j) => j.status === JobStatus.ABSENT || j.status === JobStatus.UNCOVERED
  ).length;
  const totalCost = jobs
    .filter((j) => j.status === JobStatus.COMPLETED || j.status === JobStatus.SCHEDULED)
    .reduce((sum, j) => sum + Number(j.cost ?? 0), 0);

  await db.weeklySchedule.update({
    where: { id: scheduleId },
    data: { totalCost, totalJobs, totalAbsences },
  });

  return { totalCost, totalJobs, totalAbsences };
}

/**
 * Register an absence for a cleaner on a given date.
 * Marks all their jobs on that date as ABSENT and records
 * how many jobs were affected.
 */
export async function registerAbsence(
  cleanerId: string,
  date: Date,
  userId: string,
  reason?: string
): Promise<void> {
  // 1. Mark jobs as absent
  const result = await db.job.updateMany({
    where: {
      cleanerId,
      date,
      status: JobStatus.SCHEDULED,
    },
    data: { status: JobStatus.ABSENT },
  });

  // 2. Create absence record
  await db.absence.create({
    data: {
      cleanerId,
      userId,
      date,
      reason,
      jobsAffected: result.count,
      covered: false,
    },
  });
}

/**
 * Check whether the user can add another cleaner
 * based on their subscription plan limit.
 */
export async function canAddCleaner(userId: string): Promise<boolean> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { maxCleaners: true },
  });

  // Default to basic plan limit if no subscription
  const maxCleaners = subscription?.maxCleaners ?? 5;

  const currentCount = await db.cleaner.count({
    where: {
      userId,
      status: { not: "INACTIVE" },
    },
  });

  return currentCount < maxCleaners;
}
