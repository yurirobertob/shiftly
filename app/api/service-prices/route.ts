import { getAuthUserId, errorResponse, parseBody, successResponse } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

// Default prices per service type
const DEFAULTS: Record<string, { priceBRL: number; priceUSD: number; priceGBP: number; priceEUR: number }> = {
  standard:          { priceBRL: 30, priceUSD: 10, priceGBP: 10, priceEUR: 10 },
  deep:              { priceBRL: 50, priceUSD: 15, priceGBP: 15, priceEUR: 15 },
  "post-construction": { priceBRL: 40, priceUSD: 13, priceGBP: 13, priceEUR: 13 },
  airbnb:            { priceBRL: 60, priceUSD: 18, priceGBP: 18, priceEUR: 18 },
  other:             { priceBRL: 30, priceUSD: 10, priceGBP: 10, priceEUR: 10 },
};

export async function GET() {
  const [userId, err] = await getAuthUserId();
  if (err) return err;

  let prices = await db.servicePrice.findMany({
    where: { userId },
    orderBy: { serviceType: "asc" },
  });

  // If no prices exist, seed defaults
  if (prices.length === 0) {
    const entries = Object.entries(DEFAULTS).map(([serviceType, vals]) => ({
      userId,
      serviceType,
      ...vals,
    }));
    await db.servicePrice.createMany({ data: entries });
    prices = await db.servicePrice.findMany({
      where: { userId },
      orderBy: { serviceType: "asc" },
    });
  }

  return successResponse(prices);
}

export async function PUT(req: Request) {
  const [userId, authErr] = await getAuthUserId();
  if (authErr) return authErr;

  const [body, parseErr] = await parseBody(req);
  if (parseErr) return parseErr;

  // body = { prices: [{ serviceType, priceBRL, priceUSD, priceGBP, priceEUR }] }
  const { prices } = body as { prices: Array<{ serviceType: string; priceBRL: number; priceUSD: number; priceGBP: number; priceEUR: number }> };

  if (!prices || !Array.isArray(prices)) {
    return errorResponse("Invalid request: expected prices array");
  }

  const results = await Promise.all(
    prices.map((p) =>
      db.servicePrice.upsert({
        where: { userId_serviceType: { userId, serviceType: p.serviceType } },
        create: {
          userId,
          serviceType: p.serviceType,
          priceBRL: p.priceBRL,
          priceUSD: p.priceUSD,
          priceGBP: p.priceGBP,
          priceEUR: p.priceEUR,
        },
        update: {
          priceBRL: p.priceBRL,
          priceUSD: p.priceUSD,
          priceGBP: p.priceGBP,
          priceEUR: p.priceEUR,
        },
      })
    )
  );

  return successResponse(results);
}
