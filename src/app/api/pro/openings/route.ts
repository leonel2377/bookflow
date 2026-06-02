import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProEstablishmentId } from "@/lib/pro-api";

type OpeningInput = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  closed: boolean;
};

export async function PUT(request: Request) {
  const establishmentId = await getProEstablishmentId();
  if (!establishmentId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { openings } = body as { openings: OpeningInput[] };

  if (!Array.isArray(openings) || openings.length === 0) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  for (const o of openings) {
    if (o.dayOfWeek < 0 || o.dayOfWeek > 6) continue;

    const existing = await prisma.openingHours.findFirst({
      where: { establishmentId, dayOfWeek: o.dayOfWeek },
    });

    if (existing) {
      await prisma.openingHours.update({
        where: { id: existing.id },
        data: {
          openTime: o.openTime,
          closeTime: o.closeTime,
          closed: o.closed,
        },
      });
    } else {
      await prisma.openingHours.create({
        data: {
          establishmentId,
          dayOfWeek: o.dayOfWeek,
          openTime: o.openTime,
          closeTime: o.closeTime,
          closed: o.closed,
        },
      });
    }
  }

  const updated = await prisma.openingHours.findMany({
    where: { establishmentId },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ openings: updated });
}
