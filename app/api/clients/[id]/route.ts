import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { clientSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { id } = await params;

  const client = await db.client.findFirst({
    where: { id, userId },
    include: {
      jobs: {
        take: 20,
        orderBy: { date: "desc" },
        include: { cleaner: { select: { name: true } } },
      },
    },
  });

  if (!client) {
    return errorResponse("Client not found", 404);
  }

  return successResponse(client);
}

export async function PUT(req: Request, { params }: Params) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const { id } = await params;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  const parsed = clientSchema.partial().safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message);
  }

  const existing = await db.client.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return errorResponse("Client not found", 404);
  }

  const client = await db.client.update({
    where: { id },
    data: parsed.data,
  });

  return successResponse(client);
}

export async function DELETE(req: Request, { params }: Params) {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const { id } = await params;

  const existing = await db.client.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return errorResponse("Client not found", 404);
  }

  // Soft delete
  const client = await db.client.update({
    where: { id },
    data: { status: "INACTIVE" },
  });

  return successResponse(client);
}
