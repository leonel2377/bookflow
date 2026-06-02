/**
 * Démarre Next.js en écoutant sur PORT (requis par Hostinger Node.js Web App).
 */
import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";
const hostname = "0.0.0.0";

console.info(`[bookflow] Starting Next.js on ${hostname}:${port}`);

const child = spawn(
  "npx",
  ["next", "start", "-H", hostname, "-p", port],
  {
    stdio: "inherit",
    env: process.env,
    shell: true,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[bookflow] Process killed: ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});
