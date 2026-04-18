import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: Request) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const templates = await db.scheduleTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { slots: true } },
    },
  });

  return successResponse(templates);
}

export async function POST(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  // If setting as active, deactivate others
  if (parsed.data.isActive) {
    await db.scheduleTemplate.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }

  const template = await db.scheduleTemplate.create({
    data: {
      ...parsed.data,
      userId,
    },
  });

  return successResponse(template, 201);
}
