import { applyDatabaseUrlEnv } from "@/lib/database-url";

export async function register() {
  applyDatabaseUrlEnv();

  console.info(
    "[bookflow] Démarrage",
    JSON.stringify({
      node: process.version,
      port: process.env.PORT ?? "non défini",
      hostname: process.env.HOSTNAME ?? "0.0.0.0",
      nodeEnv: process.env.NODE_ENV,
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      hasDbUser: Boolean(process.env.DB_USER),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    }),
  );
}
