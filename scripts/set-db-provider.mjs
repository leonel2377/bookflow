import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const provider = process.argv[2];

if (provider !== "sqlite" && provider !== "mysql") {
  console.error("Usage: node scripts/set-db-provider.mjs <sqlite|mysql>");
  process.exit(1);
}

const schemaPath = join(process.cwd(), "prisma", "schema.prisma");
let schema = readFileSync(schemaPath, "utf8");

if (!schema.includes('provider = "sqlite"') && !schema.includes('provider = "mysql"')) {
  console.error("Impossible de trouver provider dans prisma/schema.prisma");
  process.exit(1);
}

schema = schema.replace(/provider = "(sqlite|mysql)"/, `provider = "${provider}"`);
writeFileSync(schemaPath, schema);

console.log(`Prisma configuré sur : ${provider}`);
if (provider === "mysql") {
  console.log("Vérifiez DATABASE_URL dans .env (voir .env.hostinger.example)");
} else {
  console.log('DATABASE_URL local : file:./dev.db');
}
