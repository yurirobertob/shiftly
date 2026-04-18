import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ scheduleId: string; cleanerId: string }> };

/**
 * GET: Get a specific cleaner's payment summary for a week
 */
export async function GET(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { scheduleId, cleanerId } = await params;

  // Verify schedule ownership
  const schedule = await db.weeklySchedule.findFirst({
    where: { id: scheduleId, userId },
  });
  if (!schedule) return errorResponse("Schedule not found", 404);

  const payment = await db.paymentSummary.findUnique({
    where: {
      scheduleId_cleanerId: { scheduleId, cleanerId },
    },
    include: {
      cleaner: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  if (!payment) {
    return errorResponse("Payment summary not found", 404);
  }

  // Also fetch the individual jobs for breakdown
  const jobs = await db.job.findMany({
    where: {
      scheduleId,
      cleanerId,
      status: { in: ["COMPLETED", "SCHEDULED"] },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  return successResponse({ ...payment, jobs });
}

const updatePaymentSchema = z.object({
  status: z.enum(["PENDING", "PAID"]),
  paidAt: z.string().optional(),
});

/**
 * PUT: Update payment status (mark as paid)
 */
export async function PUT(req: Request, { params }: Params) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const { scheduleId, cleanerId } = await params;

  // Verify schedule ownership
  const schedule = await db.weeklySchedule.findFirst({
    where: { id: scheduleId, userId },
  });
  if (!schedule) return errorResponse("Schedule not found", 404);

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = updatePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  const payment = await db.paymentSummary.update({
    where: {
      scheduleId_cleanerId: { scheduleId, cleanerId },
    },
    data: {
      status: parsed.data.status,
      paidAt: parsed.data.status === "PAID"
        ? (parsed.data.paidAt ? new Date(parsed.data.paidAt) : new Date())
        : null,
    },
    include: {
      cleaner: { select: { id: true, name: true } },
    },
  });

  return successResponse(payment);
}
