import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    authSecret: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    authUrl: Boolean(process.env.AUTH_URL),
    nodeEnv: process.env.NODE_ENV ?? "unset",
    database: false as boolean | string,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    checks.database = err instanceof Error ? err.message : "connection failed";
  }

  const ok =
    checks.authSecret &&
    checks.databaseUrl &&
    checks.database === true;

  return Response.json(
    {
      status: ok ? "ok" : "misconfigured",
      time: new Date().toISOString(),
      checks,
    },
    { status: ok ? 200 : 503 },
  );
}
