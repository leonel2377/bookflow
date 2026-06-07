/**
 * Point d'entrée Hostinger — lance le serveur Next.js standalone.
 * hPanel Start : npm run start -- -p $PORT
 */
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

  const standaloneDir = path.join(root, ".next", "standalone");
  const standaloneServer = path.join(standaloneDir, "server.js");

  console.info("[bookflow] app.js — port:", port, "| standalone:", fs.existsSync(standaloneServer));

  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16) {
    console.error("[bookflow] AUTH_SECRET manquant dans hPanel");
    process.exit(1);
  }

  if (fs.existsSync(standaloneServer)) {
    process.chdir(standaloneDir);
    require(standaloneServer);
    return;
  }

  console.warn("[bookflow] standalone absent — fallback next start (dev local)");
  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  require("node:child_process").spawnSync(
    process.execPath,
    [nextBin, "start", "-H", "0.0.0.0", "-p", port],
    { stdio: "inherit", cwd: root, env: process.env },
  );
}

main().catch((e) => {
  console.error("[bookflow]", e);
  process.exit(1);
});
