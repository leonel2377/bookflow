/**
 * Construit DATABASE_URL depuis DB_* (Hostinger).
 * Exporte une fonction réutilisable au build et au démarrage.
 */

export function cleanEnvValue(v) {
  if (!v) return undefined;
  const t = v.trim().replace(/^["']|["']$/g, "");
  return t || undefined;
}

/** Applique DATABASE_URL depuis DB_* et ignore un ancien DATABASE_URL hPanel. */
export function applyDbEnvFromHostinger() {
  const host = cleanEnvValue(process.env.DB_HOST) ?? "127.0.0.1";
  const user = cleanEnvValue(process.env.DB_USER);
  const password = cleanEnvValue(process.env.DB_PASSWORD);
  const name = cleanEnvValue(process.env.DB_NAME);
  const port = cleanEnvValue(process.env.DB_PORT) ?? "3306";

  if (user && password && name) {
    if (process.env.DATABASE_URL) {
      console.warn(
        "[bookflow] DATABASE_URL hPanel ignoré — utilisation de DB_* (supprimez DATABASE_URL dans hPanel)",
      );
    }
    process.env.DATABASE_URL = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
    console.info("[bookflow] DATABASE_URL défini depuis DB_* →", `${user}@${host}/${name}`);
    return true;
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "mysql://build:build@127.0.0.1:3306/build";
    console.warn("[bookflow] DATABASE_URL placeholder (build uniquement)");
  }

  return false;
}
