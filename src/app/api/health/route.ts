export async function GET() {
  const checks = {
    authSecret: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    authUrl: Boolean(process.env.AUTH_URL),
    nodeEnv: process.env.NODE_ENV ?? "unset",
  };

  const ok = checks.authSecret && checks.databaseUrl;

  return Response.json(
    {
      status: ok ? "ok" : "misconfigured",
      time: new Date().toISOString(),
      checks,
    },
    { status: ok ? 200 : 503 },
  );
}
