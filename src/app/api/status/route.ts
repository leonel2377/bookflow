/** Diagnostic rapide sans base de données (évite 503 sur Hostinger). */
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    time: new Date().toISOString(),
    node: process.version,
    port: process.env.PORT ?? "3000",
    hasAuthSecret: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
    hasDbEnv: Boolean(process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME),
    dbPasswordLength: process.env.DB_PASSWORD?.length ?? 0,
    authUrl: Boolean(process.env.AUTH_URL),
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  });
}
