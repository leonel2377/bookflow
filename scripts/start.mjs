/**
 * Démarrage Next.js pour Hostinger — écoute sur 0.0.0.0 et PORT (défaut 3000).
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = String(process.env.PORT || "3000");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

if (!existsSync(nextBin)) {
  console.error("[bookflow] next introuvable — npm install && npm run build requis");
  process.exit(1);
}

console.info(`[bookflow] next start -H 0.0.0.0 -p ${port} (node ${process.version})`);

const child = spawn(process.execPath, [nextBin, "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});

child.on("error", (err) => {
  console.error("[bookflow]", err);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 1);
});
