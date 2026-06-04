import { getAuthUserId, errorResponse, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET() {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  const userAchievements = await db.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: {
        select: {
          slug: true,
          title: true,
          description: true,
          category: true,
          xpReward: true,
          icon: true,
        },
      },
    },
    orderBy: { unlockedAt: "desc" },
  });

  return successResponse(userAchievements);
}
