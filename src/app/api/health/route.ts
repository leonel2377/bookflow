import {
  buildDatabaseUrl,
  cleanEnvValue,
  databaseHostsToTry,
  parseDatabaseUrlSafe,
  resolveDatabaseUrl,
  validateDatabaseUrlFormat,
} from "@/lib/database-url";
import { getSmtpHealthChecks } from "@/lib/smtp-config";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

async function tryMysqlConnection(url: string): Promise<void> {
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: [],
  });
  try {
    await client.$queryRaw`SELECT 1`;
  } finally {
    await client.$disconnect();
  }
}

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
  const { url, source, host: preferredHost } = resolveDatabaseUrl();
  const user = cleanEnvValue(process.env.DB_USER);
  const password = cleanEnvValue(process.env.DB_PASSWORD);
  const name = cleanEnvValue(process.env.DB_NAME);
  const port = cleanEnvValue(process.env.DB_PORT) ?? "3306";

  if (url) {
    process.env.DATABASE_URL = url;
  }

  const parsed = parseDatabaseUrlSafe(url);
  const dbFormat = url ? validateDatabaseUrlFormat(url) : "DATABASE_URL / DB_* manquant";

  const checks: Record<string, boolean | string | string[] | number> = {
    authSecret: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
    databaseUrl: Boolean(url),
    databaseUrlSource: source,
    mysqlUser: parsed?.user ?? "non défini",
    mysqlHost: parsed?.host ?? "non défini",
    mysqlDatabase: parsed?.database ?? "non défini",
    dbPasswordLength: password?.length ?? 0,
    databaseUrlFormat: dbFormat === true ? true : dbFormat,
    authUrl: Boolean(process.env.AUTH_URL),
    nodeEnv: process.env.NODE_ENV ?? "unset",
    database: false,
    ...getSmtpHealthChecks(),
  };

  if (process.env.DATABASE_URL && source === "DB_*") {
    checks.warning =
      "SUPPRIMEZ la variable DATABASE_URL dans hPanel (garder seulement DB_*). Elle est encore définie et peut bloquer la connexion.";
  }

  const hint = mysqlUserHint(parsed?.user, parsed?.database);
  if (hint) checks.mysqlUserHint = hint;

  if (dbFormat !== true) {
    return Response.json({
      status: "degraded",
      time: new Date().toISOString(),
      checks,
    });
  }

  const hostsToTry =
    user && password && name
      ? databaseHostsToTry(preferredHost)
      : [parsed?.host ?? "127.0.0.1"];

  let lastError = "connection failed";
  for (const host of hostsToTry) {
    const testUrl =
      user && password && name
        ? buildDatabaseUrl(host, user, password, name, port)
        : url!;
    try {
      await tryMysqlConnection(testUrl);
      checks.database = true;
      checks.mysqlHostUsed = host;
      process.env.DATABASE_URL = testUrl;
      lastError = "";
      break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "connection failed";
    }
  }

  if (lastError) {
    const msg = lastError;
    if (msg.includes("invalid port number") || msg.includes("invalid database string")) {
      checks.database =
        "DATABASE_URL invalide — format attendu : mysql://USER:MDP@127.0.0.1:3306/NOM_BASE";
    } else if (msg.includes("PANIC") || msg.includes("timer has gone away") || msg.includes("openssl-1.1")) {
      checks.database =
        "Moteur Prisma incompatible (OpenSSL Hostinger). Redeploy après le dernier commit Git.";
    } else if (msg.includes("Authentication failed") || msg.includes("credentials")) {
      checks.database = "Mot de passe ou utilisateur MySQL refusé.";
      checks.fixSteps = [
        "1. hPanel → Bases de données MySQL (pas Remote MySQL) → u835607784_IGlionel → Changer mot de passe",
        "2. Test phpMyAdmin avec CE mot de passe (user IGlionel, pas bookflow)",
        "3. App Node.js : SUPPRIMER DATABASE_URL, DB_PASSWORD=même mot de passe, DB_HOST=127.0.0.1",
        "4. Save → Restart (pas seulement Redeploy)",
        `5. dbPasswordLength=${password?.length ?? 0} — si 0, DB_PASSWORD est vide sur Hostinger`,
      ];
      checks.hostsTried = hostsToTry;
    } else {
      checks.database = msg;
    }
  }

  const ok =
    checks.authSecret === true &&
    checks.databaseUrl === true &&
    checks.databaseUrlFormat === true &&
    checks.database === true &&
    checks.smtpReady === true;

  return Response.json({
    status: ok ? "ok" : "degraded",
    time: new Date().toISOString(),
    checks,
    passwordResetReady: checks.database === true && checks.smtpReady === true,
  });
}
