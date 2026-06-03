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
    const msg = err instanceof Error ? err.message : "connection failed";
    if (msg.includes("invalid port number") || msg.includes("invalid database string")) {
      checks.database =
        "DATABASE_URL invalide — format attendu : mysql://USER:MDP@localhost:3306/NOM_BASE (le @localhost:3306 est obligatoire)";
    } else if (msg.includes("Authentication failed")) {
      checks.database =
        "Mot de passe MySQL incorrect — vérifiez DATABASE_URL (utilisez %21 pour ! et localhost sur Hostinger)";
    } else {
      checks.database = msg;
    }
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
