import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { z } from "zod";

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { id } = await params;

  const template = await db.scheduleTemplate.findFirst({
    where: { id, userId },
    include: {
      slots: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        include: {
          cleaner: { select: { id: true, name: true, avatarColor: true } },
          client: { select: { id: true, name: true, address: true } },
        },
      },
    },
  });

  if (!template) {
    return errorResponse("Template not found", 404);
  }

  return successResponse(template);
}

export async function PUT(req: Request, { params }: Params) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const { id } = await params;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = updateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  const existing = await db.scheduleTemplate.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return errorResponse("Template not found", 404);
  }

  // If setting as active, deactivate others
  if (parsed.data.isActive) {
    await db.scheduleTemplate.updateMany({
      where: { userId, isActive: true, id: { not: id } },
      data: { isActive: false },
    });
  }

  const template = await db.scheduleTemplate.update({
    where: { id },
    data: parsed.data,
  });

  return successResponse(template);
}

export async function DELETE(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { id } = await params;

  const existing = await db.scheduleTemplate.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return errorResponse("Template not found", 404);
  }

  // Delete slots first, then template
  await db.templateSlot.deleteMany({ where: { templateId: id } });
  await db.scheduleTemplate.delete({ where: { id } });

  return successResponse({ deleted: true });
}
