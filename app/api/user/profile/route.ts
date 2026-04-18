import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId, errorResponse, successResponse, parseBody } from "@/lib/auth-helpers";

export async function GET() {
  const [userId, errorRes] = await getAuthUserId();
  if (errorRes) return errorRes;

  const user = await db.user.findUnique({
    where: { id: userId! },
    select: { id: true, name: true, email: true, image: true, phone: true, address: true, company: true, role: true },
  });

  return successResponse(user);
}

export async function PUT(req: Request) {
  const [userId, errorRes] = await getAuthUserId();
  if (errorRes) return errorRes;

  const [body, parseError] = await parseBody(req);
  if (parseError) return parseError;

  const { name, phone, address, company, role } = body;

  const updated = await db.user.update({
    where: { id: userId! },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(company !== undefined && { company }),
      ...(role !== undefined && { role }),
    },
    select: { id: true, name: true, email: true, image: true, phone: true, address: true, company: true, role: true },
  });

  return successResponse(updated);
}
