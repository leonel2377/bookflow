import { PrismaClient } from "@prisma/client";
import { runDemoSeed, DEMO_ACCOUNTS } from "../src/lib/demo-seed";

const prisma = new PrismaClient();

async function main() {
  const { salon } = await runDemoSeed(prisma);
  console.log(`Salon démo : /salons/${salon.slug}`);
  console.log("Comptes démo (mot de passe: demo1234):");
  console.log(`  Client : ${DEMO_ACCOUNTS.client.email} → ${DEMO_ACCOUNTS.client.login}`);
  console.log(`  Pro    : ${DEMO_ACCOUNTS.pro.email} → ${DEMO_ACCOUNTS.pro.login}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
