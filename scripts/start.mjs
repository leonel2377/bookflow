/**
 * Démarre Next.js depuis la racine du projet (Hostinger Node.js Web App).
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const port = process.env.PORT || "3000";
const hostname = "0.0.0.0";
const env = { ...process.env, PORT: port, HOSTNAME: hostname };

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

if (!existsSync(nextBin)) {
  console.error("[bookflow] next introuvable — lancez npm install && npm run build");
  process.exit(1);
}

console.info(`[bookflow] next start ${hostname}:${port}`);

const child = spawn(process.execPath, [nextBin, "start", "-H", hostname, "-p", port], {
  stdio: "inherit",
  env,
  cwd: process.cwd(),
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[bookflow] Arrêt (${signal})`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error("[bookflow] Erreur:", err);
  process.exit(1);
});
