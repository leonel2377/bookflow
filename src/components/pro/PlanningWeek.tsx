"use client";

import { format, parseISO } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getDateFnsLocale } from "@/lib/date-locale";

type Appointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  client: { firstName: string; lastName: string; phone: string | null };
  service: { name: string };
  staff: { firstName: string; lastName: string; color: string | null } | null;
};

type DayGroup = {
  date: string;
  label: string;
  appointments: Appointment[];
};

export function PlanningWeek({
  weekStart,
  days,
}: {
  weekStart: string;
  days: DayGroup[];
}) {
  const t = useTranslations("pro.planning");
  const locale = useLocale() as Locale;
  const dateLocale = getDateFnsLocale(locale);
  const router = useRouter();

  function shiftWeek(delta: number) {
    const d = parseISO(weekStart);
    d.setDate(d.getDate() + delta * 7);
    router.push(`/pro/planning?week=${format(d, "yyyy-MM-dd")}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => shiftWeek(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 hover:bg-foreground/5"
          aria-label="Semaine précédente"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-sm font-medium capitalize">
          {format(parseISO(weekStart), "d MMMM yyyy", { locale: dateLocale })}
        </p>
        <button
          type="button"
          onClick={() => shiftWeek(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 hover:bg-foreground/5"
          aria-label="Semaine suivante"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {days.map((day) => (
          <section
            key={day.date}
            className="rounded-2xl border border-foreground/8 bg-white overflow-hidden"
          >
            <header className="border-b border-foreground/5 bg-pro-soft/50 px-4 py-2">
              <h2 className="text-sm font-semibold text-pro capitalize">{day.label}</h2>
            </header>
            {day.appointments.length === 0 ? (
              <p className="px-4 py-6 text-sm text-foreground/45">{t("noAppt")}</p>
            ) : (
              <ul className="divide-y divide-foreground/5">
                {day.appointments.map((a) => (
                  <li key={a.id} className="flex gap-4 px-4 py-3">
                    <div
                      className="w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: a.staff?.color ?? "#8b5a6b" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">
                        {format(parseISO(a.startAt), "HH:mm")} –{" "}
                        {format(parseISO(a.endAt), "HH:mm")}
                        <span className="ml-2 font-normal text-foreground/55">
                          {a.service.name}
                        </span>
                      </p>
                      <p className="text-sm text-foreground/70">
                        {a.client.firstName} {a.client.lastName}
                        {a.client.phone ? ` · ${a.client.phone}` : ""}
                      </p>
                      {a.staff && (
                        <p className="text-xs text-foreground/50">
                          {a.staff.firstName} {a.staff.lastName}
                        </p>
                      )}
                      {a.status !== "CONFIRMED" && (
                        <span className="mt-1 inline-block rounded-full bg-foreground/10 px-2 py-0.5 text-xs">
                          {a.status}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-foreground/50">
        <Link
          href={`/pro/planning?week=${format(new Date(), "yyyy-MM-dd")}`}
          className="underline"
        >
          {t("currentWeek")}
        </Link>
      </p>
    </div>
  );
}
