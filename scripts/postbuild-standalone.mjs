/**
 * Copie assets + Prisma pour le mode standalone Next.js (Hostinger).
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.warn("[bookflow] Pas de build standalone — ignoré.");
  process.exit(0);
}

function copyDir(label, src, dest) {
  if (!existsSync(src)) {
    console.warn(`[bookflow] ${label} introuvable: ${src}`);
    return;
  }
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.info(`[bookflow] ${label} copié.`);
}

const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standaloneDir, "public");

if (existsSync(staticSrc)) {
  mkdirSync(path.dirname(staticDest), { recursive: true });
  cpSync(staticSrc, staticDest, { recursive: true });
}

if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
}

// Prisma : obligatoire pour les pages qui lisent la base (salons, compte, pro…)
copyDir(
  "Prisma client",
  path.join(root, "node_modules", ".prisma"),
  path.join(standaloneDir, "node_modules", ".prisma"),
);
copyDir(
  "@prisma/client",
  path.join(root, "node_modules", "@prisma", "client"),
  path.join(standaloneDir, "node_modules", "@prisma", "client"),
);

console.info("[bookflow] Build standalone prêt.");
