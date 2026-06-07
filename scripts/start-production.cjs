/**
 * Démarrage production Hostinger — processus unique via next start.
 * hPanel Start : npm run start   (Hostinger injecte PORT automatiquement)
 * Alternative  : npm run start -- -p $PORT
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

function parsePort() {
  const args = process.argv.slice(2);
  const i = args.indexOf("-p");
  if (i >= 0 && args[i + 1]) return String(args[i + 1]).trim();
  if (process.env.PORT) return String(process.env.PORT).trim();
  return "3000";
}

function listDir(label, dir) {
  try {
    const files = fs.readdirSync(dir);
    console.info(`[bookflow] ${label}:`, files.slice(0, 12).join(", ") + (files.length > 12 ? "…" : ""));
  } catch {
    console.warn(`[bookflow] ${label}: introuvable (${dir})`);
  }
}

async function main() {
  const root = path.join(__dirname, "..");
  const { applyDbEnvFromHostinger } = await import("./setup-db-env.mjs");
  applyDbEnvFromHostinger();

  const port = parsePort();
  process.env.PORT = port;
  process.env.HOSTNAME = "0.0.0.0";

  console.info("=".repeat(60));
  console.info("[bookflow] DÉMARRAGE PRODUCTION");
  console.info("[bookflow] node   :", process.version);
  console.info("[bookflow] port   :", port, "(env PORT=", process.env.PORT, ")");
  console.info("[bookflow] cwd    :", root);
  console.info("[bookflow] AUTH   :", process.env.AUTH_SECRET ? "défini" : "MANQUANT");
  console.info("[bookflow] DB     :", process.env.DB_USER ? `${process.env.DB_USER}@${process.env.DB_HOST}` : "DB_* manquant");
  listDir(".next", path.join(root, ".next"));
  console.info("=".repeat(60));

  const buildId = path.join(root, ".next", "BUILD_ID");
  if (!fs.existsSync(buildId)) {
    console.error("[bookflow] ERREUR CRITIQUE: .next/BUILD_ID absent");
    console.error("[bookflow] → Le build a échoué OU le dossier .next n'est pas déployé");
    console.error("[bookflow] → hPanel → Build logs → cherchez une erreur rouge");
    process.exit(1);
  }

  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextBin)) {
    console.error("[bookflow] ERREUR: next introuvable — npm install a échoué ?");
    process.exit(1);
  }

  const result = spawnSync(
    process.execPath,
    [nextBin, "start", "-H", "0.0.0.0", "-p", port],
    { stdio: "inherit", cwd: root, env: process.env },
  );

  if (result.error) console.error("[bookflow] Erreur next start:", result.error);
  if (result.signal) console.error("[bookflow] Signal:", result.signal);
  process.exit(result.status ?? 1);
}

main().catch((err) => {
  console.error("[bookflow] Erreur fatale:", err);
  process.exit(1);
});
