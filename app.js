/**
 * Point d'entrée Hostinger (app.js).
 * hPanel Start : npm run start -- -p $PORT
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

async function main() {
  const root = __dirname;
  const { applyDbEnvFromHostinger } = await import("./scripts/setup-db-env.mjs");
  applyDbEnvFromHostinger();

  const port = parsePort();
  process.env.PORT = port;
  process.env.HOSTNAME = "0.0.0.0";

  console.info("=".repeat(60));
  console.info("[bookflow] app.js — démarrage Hostinger");
  console.info("[bookflow] port :", port);
  console.info("[bookflow] node :", process.version);
  console.info("[bookflow] AUTH :", process.env.AUTH_SECRET ? "OK" : "MANQUANT !!!");
  console.info("[bookflow] .next:", fs.existsSync(path.join(root, ".next", "BUILD_ID")) ? "OK" : "ABSENT !!!");
  console.info("=".repeat(60));

  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16) {
    console.error("[bookflow] AUTH_SECRET manquant — ajoutez-le dans Variables d'environnement hPanel");
    process.exit(1);
  }

  if (!fs.existsSync(path.join(root, ".next", "BUILD_ID"))) {
    console.error("[bookflow] Build absent — redeploy avec Build succeeded");
    process.exit(1);
  }

  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  const result = spawnSync(
    process.execPath,
    [nextBin, "start", "-H", "0.0.0.0", "-p", port],
    { stdio: "inherit", cwd: root, env: process.env },
  );
  process.exit(result.status ?? 1);
}

main().catch((e) => {
  console.error("[bookflow]", e);
  process.exit(1);
});
