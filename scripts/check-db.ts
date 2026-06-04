/**
 * Teste la connexion MySQL et affiche si les tables Prisma existent.
 * Usage (depuis votre PC, avec .env rempli) :
 *   npx tsx scripts/check-db.ts
 */
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrlEnv } from "../src/lib/database-url";

applyDatabaseUrlEnv();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL / DB_* manquant dans .env");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.info("Connexion…", process.env.DATABASE_URL?.replace(/:([^:@/]+)@/, ":***@"));

  await prisma.$queryRaw`SELECT 1`;
  console.info("✅ Connexion MySQL OK");

  try {
    await prisma.user.count();
    console.info("✅ Table User existe — base prête pour l'inscription");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("does not exist") || msg.includes("P2021")) {
      console.error("❌ Tables absentes — lancez : npm run db:mysql:push");
      process.exit(1);
    }
    throw e;
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
