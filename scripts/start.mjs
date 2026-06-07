/**
 * Démarrage Next.js pour Hostinger.
 * Start command hPanel : npm run start -- -p $PORT
 * Ne pas définir PORT=3000 dans les variables d'environnement.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyDbEnvFromHostinger } from "./setup-db-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function parsePortFromArgv() {
  const args = process.argv.slice(2);
  const short = args.indexOf("-p");
  if (short >= 0 && args[short + 1]) return String(args[short + 1]);
  const long = args.indexOf("--port");
  if (long >= 0 && args[long + 1]) return String(args[long + 1]);
  return undefined;
}

function cleanPort(raw) {
  if (!raw) return undefined;
  const t = String(raw).trim().replace(/^["']|["']$/g, "");
  return t || undefined;
}

function resolvePort() {
  const fromArgv = parsePortFromArgv();
  const fromEnv = cleanPort(process.env.PORT);
  if (fromArgv) return fromArgv;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return "3000";
  return undefined;
}

applyDbEnvFromHostinger();

const port = resolvePort();
if (!port) {
  console.error("[bookflow] ERREUR: aucun port — l'app ne peut pas démarrer.");
  console.error("[bookflow] hPanel → Start command : npm run start -- -p $PORT");
  console.error("[bookflow] Supprimez PORT=3000 des variables d'environnement si présent.");
  process.exit(1);
}

process.env.PORT = port;
process.env.HOSTNAME = "0.0.0.0";

const buildId = path.join(root, ".next", "BUILD_ID");
if (!existsSync(buildId)) {
  console.warn("[bookflow] ATTENTION: .next/BUILD_ID absent — le build a peut-être échoué");
} else {
  console.info("[bookflow] Build détecté: OK");
}

console.info(
  `[bookflow] Démarrage port=${port} node=${process.version} env=${process.env.NODE_ENV ?? "?"}`,
);

const standaloneServer = path.join(root, ".next", "standalone", "server.js");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

function startProcess(label, command, args, cwd = root) {
  console.info(`[bookflow] ${label}`);
  const child = spawn(command, args, {
    stdio: "inherit",
    cwd,
    env: process.env,
    shell: false,
  });

  child.on("error", (err) => {
    console.error(`[bookflow] Erreur ${label}:`, err);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) console.error(`[bookflow] Arrêt signal ${signal}`);
    else if (code !== 0) console.error(`[bookflow] Arrêt code ${code}`);
    process.exit(code ?? 1);
  });
}

if (existsSync(standaloneServer)) {
  startProcess("mode standalone", process.execPath, [standaloneServer], path.join(root, ".next", "standalone"));
} else if (existsSync(nextBin)) {
  startProcess("next start", process.execPath, [nextBin, "start", "-H", "0.0.0.0", "-p", port]);
} else {
  console.error("[bookflow] next introuvable — vérifiez npm install et le build");
  process.exit(1);
}
