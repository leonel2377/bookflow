import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_ACCOUNTS, runDemoSeed } from "@/lib/demo-seed";

export const dynamic = "force-dynamic";

/** POST — crée/met à jour les comptes démo (protégé par SEED_DEMO_SECRET). */
export async function POST(request: Request) {
  const expected = process.env.SEED_DEMO_SECRET?.trim();
  const provided = request.headers.get("x-seed-secret")?.trim();

  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { salon } = await runDemoSeed(prisma);
    return NextResponse.json({
      ok: true,
      salon: `/salons/${salon.slug}`,
      accounts: DEMO_ACCOUNTS,
    });
  } catch (err) {
    console.error("[seed-demo]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
