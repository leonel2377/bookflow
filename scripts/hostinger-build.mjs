/**
 * Build Hostinger : DATABASE_URL + prisma generate + next build
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(label, cmd, args) {
  console.info(`[bookflow] ${label}…`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: process.env, shell: true });
  if (r.status !== 0) {
    console.error(`[bookflow] ÉCHEC: ${label} (code ${r.status})`);
    process.exit(r.status ?? 1);
  }
}

await import("./setup-db-env.mjs");

run("prisma generate", "npx", ["prisma", "generate"]);
run("next build", "npx", ["next", "build"]);

if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
  console.error("[bookflow] ÉCHEC: .next/BUILD_ID absent après le build");
  process.exit(1);
}

console.info("[bookflow] Build OK");
