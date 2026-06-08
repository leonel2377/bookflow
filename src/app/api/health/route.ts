import {
  buildDatabaseUrl,
  cleanEnvValue,
  databaseHostsToTry,
  parseDatabaseUrlSafe,
  resolveDatabaseUrl,
  validateDatabaseUrlFormat,
} from "@/lib/database-url";
import { getSmtpHealthChecks } from "@/lib/smtp-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DB_CHECK_MS = 2500;

async function checkDatabase(timeoutMs: number): Promise<{
  ok: boolean;
  host?: string;
  error?: string;
}> {
  const user = cleanEnvValue(process.env.DB_USER);
  const password = cleanEnvValue(process.env.DB_PASSWORD);
  const name = cleanEnvValue(process.env.DB_NAME);
  const port = cleanEnvValue(process.env.DB_PORT) ?? "3306";

  if (!user || !password || !name) {
    return { ok: false, error: "DB_* incomplet" };
  }

  const host = databaseHostsToTry(cleanEnvValue(process.env.DB_HOST))[0] ?? "127.0.0.1";
  process.env.DATABASE_URL = buildDatabaseUrl(host, user, password, name, port);

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("MySQL timeout (6s)")), timeoutMs),
      ),
    ]);
    return { ok: true, host };
  } catch (err) {
    const message = err instanceof Error ? err.message : "connection failed";
    return { ok: false, host, error: message };
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

  const db = await checkDatabase(DB_CHECK_MS);

  if (db.ok) {
    checks.database = true;
    checks.mysqlHostUsed = db.host ?? preferredHost ?? "127.0.0.1";

    try {
      await prisma.user.count();
      checks.tablesReady = true;
    } catch (tableErr) {
      const msg = tableErr instanceof Error ? tableErr.message : String(tableErr);
      checks.tablesReady = false;
      checks.tablesHint =
        "Tables absentes — phpMyAdmin → Importer → prisma/hostinger-init.sql";
      if (msg.includes("does not exist") || msg.includes("n'existe pas")) {
        checks.tablesError = "Table User introuvable";
      } else {
        checks.tablesError = msg.slice(0, 120);
      }
    }
  } else {
    const msg = db.error ?? "connection failed";
    if (msg.includes("Authentication failed") || msg.includes("credentials")) {
      checks.database = "Mot de passe ou utilisateur MySQL refusé.";
      checks.fixSteps = [
        "1. hPanel → MySQL → u835607784_IGlionel → mot de passe",
        "2. hPanel → App Node → DB_PASSWORD = même mot de passe",
        "3. SUPPRIMER DATABASE_URL, DB_HOST=127.0.0.1",
        "4. Save → Restart",
        `5. dbPasswordLength=${password?.length ?? 0}`,
      ];
    } else if (msg.includes("timeout")) {
      checks.database = "MySQL ne répond pas (timeout) — vérifiez DB_PASSWORD et Restart l'app.";
    } else {
      checks.database = msg;
    }
    checks.hostsTried = databaseHostsToTry(preferredHost);
  }

  const ok =
    checks.authSecret === true &&
    checks.databaseUrl === true &&
    checks.databaseUrlFormat === true &&
    checks.database === true &&
    checks.tablesReady === true &&
    checks.smtpReady === true;

  return Response.json({
    status: ok ? "ok" : "degraded",
    time: new Date().toISOString(),
    checks,
    passwordResetReady: checks.database === true && checks.smtpReady === true,
  });
}
