/**
 * Démarrage Next.js pour Hostinger : écoute sur 0.0.0.0 et le PORT de la plateforme.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = String(process.env.PORT || "3000");
const hostname = "0.0.0.0";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

console.info(
  "[bookflow] Démarrage Next.js",
  JSON.stringify({ hostname, port, node: process.version }),
);

const child = spawn(
  process.execPath,
  [nextBin, "start", "--hostname", hostname, "--port", port],
  { stdio: "inherit", env: process.env, cwd: root },
);

child.on("exit", (code, signal) => {
  if (signal) {
    console.error("[bookflow] Arrêt signal", signal);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
