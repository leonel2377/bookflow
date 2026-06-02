import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEstablishmentForProvider } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

async function assertOwnsService(serviceId: string, establishmentId: string) {
  return prisma.service.findFirst({
    where: { id: serviceId, establishmentId },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PROVIDER) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const establishment = await getEstablishmentForProvider(session.user.id);
  if (!establishment) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  const { id } = await params;
  const service = await assertOwnsService(id, establishment.id);
  if (!service) {
    return NextResponse.json({ error: "Prestation introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const { active, name, durationMinutes, priceCents, category } = body as {
    active?: boolean;
    name?: string;
    durationMinutes?: number;
    priceCents?: number;
    category?: string;
  };

  const updated = await prisma.service.update({
    where: { id },
    data: {
      ...(active !== undefined && { active }),
      ...(name !== undefined && { name: name.trim() }),
      ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
      ...(priceCents !== undefined && { priceCents: Math.round(Number(priceCents)) }),
      ...(category !== undefined && { category: category?.trim() || null }),
    },
  });

  return NextResponse.json({ service: updated });
}
