import { getAuthUserId, errorResponse, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET() {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  });

  if (user?.onboardingCompleted) {
    return successResponse({ completed: true });
  }

  // Auto-complete for users who already have data (migrated accounts / existing users)
  const [cleanerCount, clientCount] = await Promise.all([
    db.cleaner.count({ where: { userId, status: { not: "INACTIVE" } } }),
    db.client.count({ where: { userId, status: "ACTIVE" } }),
  ]);

  if (cleanerCount > 0 || clientCount > 0) {
    await db.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });
    return successResponse({ completed: true });
  }

  return successResponse({ completed: false });
}

export async function POST() {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  await db.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
  });

  return successResponse({ completed: true });
}
