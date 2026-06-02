import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEstablishmentForProvider } from "@/lib/session";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PROVIDER) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const establishment = await getEstablishmentForProvider(session.user.id);
  if (!establishment) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const { name, durationMinutes, priceCents, category } = body as {
    name: string;
    durationMinutes: number;
    priceCents: number;
    category?: string;
  };

  if (!name?.trim() || !durationMinutes || priceCents == null) {
    return NextResponse.json({ error: "Champs invalides" }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      establishmentId: establishment.id,
      name: name.trim(),
      durationMinutes: Number(durationMinutes),
      priceCents: Math.round(Number(priceCents)),
      category: category?.trim() || null,
    },
  });

  return NextResponse.json({ service });
}
