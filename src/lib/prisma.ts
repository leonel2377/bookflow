import { PrismaClient } from "@prisma/client";
import { cleanDatabaseUrl } from "@/lib/database-url";

const databaseUrl = cleanDatabaseUrl(process.env.DATABASE_URL);
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
