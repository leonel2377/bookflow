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

applyDbEnvFromHostinger();

const buildId = path.join(root, ".next", "BUILD_ID");
if (!existsSync(buildId)) {
  console.warn("[bookflow] ATTENTION: .next/BUILD_ID absent — le build a peut-être échoué");
} else {
  console.info("[bookflow] Build détecté:", existsSync(buildId) ? "OK" : "KO");
}

console.info(`[bookflow] next start -H 0.0.0.0 -p ${port} (node ${process.version})`);

const child = spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
  shell: true,
});

child.on("error", (err) => {
  console.error("[bookflow] Erreur démarrage:", err);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) console.error(`[bookflow] Arrêt signal ${signal}`);
  else if (code !== 0) console.error(`[bookflow] Arrêt code ${code}`);
  process.exit(code ?? 1);
});
