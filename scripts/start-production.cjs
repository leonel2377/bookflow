/**
 * Démarrage production Hostinger.
 * Lance standalone en processus principal (pas de spawn enfant).
 * Start hPanel : npm run start -- -p $PORT
 */
const path = require("node:path");
const fs = require("node:fs");

function parsePort() {
  const args = process.argv.slice(2);
  const i = args.indexOf("-p");
  if (i >= 0 && args[i + 1]) return String(args[i + 1]).trim();
  return String(process.env.PORT || "3000").trim();
}

async function main() {
  const root = path.join(__dirname, "..");
  const { applyDbEnvFromHostinger } = await import("./setup-db-env.mjs");
  applyDbEnvFromHostinger();

  const port = parsePort();
  process.env.PORT = port;
  process.env.HOSTNAME = "0.0.0.0";

  const buildId = path.join(root, ".next", "BUILD_ID");
  if (!fs.existsSync(buildId)) {
    console.error("[bookflow] ERREUR: build absent (.next/BUILD_ID)");
    process.exit(1);
  }

  const standaloneDir = path.join(root, ".next", "standalone");
  const standaloneServer = path.join(standaloneDir, "server.js");

  console.info(
    `[bookflow] Start port=${port} node=${process.version} standalone=${fs.existsSync(standaloneServer)}`,
  );

  if (fs.existsSync(standaloneServer)) {
    process.chdir(standaloneDir);
    require(standaloneServer);
    return;
  }

  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextBin)) {
    console.error("[bookflow] ERREUR: next introuvable");
    process.exit(1);
  }

  console.info("[bookflow] Fallback next start");
  require("node:child_process").spawnSync(
    process.execPath,
    [nextBin, "start", "-H", "0.0.0.0", "-p", port],
    { stdio: "inherit", cwd: root, env: process.env },
  );
}

main().catch((err) => {
  console.error("[bookflow] Erreur fatale:", err);
  process.exit(1);
});
