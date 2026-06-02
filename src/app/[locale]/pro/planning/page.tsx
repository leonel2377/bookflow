import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlanningWeek } from "@/components/pro/PlanningWeek";
import type { Locale } from "@/i18n/routing";
import { getDateFnsLocale } from "@/lib/date-locale";
import { prisma } from "@/lib/prisma";
import { requireProviderEstablishment } from "@/lib/pro";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ week?: string }>;
};

export default async function ProPlanningPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pro.planning");
  const dateLocale = getDateFnsLocale(locale as Locale);
  const { establishment } = await requireProviderEstablishment();
  const { week } = await searchParams;

  const ref = week ? parseISO(week) : new Date();
  const weekStart = startOfWeek(ref, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(ref, { weekStartsOn: 1 });

  const appointments = await prisma.appointment.findMany({
    where: {
      establishmentId: establishment.id,
      startAt: { gte: weekStart, lte: weekEnd },
    },
    include: { client: true, service: true, staff: true },
    orderBy: { startAt: "asc" },
  });

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map((day) => ({
    date: format(day, "yyyy-MM-dd"),
    label: format(day, "EEEE d MMMM", { locale: dateLocale }),
    appointments: appointments
      .filter((a) => isSameDay(a.startAt, day))
      .map((a) => ({
        id: a.id,
        startAt: a.startAt.toISOString(),
        endAt: a.endAt.toISOString(),
        status: a.status,
        client: {
          firstName: a.client.firstName,
          lastName: a.client.lastName,
          phone: a.client.phone,
        },
        service: { name: a.service.name },
        staff: a.staff
          ? {
              firstName: a.staff.firstName,
              lastName: a.staff.lastName,
              color: a.staff.color,
            }
          : null,
      })),
  }));

  return (
    <div>
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-foreground/70">{t("subtitle", { name: establishment.name })}</p>
      <div className="mt-8">
        <PlanningWeek weekStart={format(weekStart, "yyyy-MM-dd")} days={days} />
      </div>
    </div>
  );
}
