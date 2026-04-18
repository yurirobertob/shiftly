import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { cleanerSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { id } = await params;

  const cleaner = await db.cleaner.findFirst({
    where: { id, userId },
    include: {
      rates: { orderBy: { effectiveFrom: "desc" } },
      jobs: {
        take: 20,
        orderBy: { date: "desc" },
        include: { client: { select: { name: true } } },
      },
      absences: {
        take: 10,
        orderBy: { date: "desc" },
      },
    },
  });

  if (!cleaner) {
    return errorResponse("Cleaner not found", 404);
  }

  return successResponse(cleaner);
}

export async function PUT(req: Request, { params }: Params) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const { id } = await params;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = cleanerSchema.partial().safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  // Verify ownership
  const existing = await db.cleaner.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return errorResponse("Cleaner not found", 404);
  }

  // If hourly rate changed, create rate history entry
  if (
    parsed.data.hourlyRate !== undefined &&
    Number(parsed.data.hourlyRate) !== Number(existing.hourlyRate)
  ) {
    await db.cleanerRate.create({
      data: {
        cleanerId: id,
        hourlyRate: parsed.data.hourlyRate,
        effectiveFrom: new Date(),
      },
    });
  }

  const cleaner = await db.cleaner.update({
    where: { id },
    data: parsed.data,
  });

  return successResponse(cleaner);
}

export async function DELETE(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { id } = await params;

  const existing = await db.cleaner.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return errorResponse("Cleaner not found", 404);
  }

  // Soft delete: set to INACTIVE instead of deleting
  const cleaner = await db.cleaner.update({
    where: { id },
    data: { status: "INACTIVE" },
  });

  return successResponse(cleaner);
}
