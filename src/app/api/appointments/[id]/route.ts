import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveBookingSlot } from "@/lib/availability";
import { getClientProfileForUser } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

async function assertClientOwnsAppointment(appointmentId: string, userId: string) {
  const profile = await getClientProfileForUser(userId);
  if (!profile) return false;

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, clientId: profile.id },
  });
  return !!appointment;
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.CLIENT) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const owns = await assertClientOwnsAppointment(id, session.user.id);
  if (!owns) {
    return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const { action, date, time } = body as {
    action: "cancel" | "reschedule";
    date?: string;
    time?: string;
  };

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
  }

  if (action === "cancel") {
    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "reschedule" && date && time) {
    const resolved = await resolveBookingSlot({
      establishmentId: appointment.establishmentId,
      serviceId: appointment.serviceId,
      date,
      time,
      staffId: appointment.staffId ?? undefined,
      excludeAppointmentId: id,
    });

    if (resolved.error) {
      return NextResponse.json({ error: resolved.error }, { status: 409 });
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        startAt: resolved.startAt,
        endAt: resolved.endAt,
        staffId: resolved.staffId ?? appointment.staffId,
        reminderSentAt: null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
