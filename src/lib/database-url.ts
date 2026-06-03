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

/** DATABASE_URL ou variables séparées Hostinger (DB_HOST, DB_USER, …). */
export function resolveDatabaseUrl(): {
  url?: string;
  source: "DATABASE_URL" | "DB_*" | "none";
} {
  const direct = cleanDatabaseUrl(process.env.DATABASE_URL);
  if (direct && validateDatabaseUrlFormat(direct) === true) {
    return { url: direct, source: "DATABASE_URL" };
  }

  const host = cleanEnvValue(process.env.DB_HOST) ?? "localhost";
  const user = cleanEnvValue(process.env.DB_USER);
  const password = cleanEnvValue(process.env.DB_PASSWORD);
  const name = cleanEnvValue(process.env.DB_NAME);
  const port = cleanEnvValue(process.env.DB_PORT) ?? "3306";

  if (user && password && name) {
    const url = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
    if (validateDatabaseUrlFormat(url) === true) {
      return { url, source: "DB_*" };
    }
  }

  return { url: direct, source: direct ? "DATABASE_URL" : "none" };
}

export function applyDatabaseUrlEnv(): string | undefined {
  const { url } = resolveDatabaseUrl();
  if (url) {
    process.env.DATABASE_URL = url;
  }
  return url;
}
