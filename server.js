/**
 * Point d'entrée Hostinger — Start command : npm run start
 * Alternative hPanel : node server.js
 */
const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

async function main() {
  const { applyDbEnvFromHostinger } = await import("./scripts/setup-db-env.mjs");
  applyDbEnvFromHostinger();

  const port = String(process.env.PORT || "3000").trim();
  process.env.PORT = port;
  process.env.HOSTNAME = "0.0.0.0";

  const root = __dirname;
  const buildId = path.join(root, ".next", "BUILD_ID");
  if (!existsSync(buildId)) {
    console.error("[bookflow] ERREUR: .next/BUILD_ID absent — le build a échoué sur Hostinger.");
    console.error("[bookflow] → hPanel → Deployments → Build logs (ligne rouge en bas)");
    process.exit(1);
  }

  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(nextBin)) {
    console.error("[bookflow] ERREUR: next introuvable — npm install a échoué ?");
    process.exit(1);
  }

  console.info(
    `[bookflow] Démarrage 0.0.0.0:${port} | node ${process.version} | env=${process.env.NODE_ENV ?? "?"}`,
  );

  const child = spawn(process.execPath, [nextBin, "start", "-H", "0.0.0.0", "-p", port], {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });

  child.on("error", (err) => {
    console.error("[bookflow] Impossible de lancer next:", err);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) console.error(`[bookflow] Arrêt (signal ${signal})`);
    else if (code !== 0) console.error(`[bookflow] Arrêt (code ${code})`);
    process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error("[bookflow] Erreur fatale:", err);
  process.exit(1);
});
