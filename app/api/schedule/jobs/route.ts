import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { jobSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const scheduleId = searchParams.get("scheduleId");
  const cleanerId = searchParams.get("cleanerId");
  const clientId = searchParams.get("clientId");
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  if (!scheduleId && !cleanerId && !date) {
    return errorResponse("Provide at least scheduleId, cleanerId, or date");
  }

  const where: any = {};

  if (scheduleId) {
    // Verify schedule ownership
    const schedule = await db.weeklySchedule.findFirst({
      where: { id: scheduleId, userId },
    });
    if (!schedule) return errorResponse("Schedule not found", 404);
    where.scheduleId = scheduleId;
  } else {
    // Filter by user's schedules
    where.schedule = { userId };
  }

  if (cleanerId) where.cleanerId = cleanerId;
  if (clientId) where.clientId = clientId;
  if (date) where.date = new Date(date + "T00:00:00.000Z");
  if (status) where.status = status;

  const jobs = await db.job.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: {
      cleaner: { select: { id: true, name: true, avatarColor: true } },
      client: { select: { id: true, name: true, address: true } },
    },
  });

  return successResponse(jobs);
}

export async function POST(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  // Verify schedule ownership
  const schedule = await db.weeklySchedule.findFirst({
    where: { id: parsed.data.scheduleId, userId },
  });
  if (!schedule) {
    return errorResponse("Schedule not found", 404);
  }

  // Verify cleaner ownership (if provided)
  if (parsed.data.cleanerId) {
    const cleaner = await db.cleaner.findFirst({
      where: { id: parsed.data.cleanerId, userId },
    });
    if (!cleaner) return errorResponse("Cleaner not found", 404);
  }

  // Verify client ownership
  const client = await db.client.findFirst({
    where: { id: parsed.data.clientId, userId },
  });
  if (!client) return errorResponse("Client not found", 404);

  // Check for time conflicts (same cleaner, same day, overlapping hours)
  if (parsed.data.cleanerId) {
    const jobDate = typeof parsed.data.date === "string"
      ? new Date(parsed.data.date + (parsed.data.date.includes("T") ? "" : "T00:00:00.000Z"))
      : parsed.data.date;

    const existingJobs = await db.job.findMany({
      where: {
        cleanerId: parsed.data.cleanerId,
        date: jobDate,
        schedule: { userId },
        status: { notIn: ["CANCELLED"] },
      },
      select: { startTime: true, endTime: true, client: { select: { name: true } } },
    });

    const newStart = parsed.data.startTime;
    const newEnd = parsed.data.endTime;
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const newStartMin = toMin(newStart);
    const newEndMin = toMin(newEnd);

    for (const ej of existingJobs) {
      const ejStartMin = toMin(ej.startTime);
      const ejEndMin = toMin(ej.endTime);
      if (newStartMin < ejEndMin && newEndMin > ejStartMin) {
        return errorResponse(
          `Conflito de horário: esta colaboradora já tem um serviço em ${ej.client.name} das ${ej.startTime} às ${ej.endTime} neste dia. | Time conflict: this cleaner already has a service at ${ej.client.name} from ${ej.startTime} to ${ej.endTime} on this day.`,
          409
        );
      }
    }
  }

  // Calculate cost from service price
  let cost = 0;
  let hourlyRate = 0;
  const serviceType = (parsed.data as any).serviceType || "standard";
  const servicePrice = await db.servicePrice.findUnique({
    where: { userId_serviceType: { userId, serviceType } },
  });
  if (servicePrice) {
    // Use the stored price directly (not hourly-based)
    cost = Number(servicePrice.priceBRL);
    // Store effective hourly for backward compat: cost / hours
    const [sh, sm] = parsed.data.startTime.split(":").map(Number);
    const [eh, em] = parsed.data.endTime.split(":").map(Number);
    const hours = Math.max(eh + em / 60 - (sh + sm / 60), 0.5);
    hourlyRate = cost / hours;
  } else if (parsed.data.cleanerId) {
    // Fallback to cleaner hourly rate if no service price exists
    const cleaner = await db.cleaner.findUnique({
      where: { id: parsed.data.cleanerId },
      select: { hourlyRate: true },
    });
    if (cleaner) {
      hourlyRate = Number(cleaner.hourlyRate);
      const [sh, sm] = parsed.data.startTime.split(":").map(Number);
      const [eh, em] = parsed.data.endTime.split(":").map(Number);
      const hours = eh + em / 60 - (sh + sm / 60);
      cost = hourlyRate * hours;
    }
  }

  const jobDate = typeof parsed.data.date === "string"
    ? new Date(parsed.data.date + (parsed.data.date.includes("T") ? "" : "T00:00:00.000Z"))
    : parsed.data.date;

  const job = await db.job.create({
    data: {
      scheduleId: parsed.data.scheduleId,
      cleanerId: parsed.data.cleanerId ?? null,
      clientId: parsed.data.clientId,
      date: jobDate,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      status: parsed.data.status ?? (parsed.data.cleanerId ? "SCHEDULED" : "UNCOVERED"),
      notes: parsed.data.notes ?? null,
      hoursWorked: cost > 0 ? cost / hourlyRate : 0,
      hourlyRate,
      cost,
    },
    include: {
      cleaner: { select: { id: true, name: true, avatarColor: true } },
      client: { select: { id: true, name: true } },
    },
  });

  return successResponse(job, 201);
}
