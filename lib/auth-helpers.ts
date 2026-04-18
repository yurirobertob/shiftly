import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Get the authenticated user ID or return an error response.
 * Usage: const [userId, errorRes] = await getAuthUserId();
 *        if (errorRes) return errorRes;
 */
export async function getAuthUserId(): Promise<
  [string, null] | [null, NextResponse]
> {
  const session = await auth();

  if (!session?.user?.id) {
    return [
      null,
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    ];
  }

  return [session.user.id, null];
}

/**
 * Standard JSON error response helper.
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard JSON success response helper.
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Parse JSON body with error handling.
 */
export async function parseBody<T = any>(req: Request): Promise<[T, null] | [null, NextResponse]> {
  try {
    const body = await req.json();
    return [body as T, null];
  } catch {
    return [null, errorResponse("Invalid JSON body")];
  }
}
