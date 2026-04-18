import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // In production (Vercel), use the Neon serverless adapter (no binary engine needed)
  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
    return new PrismaClient({
      adapter,
      log: ["error"],
    } as any);
  }

  // In development, use the standard Prisma client with binary engine
  return new PrismaClient({
    log: ["query", "error", "warn"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
