import { getAuthUserId, errorResponse, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const scheduleId = searchParams.get("scheduleId");
  const cleanerId = searchParams.get("cleanerId");
  const status = searchParams.get("status");

  const where: any = {};

  if (scheduleId) {
    // Verify schedule ownership
    const schedule = await db.weeklySchedule.findFirst({
      where: { id: scheduleId, userId },
    });
    if (!schedule) return errorResponse("Schedule not found", 404);
    where.scheduleId = scheduleId;
  } else {
    where.schedule = { userId };
  }

  if (cleanerId) where.cleanerId = cleanerId;
  if (status) where.status = status;

  const payments = await db.paymentSummary.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      cleaner: { select: { id: true, name: true, avatarColor: true } },
      schedule: { select: { id: true, weekStart: true } },
    },
  });

  return successResponse(payments);
}
