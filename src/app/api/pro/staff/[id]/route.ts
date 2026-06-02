import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProEstablishmentId } from "@/lib/pro-api";

type Params = { params: Promise<{ id: string }> };

type ScheduleInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

async function ownsStaff(staffId: string, establishmentId: string) {
  return prisma.staffMember.findFirst({
    where: { id: staffId, establishmentId },
    include: { schedules: { orderBy: { dayOfWeek: "asc" } } },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const establishmentId = await getProEstablishmentId();
  if (!establishmentId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const member = await ownsStaff(id, establishmentId);
  if (!member) {
    return NextResponse.json({ error: "Collaborateur introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const { firstName, lastName, role, color, active, schedules } = body as {
    firstName?: string;
    lastName?: string;
    role?: string;
    color?: string;
    active?: boolean;
    schedules?: ScheduleInput[];
  };

  await prisma.staffMember.update({
    where: { id },
    data: {
      ...(firstName !== undefined && { firstName: firstName.trim() }),
      ...(lastName !== undefined && { lastName: lastName.trim() }),
      ...(role !== undefined && { role: role.trim() || null }),
      ...(color !== undefined && { color }),
      ...(active !== undefined && { active }),
    },
  });

  if (schedules && Array.isArray(schedules)) {
    for (const s of schedules) {
      if (s.dayOfWeek < 0 || s.dayOfWeek > 6) continue;
      const existing = await prisma.staffSchedule.findFirst({
        where: { staffId: id, dayOfWeek: s.dayOfWeek },
      });
      if (existing) {
        await prisma.staffSchedule.update({
          where: { id: existing.id },
          data: { startTime: s.startTime, endTime: s.endTime },
        });
      } else {
        await prisma.staffSchedule.create({
          data: {
            staffId: id,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
          },
        });
      }
    }
  }

  const updated = await prisma.staffMember.findUnique({
    where: { id },
    include: { schedules: { orderBy: { dayOfWeek: "asc" } } },
  });

  return NextResponse.json({ staff: updated });
}
