/**
 * Construit DATABASE_URL depuis DB_* avant prisma generate / build (Hostinger).
 */
import { spawnSync } from "node:child_process";

function clean(v) {
  if (!v) return undefined;
  const t = v.trim().replace(/^["']|["']$/g, "");
  return t || undefined;
}

const host = clean(process.env.DB_HOST) ?? "localhost";
const user = clean(process.env.DB_USER);
const password = clean(process.env.DB_PASSWORD);
const name = clean(process.env.DB_NAME);
const port = clean(process.env.DB_PORT) ?? "3306";

if (user && password && name) {
  process.env.DATABASE_URL = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
  console.info("[bookflow] DATABASE_URL défini depuis DB_*");
} else if (!process.env.DATABASE_URL) {
  // prisma generate n'ouvre pas la DB — placeholder pour le build Hostinger
  process.env.DATABASE_URL = "mysql://build:build@127.0.0.1:3306/build";
  console.warn("[bookflow] DATABASE_URL placeholder (build uniquement)");
}

const cmd = process.argv[2];
if (cmd === "generate") {
  const r = spawnSync("npx", ["prisma", "generate"], {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  process.exit(r.status ?? 1);
}
