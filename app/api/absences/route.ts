import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { absenceSchema } from "@/lib/validations";
import { registerAbsence } from "@/lib/db/helpers";
import { z } from "zod";

export async function GET(req: Request) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const cleanerId = searchParams.get("cleanerId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const covered = searchParams.get("covered");

  const where: any = { userId };
  if (cleanerId) where.cleanerId = cleanerId;
  if (covered === "true") where.covered = true;
  if (covered === "false") where.covered = false;

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from + "T00:00:00.000Z");
    if (to) where.date.lte = new Date(to + "T00:00:00.000Z");
  }

  const absences = await db.absence.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      cleaner: { select: { id: true, name: true, avatarColor: true } },
      coveredBy: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  return successResponse(absences);
}

export async function POST(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = absenceSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  // Verify cleaner ownership
  const cleaner = await db.cleaner.findFirst({
    where: { id: parsed.data.cleanerId, userId },
  });
  if (!cleaner) {
    return errorResponse("Cleaner not found", 404);
  }

  const absenceDate = typeof parsed.data.date === "string"
    ? new Date(parsed.data.date + (parsed.data.date.includes("T") ? "" : "T00:00:00.000Z"))
    : parsed.data.date;

  // Check for duplicate absence
  const duplicate = await db.absence.findFirst({
    where: {
      cleanerId: parsed.data.cleanerId,
      date: absenceDate,
    },
  });
  if (duplicate) {
    return errorResponse("Absence already registered for this cleaner on this date", 409);
  }

  await registerAbsence(
    parsed.data.cleanerId,
    absenceDate,
    userId,
    parsed.data.reason ?? undefined
  );

  // Return created absence with related data
  const absence = await db.absence.findFirst({
    where: {
      cleanerId: parsed.data.cleanerId,
      date: absenceDate,
      userId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      cleaner: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  return successResponse(absence, 201);
}

// Cover an absence with a replacement cleaner
const coverSchema = z.object({
  absenceId: z.string().min(1),
  coveredById: z.string().min(1),
});

export async function PUT(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = coverSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  // Verify absence ownership
  const absence = await db.absence.findFirst({
    where: { id: parsed.data.absenceId, userId },
  });
  if (!absence) {
    return errorResponse("Absence not found", 404);
  }

  // Verify cover cleaner ownership
  const coverCleaner = await db.cleaner.findFirst({
    where: { id: parsed.data.coveredById, userId, status: "ACTIVE" },
  });
  if (!coverCleaner) {
    return errorResponse("Cover cleaner not found or inactive", 404);
  }

  // Update absence
  const updated = await db.absence.update({
    where: { id: parsed.data.absenceId },
    data: {
      covered: true,
      coveredById: parsed.data.coveredById,
    },
    include: {
      cleaner: { select: { id: true, name: true } },
      coveredBy: { select: { id: true, name: true } },
    },
  });

  // Reassign affected jobs from ABSENT to SCHEDULED with new cleaner
  await db.job.updateMany({
    where: {
      cleanerId: absence.cleanerId,
      date: absence.date,
      status: "ABSENT",
    },
    data: {
      cleanerId: parsed.data.coveredById,
      status: "SCHEDULED",
      hourlyRate: Number(coverCleaner.hourlyRate),
    },
  });

  return successResponse(updated);
}
