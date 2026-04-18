import { getAuthUserId, errorResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

/**
 * POST: Generate a CSV export of payment summaries for a week.
 * Body: { scheduleId: string }
 * Returns: CSV file download
 */
export async function POST(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const { scheduleId } = body;
  if (!scheduleId) {
    return errorResponse("scheduleId is required");
  }

  // Verify schedule ownership
  const schedule = await db.weeklySchedule.findFirst({
    where: { id: scheduleId, userId },
    select: { id: true, weekStart: true },
  });
  if (!schedule) {
    return errorResponse("Schedule not found", 404);
  }

  // Fetch payment summaries
  const payments = await db.paymentSummary.findMany({
    where: { scheduleId },
    include: {
      cleaner: { select: { name: true, email: true } },
    },
    orderBy: { totalAmount: "desc" },
  });

  // Fetch jobs for detailed breakdown
  const jobs = await db.job.findMany({
    where: {
      scheduleId,
      cleanerId: { not: null },
      status: { in: ["COMPLETED", "SCHEDULED"] },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: {
      cleaner: { select: { name: true } },
      client: { select: { name: true } },
    },
  });

  const weekStr = schedule.weekStart.toISOString().split("T")[0];

  // Build CSV
  const lines: string[] = [];

  // Summary section
  lines.push("PAYMENT REPORT");
  lines.push(`Week Starting: ${weekStr}`);
  lines.push("");
  lines.push("SUMMARY");
  lines.push("Cleaner,Email,Jobs,Hours,Amount,Status");

  let grandTotal = 0;
  for (const p of payments) {
    const amount = Number(p.totalAmount);
    grandTotal += amount;
    lines.push(
      [
        `"${p.cleaner.name}"`,
        `"${p.cleaner.email ?? ""}"`,
        p.totalJobs,
        Number(p.totalHours).toFixed(1),
        amount.toFixed(2),
        p.status,
      ].join(",")
    );
  }
  lines.push(`,,,,${grandTotal.toFixed(2)},TOTAL`);

  // Detail section
  lines.push("");
  lines.push("DETAIL");
  lines.push("Date,Cleaner,Client,Start,End,Hours,Rate,Cost");

  for (const j of jobs) {
    const [sh, sm] = j.startTime.split(":").map(Number);
    const [eh, em] = j.endTime.split(":").map(Number);
    const hours = eh + em / 60 - (sh + sm / 60);
    lines.push(
      [
        j.date.toISOString().split("T")[0],
        `"${j.cleaner?.name ?? "Unassigned"}"`,
        `"${j.client.name}"`,
        j.startTime,
        j.endTime,
        hours.toFixed(1),
        Number(j.hourlyRate).toFixed(2),
        Number(j.cost).toFixed(2),
      ].join(",")
    );
  }

  const csv = lines.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shiftsly-payments-${weekStr}.csv"`,
    },
  });
}
