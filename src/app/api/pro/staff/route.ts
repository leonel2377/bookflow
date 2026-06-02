import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProEstablishmentId } from "@/lib/pro-api";

const DEFAULT_COLORS = ["#8b5a6b", "#2d4a3e", "#5a6b8b", "#8b735a"];

export async function POST(request: Request) {
  const establishmentId = await getProEstablishmentId();
  if (!establishmentId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { firstName, lastName, role, color } = body as {
    firstName: string;
    lastName: string;
    role?: string;
    color?: string;
  };

  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const count = await prisma.staffMember.count({ where: { establishmentId } });
  const openings = await prisma.openingHours.findMany({
    where: { establishmentId, closed: false },
  });

  const staff = await prisma.staffMember.create({
    data: {
      establishmentId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role?.trim() || null,
      color: color || DEFAULT_COLORS[count % DEFAULT_COLORS.length],
      schedules: {
        create: openings.map((o) => ({
          dayOfWeek: o.dayOfWeek,
          startTime: o.openTime,
          endTime: o.closeTime,
        })),
      },
    },
    include: { schedules: { orderBy: { dayOfWeek: "asc" } } },
  });

  return NextResponse.json({ staff });
}
