/**
 * Build Hostinger : env placeholders + prisma generate + next build
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyDbEnvFromHostinger } from "./setup-db-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

applyDbEnvFromHostinger();

// Placeholders pour que le build ne plante pas si une variable manque dans hPanel
if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16) {
  process.env.AUTH_SECRET = "build-placeholder-secret-32chars-min";
  console.warn("[bookflow] AUTH_SECRET placeholder pour le build");
}
if (!process.env.AUTH_URL) {
  process.env.AUTH_URL = "https://stkmsoft.online";
}
if (!process.env.NEXT_PUBLIC_APP_URL) {
  process.env.NEXT_PUBLIC_APP_URL = "https://stkmsoft.online";
}

function run(label, cmd, args) {
  console.info(`[bookflow] ${label}…`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: process.env, shell: true });
  if (r.status !== 0) {
    console.error(`[bookflow] ÉCHEC: ${label} (code ${r.status})`);
    process.exit(r.status ?? 1);
  }
}

run("prisma generate", "npx", ["prisma", "generate"]);
run("next build", "npx", ["next", "build"]);

if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
  console.error("[bookflow] ÉCHEC: .next/BUILD_ID absent après le build");
  process.exit(1);
}

console.info("[bookflow] Build OK");
