/**
 * Démarrage Next.js pour Hostinger : vérifie le build puis écoute sur 0.0.0.0:PORT.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = String(process.env.PORT || "3000");
const hostname = "0.0.0.0";
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const buildId = path.join(root, ".next", "BUILD_ID");

if (!existsSync(nextBin)) {
  console.error("[bookflow] ERREUR: next introuvable. Build échoué ou npm install incomplet.");
  process.exit(1);
}

if (!existsSync(buildId)) {
  console.error("[bookflow] ERREUR: .next/BUILD_ID absent. Lancez npm run build avant npm run start.");
  process.exit(1);
}

console.info(
  "[bookflow] Démarrage Next.js",
  JSON.stringify({ hostname, port, node: process.version, cwd: root }),
);

const child = spawn(
  process.execPath,
  [nextBin, "start", "-H", hostname, "-p", port],
  {
    stdio: "inherit",
    env: { ...process.env, PORT: port, HOSTNAME: hostname },
    cwd: root,
  },
);

child.on("error", (err) => {
  console.error("[bookflow] Impossible de démarrer Next.js:", err);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error("[bookflow] Arrêt signal", signal);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
