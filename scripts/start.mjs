/**
 * Démarre l'app sur Hostinger (PORT + 0.0.0.0).
 * Préfère le serveur standalone Next.js si disponible.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const port = process.env.PORT || "3000";
const hostname = "0.0.0.0";
const env = { ...process.env, PORT: port, HOSTNAME: hostname };

const standaloneServer = path.join(process.cwd(), ".next", "standalone", "server.js");
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

function run(command, args) {
  console.info(`[bookflow] ${command} ${args.join(" ")}`);
  const child = spawn(command, args, { stdio: "inherit", env });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.error(`[bookflow] Arrêt (${signal})`);
      process.exit(1);
    }
    process.exit(code ?? 0);
  });

  child.on("error", (err) => {
    console.error("[bookflow] Erreur démarrage:", err);
    process.exit(1);
  });
}

if (existsSync(standaloneServer)) {
  console.info(`[bookflow] Mode standalone — ${hostname}:${port}`);
  run(process.execPath, [standaloneServer]);
} else if (existsSync(nextBin)) {
  console.info(`[bookflow] Mode next start — ${hostname}:${port}`);
  run(process.execPath, [nextBin, "start", "-H", hostname, "-p", port]);
} else {
  console.error("[bookflow] Aucun serveur trouvé. Lancez npm run build.");
  process.exit(1);
}
