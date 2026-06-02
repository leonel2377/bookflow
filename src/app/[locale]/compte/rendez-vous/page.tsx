import { format } from "date-fns";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AppointmentActions } from "@/components/account/AppointmentActions";
import { redirect } from "@/i18n/navigation";
import { getDateFnsLocale } from "@/lib/date-locale";
import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getClientProfileForUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ confirmed?: string }>;
};

export default async function MesRdvPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const dateLocale = getDateFnsLocale(locale as Locale);

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect({ href: "/connexion", locale: locale as Locale });
    return null;
  }
  const profile = await getClientProfileForUser(userId);
  if (!profile) {
    return (
      <div>
        <h1 className="text-3xl font-semibold">{t("appointmentsTitle")}</h1>
        <p className="mt-4 text-sm text-foreground/65">{t("incompleteProfile")}</p>
      </div>
    );
  }

  const { confirmed } = await searchParams;

  const appointments = await prisma.appointment.findMany({
    where: { clientId: profile.id },
    include: { establishment: true, service: true, staff: true },
    orderBy: { startAt: "asc" },
  });

  const upcoming = appointments.filter(
    (a) => a.status === "CONFIRMED" && a.startAt >= new Date(),
  );
  const past = appointments.filter(
    (a) => a.startAt < new Date() || a.status !== "CONFIRMED",
  );

  return (
    <div>
      <h1 className="text-3xl font-semibold">{t("appointmentsTitle")}</h1>
      {confirmed && (
        <p className="mt-3 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
          {t("confirmedBanner")}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium">{t("upcoming")}</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/55">{t("noUpcoming")}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-foreground/8 bg-white p-5"
              >
                <p className="font-medium">{a.establishment.name}</p>
                <p className="text-sm text-foreground/65">
                  {a.service.name} · {formatPrice(a.service.priceCents)}
                </p>
                <p className="mt-2 text-sm">
                  {format(a.startAt, "EEEE d MMMM yyyy 'à' HH:mm", { locale: dateLocale })}
                  {a.staff ? ` — ${a.staff.firstName} ${a.staff.lastName}` : ""}
                </p>
                <AppointmentActions appointmentId={a.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium text-foreground/70">{t("history")}</h2>
          <ul className="mt-4 space-y-3">
            {past.map((a) => (
              <li key={a.id} className="text-sm text-foreground/55">
                {a.establishment.name} —{" "}
                {format(a.startAt, "d/MM/yyyy", { locale: dateLocale })} ({a.status})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
