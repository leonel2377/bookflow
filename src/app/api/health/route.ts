export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, boolean | string> = {
    authSecret: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    authUrl: Boolean(process.env.AUTH_URL),
    nodeEnv: process.env.NODE_ENV ?? "unset",
    database: false,
  };

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    checks.database = err instanceof Error ? err.message : "connection failed";
  }

  const ok =
    checks.authSecret === true &&
    checks.databaseUrl === true &&
    checks.database === true;

  // Toujours HTTP 200 — évite que Hostinger considère l'app comme down
  return Response.json({
    status: ok ? "ok" : "degraded",
    time: new Date().toISOString(),
    checks,
  });
}
