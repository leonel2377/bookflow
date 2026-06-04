/** Ping minimal — pas de base de données (test si Node répond). */
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, time: new Date().toISOString() });
}
