/**
 * Démarrage Hostinger — next start (stable, sans mode standalone).
 * hPanel Start : npm run start -- -p $PORT
 */
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

function parsePort() {
  const args = process.argv.slice(2);
  const i = args.indexOf("-p");
  if (i >= 0 && args[i + 1]) return String(args[i + 1]).trim();
  if (process.env.PORT) return String(process.env.PORT).trim();
  return "3000";
}

async function main() {
  const root = __dirname;
  const { applyDbEnvFromHostinger } = await import("./scripts/setup-db-env.mjs");
  applyDbEnvFromHostinger();

  const port = parsePort();
  process.env.PORT = port;
  process.env.HOSTNAME = "0.0.0.0";

  console.info("=".repeat(50));
  console.info("[bookflow] Démarrage");
  console.info("[bookflow] port:", port, "| node:", process.version);
  console.info("[bookflow] build:", fs.existsSync(path.join(root, ".next", "BUILD_ID")) ? "OK" : "ABSENT");
  console.info("[bookflow] AUTH:", process.env.AUTH_SECRET ? "OK" : "manquant");
  console.info("=".repeat(50));

  if (!fs.existsSync(path.join(root, ".next", "BUILD_ID"))) {
    console.error("[bookflow] Build absent — hPanel → Redeploy");
    process.exit(1);
  }

  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextBin)) {
    console.error("[bookflow] next introuvable — npm install a échoué");
    process.exit(1);
  }

  const child = spawn(process.execPath, [nextBin, "start", "-H", "0.0.0.0", "-p", port], {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });

  child.on("error", (err) => {
    console.error("[bookflow] Erreur:", err);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) console.error("[bookflow] Signal:", signal);
    process.exit(code ?? 1);
  });
}

main().catch((e) => {
  console.error("[bookflow]", e);
  process.exit(1);
});
