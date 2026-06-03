export async function register() {
  console.info(
    "[bookflow] Démarrage",
    JSON.stringify({
      node: process.version,
      port: process.env.PORT ?? "non défini",
      nodeEnv: process.env.NODE_ENV,
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    }),
  );
}
