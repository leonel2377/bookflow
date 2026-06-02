import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveBookingSlot } from "@/lib/availability";
import { getClientProfileForUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const {
      establishmentId,
      serviceId,
      staffId,
      date,
      time,
      client: clientInput,
    } = body as {
      establishmentId: string;
      serviceId: string;
      staffId?: string;
      date: string;
      time: string;
      client: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        smsReminders?: boolean;
      };
    };

    if (!establishmentId || !serviceId || !date || !time) {
      return NextResponse.json({ error: "Données incomplètes" }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, establishmentId, active: true },
    });
    if (!service) {
      return NextResponse.json({ error: "Prestation introuvable" }, { status: 404 });
    }

    const resolved = await resolveBookingSlot({
      establishmentId,
      serviceId,
      date,
      time,
      staffId: staffId || undefined,
    });

    if (resolved.error) {
      return NextResponse.json({ error: resolved.error }, { status: 409 });
    }

    const { startAt, endAt } = resolved;
    const assignedStaffId = resolved.staffId;

    let clientId: string;

    if (session?.user?.role === UserRole.CLIENT) {
      const profile = await getClientProfileForUser(session.user.id);
      if (!profile) {
        return NextResponse.json({ error: "Profil client introuvable" }, { status: 400 });
      }
      await prisma.client.update({
        where: { id: profile.id },
        data: {
          firstName: clientInput?.firstName ?? profile.firstName,
          lastName: clientInput?.lastName ?? profile.lastName,
          phone: clientInput?.phone ?? profile.phone,
          smsReminders: clientInput?.smsReminders ?? profile.smsReminders,
        },
      });
      clientId = profile.id;
    } else {
      if (!clientInput?.email) {
        return NextResponse.json({ error: "E-mail requis" }, { status: 400 });
      }
      const email = clientInput.email.toLowerCase().trim();
      const client = await prisma.client.upsert({
        where: { email },
        create: {
          email,
          firstName: clientInput.firstName,
          lastName: clientInput.lastName,
          phone: clientInput.phone,
          smsReminders: clientInput.smsReminders ?? true,
        },
        update: {
          firstName: clientInput.firstName,
          lastName: clientInput.lastName,
          phone: clientInput.phone,
          smsReminders: clientInput.smsReminders ?? true,
        },
      });
      clientId = client.id;
    }

    const client = await prisma.client.findUniqueOrThrow({ where: { id: clientId } });

    const appointment = await prisma.appointment.create({
      data: {
        startAt,
        endAt,
        clientId,
        establishmentId,
        serviceId,
        staffId: assignedStaffId,
      },
    });

    if (client.smsReminders && client.phone) {
      console.info(`[SMS reminder scheduled] ${client.phone} — RDV ${startAt.toISOString()}`);
    }

    return NextResponse.json({ appointmentId: appointment.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
