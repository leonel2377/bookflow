/** Nettoie DATABASE_URL (guillemets / espaces ajoutés parfois dans hPanel). */
export function cleanEnvValue(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  return trimmed || undefined;
}

export function cleanDatabaseUrl(raw?: string): string | undefined {
  return cleanEnvValue(raw);
}

export function validateDatabaseUrlFormat(raw?: string): string | true {
  const url = cleanDatabaseUrl(raw);
  if (!url) return "DATABASE_URL manquant";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "DATABASE_URL invalide — format : mysql://USER:MDP@localhost:3306/NOM_BASE";
  }

  if (parsed.protocol !== "mysql:") {
    return "DATABASE_URL doit commencer par mysql://";
  }
  if (!parsed.hostname) {
    return "Hôte manquant — ajoutez @localhost:3306 après le mot de passe";
  }
  if (!parsed.pathname || parsed.pathname === "/") {
    return "Nom de base manquant — finissez par /u835607784_bookflow";
  }
  if (!parsed.port && parsed.hostname !== "localhost") {
    return "Port manquant — utilisez @localhost:3306";
  }

  return true;
}

export function parseDatabaseUrlSafe(raw?: string): {
  user?: string;
  host?: string;
  database?: string;
} | null {
  const url = cleanDatabaseUrl(raw);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      user: decodeURIComponent(parsed.username),
      host: parsed.hostname,
      database: parsed.pathname.replace(/^\//, ""),
    };
  } catch {
    return null;
  }
}

export function buildDatabaseUrl(
  host: string,
  user: string,
  password: string,
  name: string,
  port = "3306",
): string {
  const base = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}connect_timeout=5&pool_timeout=10`;
}

/** Hôtes à essayer sur Hostinger (127.0.0.1 en priorité). */
export function databaseHostsToTry(preferred?: string): string[] {
  const hosts = [preferred ?? "127.0.0.1", "127.0.0.1"].filter(Boolean);
  return [...new Set(hosts)];
}

/** DATABASE_URL ou variables séparées Hostinger (DB_HOST, DB_USER, …). */
export function resolveDatabaseUrl(): {
  url?: string;
  source: "DATABASE_URL" | "DB_*" | "none";
  host?: string;
} {
  const host =
    cleanEnvValue(process.env.DB_HOST) ??
    (process.env.NODE_ENV === "production" ? "127.0.0.1" : "localhost");
  const user = cleanEnvValue(process.env.DB_USER);
  const password = cleanEnvValue(process.env.DB_PASSWORD);
  const name = cleanEnvValue(process.env.DB_NAME);
  const port = cleanEnvValue(process.env.DB_PORT) ?? "3306";

  if (user && password && name) {
    const url = buildDatabaseUrl(host, user, password, name, port);
    if (validateDatabaseUrlFormat(url) === true) {
      return { url, source: "DB_*", host };
    }
  }

  const direct = cleanDatabaseUrl(process.env.DATABASE_URL);
  if (direct && validateDatabaseUrlFormat(direct) === true) {
    return { url: direct, source: "DATABASE_URL", host: parseDatabaseUrlSafe(direct)?.host };
  }

  return { url: direct, source: direct ? "DATABASE_URL" : "none" };
}

export function applyDatabaseUrlEnv(): string | undefined {
  const user = cleanEnvValue(process.env.DB_USER);
  const password = cleanEnvValue(process.env.DB_PASSWORD);
  const name = cleanEnvValue(process.env.DB_NAME);

  // DB_* prioritaire : ignorer un ancien DATABASE_URL Hostinger
  if (user && password && name) {
    const { url } = resolveDatabaseUrl();
    if (url) {
      process.env.DATABASE_URL = url;
      return url;
    }
  }

  const direct = cleanDatabaseUrl(process.env.DATABASE_URL);
  if (direct) {
    process.env.DATABASE_URL = direct;
    return direct;
  }

  return undefined;
}
