import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { templateSlotSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: Request) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("templateId");

  if (!templateId) {
    return errorResponse("templateId query parameter is required");
  }

  // Verify template ownership
  const template = await db.scheduleTemplate.findFirst({
    where: { id: templateId, userId },
  });
  if (!template) {
    return errorResponse("Template not found", 404);
  }

  const slots = await db.templateSlot.findMany({
    where: { templateId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    include: {
      cleaner: { select: { id: true, name: true, avatarColor: true, hourlyRate: true } },
      client: { select: { id: true, name: true, address: true } },
    },
  });

  return successResponse(slots);
}

export async function POST(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  // Support both single slot and batch creation
  const isBatch = Array.isArray(body);
  const items = isBatch ? body : [body];

  const validatedSlots: z.infer<typeof templateSlotSchema>[] = [];

  for (const item of items) {
    const parsed = templateSlotSchema.safeParse(item);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }
    validatedSlots.push(parsed.data);
  }

  // Verify template ownership
  const templateIds = [...new Set(validatedSlots.map((s) => s.templateId))];
  for (const tid of templateIds) {
    const template = await db.scheduleTemplate.findFirst({
      where: { id: tid, userId },
    });
    if (!template) {
      return errorResponse(`Template ${tid} not found`, 404);
    }
  }

  // Verify cleaners and clients belong to user
  const cleanerIds = [...new Set(validatedSlots.map((s) => s.cleanerId))];
  const clientIds = [...new Set(validatedSlots.map((s) => s.clientId))];

  const cleanerCount = await db.cleaner.count({
    where: { id: { in: cleanerIds }, userId },
  });
  if (cleanerCount !== cleanerIds.length) {
    return errorResponse("One or more cleaners not found", 404);
  }

  const clientCount = await db.client.count({
    where: { id: { in: clientIds }, userId },
  });
  if (clientCount !== clientIds.length) {
    return errorResponse("One or more clients not found", 404);
  }

  if (isBatch) {
    const created = await db.templateSlot.createMany({ data: validatedSlots });
    return successResponse({ count: created.count }, 201);
  } else {
    const slot = await db.templateSlot.create({
      data: validatedSlots[0],
      include: {
        cleaner: { select: { id: true, name: true, avatarColor: true } },
        client: { select: { id: true, name: true } },
      },
    });
    return successResponse(slot, 201);
  }
}

export async function DELETE(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const slotId = searchParams.get("id");
  const templateId = searchParams.get("templateId");

  if (slotId) {
    // Delete a single slot (verify ownership via template)
    const slot = await db.templateSlot.findUnique({
      where: { id: slotId },
      include: { template: { select: { userId: true } } },
    });
    if (!slot || slot.template.userId !== userId) {
      return errorResponse("Slot not found", 404);
    }
    await db.templateSlot.delete({ where: { id: slotId } });
    return successResponse({ deleted: true });
  }

  if (templateId) {
    // Delete all slots for a template
    const template = await db.scheduleTemplate.findFirst({
      where: { id: templateId, userId },
    });
    if (!template) {
      return errorResponse("Template not found", 404);
    }
    const result = await db.templateSlot.deleteMany({ where: { templateId } });
    return successResponse({ deleted: result.count });
  }

  return errorResponse("Provide id or templateId query parameter");
}
