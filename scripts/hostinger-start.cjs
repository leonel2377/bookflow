/**
 * Démarrage Hostinger — CommonJS pur (pas d'import ESM).
 * Start hPanel : npm run start -- -p $PORT
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

function clean(v) {
  if (!v) return "";
  return v.trim().replace(/^["']|["']$/g, "");
}

function applyDbEnv() {
  const user = clean(process.env.DB_USER);
  const password = clean(process.env.DB_PASSWORD);
  const name = clean(process.env.DB_NAME);
  const host = clean(process.env.DB_HOST) || "127.0.0.1";
  const port = clean(process.env.DB_PORT) || "3306";
  if (user && password && name) {
    process.env.DATABASE_URL = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
    console.info("[bookflow] DB:", user + "@" + host + "/" + name);
  }
}

const args = process.argv.slice(2);
const pIdx = args.indexOf("-p");
const portFromArg = pIdx >= 0 && args[pIdx + 1] ? String(args[pIdx + 1]).trim() : "";
const portFromEnv = clean(process.env.PORT);
const port = portFromArg || portFromEnv || "3000";

process.env.PORT = port;
process.env.HOSTNAME = "0.0.0.0";
applyDbEnv();

const root = path.join(__dirname, "..");
const buildId = path.join(root, ".next", "BUILD_ID");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

console.info("[bookflow] === DÉMARRAGE ===");
console.info("[bookflow] port:", port, "(arg:", portFromArg || "-", "| env:", portFromEnv || "-", ")");
console.info("[bookflow] node:", process.version);
if (port === "3000" && !portFromArg) {
  console.warn(
    "[bookflow] ATTENTION 503: supprimez PORT=3000 dans hPanel et utilisez Start: npm run start -- -p $PORT",
  );
}
console.info("[bookflow] build:", fs.existsSync(buildId) ? "OK" : "ABSENT");
console.info("[bookflow] next:", fs.existsSync(nextBin) ? "OK" : "ABSENT");
console.info("[bookflow] AUTH:", process.env.AUTH_SECRET ? "OK" : "manquant");

if (!fs.existsSync(buildId)) {
  console.error("[bookflow] ÉCHEC: .next/BUILD_ID absent — faites Redeploy dans hPanel");
  process.exit(1);
}
if (!fs.existsSync(nextBin)) {
  console.error("[bookflow] ÉCHEC: next absent — vérifiez npm install --include=dev");
  process.exit(1);
}

const result = spawnSync(process.execPath, [nextBin, "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
