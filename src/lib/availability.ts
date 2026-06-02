import {
  addMinutes,
  getDay,
  isBefore,
  isSameDay,
  parse,
  startOfDay,
} from "date-fns";
import { prisma } from "@/lib/prisma";

const SLOT_STEP_MINUTES = 15;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type StaffWindow = { staffId: string; startMin: number; endMin: number };

function generateSlotStarts(
  windowStart: number,
  windowEnd: number,
  durationMinutes: number,
): number[] {
  const slots: number[] = [];
  for (let t = windowStart; t + durationMinutes <= windowEnd; t += SLOT_STEP_MINUTES) {
    slots.push(t);
  }
  return slots;
}

function appointmentBlocksStaff(
  appt: { staffId: string | null; startAt: Date; endAt: Date },
  staffId: string,
  slotStart: Date,
  slotEnd: Date,
): boolean {
  if (appt.staffId !== null && appt.staffId !== staffId) return false;
  return appt.startAt < slotEnd && appt.endAt > slotStart;
}

export async function computeAvailableSlots(params: {
  establishmentId: string;
  serviceId: string;
  date: string;
  staffId?: string;
  excludeAppointmentId?: string;
}): Promise<string[]> {
  const { establishmentId, serviceId, date, staffId, excludeAppointmentId } = params;

  const dateObj = parse(date, "yyyy-MM-dd", new Date());
  const dayOfWeek = getDay(dateObj);

  const [service, opening, staffMembers, dayAppointments] = await Promise.all([
    prisma.service.findFirst({
      where: { id: serviceId, establishmentId, active: true },
    }),
    prisma.openingHours.findFirst({
      where: { establishmentId, dayOfWeek },
    }),
    prisma.staffMember.findMany({
      where: {
        establishmentId,
        active: true,
        ...(staffId ? { id: staffId } : {}),
      },
      include: { schedules: { where: { dayOfWeek } } },
    }),
    prisma.appointment.findMany({
      where: {
        establishmentId,
        status: "CONFIRMED",
        startAt: {
          gte: startOfDay(dateObj),
          lt: addMinutes(startOfDay(dateObj), 24 * 60),
        },
        ...(excludeAppointmentId ? { NOT: { id: excludeAppointmentId } } : {}),
      },
    }),
  ]);

  if (!service) return [];
  if (!opening || opening.closed) return [];

  const openMin = timeToMinutes(opening.openTime);
  const closeMin = timeToMinutes(opening.closeTime);
  const duration = service.durationMinutes;

  const appointments = dayAppointments.map((a) => ({
    staffId: a.staffId,
    startAt: a.startAt,
    endAt: a.endAt,
  }));

  const staffWindows: StaffWindow[] = staffMembers.map((s) => {
    const schedule = s.schedules[0];
    if (schedule) {
      return {
        staffId: s.id,
        startMin: timeToMinutes(schedule.startTime),
        endMin: timeToMinutes(schedule.endTime),
      };
    }
    return { staffId: s.id, startMin: openMin, endMin: closeMin };
  });

  if (staffWindows.length === 0) {
    staffWindows.push({ staffId: "__establishment__", startMin: openMin, endMin: closeMin });
  }

  const candidateStarts = new Set<number>();
  for (const w of staffWindows) {
    const start = Math.max(w.startMin, openMin);
    const end = Math.min(w.endMin, closeMin);
    for (const t of generateSlotStarts(start, end, duration)) {
      candidateStarts.add(t);
    }
  }

  const now = new Date();
  const available: string[] = [];

  for (const slotStart of Array.from(candidateStarts).sort((a, b) => a - b)) {
    const slotEnd = slotStart + duration;
    const slotStartDate = parse(
      `${date} ${minutesToTime(slotStart)}`,
      "yyyy-MM-dd HH:mm",
      new Date(),
    );
    const slotEndDate = addMinutes(slotStartDate, duration);
    if (isSameDay(dateObj, now) && isBefore(slotStartDate, now)) continue;

    const freeStaff = staffWindows.filter((w) => {
      if (slotStart < w.startMin || slotEnd > w.endMin) return false;
      if (w.staffId === "__establishment__") {
        return !appointments.some(
          (a) => a.startAt < slotEndDate && a.endAt > slotStartDate,
        );
      }
      return !appointments.some((a) =>
        appointmentBlocksStaff(a, w.staffId, slotStartDate, slotEndDate),
      );
    });

    if (freeStaff.length > 0) {
      available.push(minutesToTime(slotStart));
    }
  }

  return available;
}

export async function resolveBookingSlot(params: {
  establishmentId: string;
  serviceId: string;
  date: string;
  time: string;
  staffId?: string;
  excludeAppointmentId?: string;
}): Promise<{ startAt: Date; endAt: Date; staffId: string | null; error?: string }> {
  const slots = await computeAvailableSlots({
    establishmentId: params.establishmentId,
    serviceId: params.serviceId,
    date: params.date,
    staffId: params.staffId,
    excludeAppointmentId: params.excludeAppointmentId,
  });

  if (!slots.includes(params.time)) {
    return {
      startAt: new Date(),
      endAt: new Date(),
      staffId: null,
      error: "Ce créneau n'est plus disponible",
    };
  }

  const service = await prisma.service.findUniqueOrThrow({
    where: { id: params.serviceId },
  });

  const startAt = parse(
    `${params.date} ${params.time}`,
    "yyyy-MM-dd HH:mm",
    new Date(),
  );
  const endAt = addMinutes(startAt, service.durationMinutes);

  if (params.staffId) {
    return { startAt, endAt, staffId: params.staffId };
  }

  const dateObj = parse(params.date, "yyyy-MM-dd", new Date());
  const dayOfWeek = getDay(dateObj);
  const slotStart = timeToMinutes(params.time);
  const slotEnd = slotStart + service.durationMinutes;

  const [opening, staffMembers, dayAppointments] = await Promise.all([
    prisma.openingHours.findFirst({ where: { establishmentId: params.establishmentId, dayOfWeek } }),
    prisma.staffMember.findMany({
      where: { establishmentId: params.establishmentId, active: true },
      include: { schedules: { where: { dayOfWeek } } },
    }),
    prisma.appointment.findMany({
      where: {
        establishmentId: params.establishmentId,
        status: "CONFIRMED",
        startAt: { gte: startOfDay(dateObj), lt: addMinutes(startOfDay(dateObj), 24 * 60) },
        ...(params.excludeAppointmentId ? { NOT: { id: params.excludeAppointmentId } } : {}),
      },
    }),
  ]);

  const openMin = opening && !opening.closed ? timeToMinutes(opening.openTime) : 0;
  const closeMin = opening && !opening.closed ? timeToMinutes(opening.closeTime) : 24 * 60;

  const appointments = dayAppointments.map((a) => ({
    staffId: a.staffId,
    startAt: a.startAt,
    endAt: a.endAt,
  }));

  for (const s of staffMembers) {
    const schedule = s.schedules[0];
    const wStart = schedule ? timeToMinutes(schedule.startTime) : openMin;
    const wEnd = schedule ? timeToMinutes(schedule.endTime) : closeMin;
    if (slotStart < wStart || slotEnd > wEnd) continue;
    if (!appointments.some((a) => appointmentBlocksStaff(a, s.id, startAt, endAt))) {
      return { startAt, endAt, staffId: s.id };
    }
  }

  if (staffMembers.length === 0) {
    return { startAt, endAt, staffId: null };
  }

  return {
    startAt,
    endAt,
    staffId: null,
    error: "Ce créneau n'est plus disponible",
  };
}
