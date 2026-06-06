/**
 * Démarrage Next.js pour Hostinger — écoute sur 0.0.0.0 et PORT (défaut 3000).
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyDbEnvFromHostinger } from "./setup-db-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = String(process.env.PORT || "3000");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const buildId = path.join(root, ".next", "BUILD_ID");

if (!existsSync(nextBin)) {
  console.error("[bookflow] next introuvable — npm install && npm run build requis");
  process.exit(1);
}

if (!existsSync(buildId)) {
  console.error("[bookflow] .next/BUILD_ID absent — le build a échoué ou n'a pas été déployé");
  console.error("[bookflow] hPanel → Build command: npm run build");
  process.exit(1);
}

applyDbEnvFromHostinger();

console.info(`[bookflow] Démarrage next start -H 0.0.0.0 -p ${port} (node ${process.version})`);

const child = spawn(process.execPath, [nextBin, "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});

child.on("error", (err) => {
  console.error("[bookflow] Erreur démarrage:", err);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[bookflow] Processus arrêté (signal ${signal})`);
    process.exit(1);
  }
  if (code !== 0) {
    console.error(`[bookflow] Processus arrêté (code ${code})`);
  }
  process.exit(code ?? 1);
});
