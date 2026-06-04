import { parseDatabaseUrlSafe, resolveDatabaseUrl, validateDatabaseUrlFormat } from "@/lib/database-url";

export const dynamic = "force-dynamic";

function mysqlUserHint(user?: string, database?: string): string | undefined {
  if (!user) return undefined;
  if (user === database) {
    return "ERREUR : l'utilisateur MySQL ne doit pas être le nom de la base. Utilisez u835607784_IGlionel (pas bookflow).";
  }
  if (user.includes("bookflow") && !user.includes("IGlionel") && !user.includes("lionel")) {
    return "L'utilisateur ressemble au nom de la base — vérifiez DB_USER dans hPanel.";
  }
  return undefined;
}

export async function GET() {
  const { url, source } = resolveDatabaseUrl();
  if (url) {
    process.env.DATABASE_URL = url;
  }

  const parsed = parseDatabaseUrlSafe(url);
  const dbFormat = url ? validateDatabaseUrlFormat(url) : "DATABASE_URL / DB_* manquant";

  const checks: Record<string, boolean | string> = {
    authSecret: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
    databaseUrl: Boolean(url),
    databaseUrlSource: source,
    mysqlUser: parsed?.user ?? "non défini",
    mysqlHost: parsed?.host ?? "non défini",
    mysqlDatabase: parsed?.database ?? "non défini",
    databaseUrlFormat: dbFormat === true ? true : dbFormat,
    authUrl: Boolean(process.env.AUTH_URL),
    nodeEnv: process.env.NODE_ENV ?? "unset",
    database: false,
  };

  const hint = mysqlUserHint(parsed?.user, parsed?.database);
  if (hint) checks.mysqlUserHint = hint;

  if (dbFormat !== true) {
    return Response.json({
      status: "degraded",
      time: new Date().toISOString(),
      checks,
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "connection failed";
    if (msg.includes("invalid port number") || msg.includes("invalid database string")) {
      checks.database =
        "DATABASE_URL invalide — format attendu : mysql://USER:MDP@localhost:3306/NOM_BASE (le @localhost:3306 est obligatoire)";
    } else if (msg.includes("PANIC") || msg.includes("timer has gone away") || msg.includes("openssl-1.1")) {
      checks.database =
        "Moteur Prisma incompatible (OpenSSL Hostinger). Redeploy après le dernier commit Git (fix binaryTargets).";
    } else if (msg.includes("Authentication failed")) {
      checks.database =
        "Mot de passe ou utilisateur MySQL incorrect. Réinitialisez le mot de passe dans hPanel, mettez DB_* (voir docs/HOSTINGER-FIX.md), supprimez DATABASE_URL, Restart.";
    } else {
      checks.database = msg;
    }
  }

  const ok =
    checks.authSecret === true &&
    checks.databaseUrl === true &&
    checks.databaseUrlFormat === true &&
    checks.database === true;

  return Response.json({
    status: ok ? "ok" : "degraded",
    time: new Date().toISOString(),
    checks,
  });
}
