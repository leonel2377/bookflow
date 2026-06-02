import { endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { SubscriptionPlan } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireProviderEstablishment } from "@/lib/pro";
import { formatPrice } from "@/lib/utils";

export default async function ProDashboardPage() {
  const t = await getTranslations("pro.dashboard");
  const tp = await getTranslations("plans");
  const { establishment } = await requireProviderEstablishment();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const [weekConfirmed, weekCancelled, monthNoShows, weekAppointments] =
    await Promise.all([
      prisma.appointment.count({
        where: {
          establishmentId: establishment.id,
          status: "CONFIRMED",
          startAt: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.appointment.count({
        where: {
          establishmentId: establishment.id,
          status: "CANCELLED",
          updatedAt: { gte: weekStart },
        },
      }),
      prisma.appointment.count({
        where: {
          establishmentId: establishment.id,
          status: "NO_SHOW",
          startAt: { gte: monthStart },
        },
      }),
      prisma.appointment.findMany({
        where: {
          establishmentId: establishment.id,
          status: "CONFIRMED",
          startAt: { gte: weekStart, lte: weekEnd },
        },
        include: { service: true },
      }),
    ]);

  const revenueCents = weekAppointments.reduce((sum, a) => sum + a.service.priceCents, 0);
  const staffCount = establishment.staff.length || 1;
  const openDays = establishment.openings.filter((o) => !o.closed).length || 5;
  const capacity = staffCount * openDays * 8;
  const fillRate =
    capacity > 0 ? Math.min(100, Math.round((weekConfirmed / capacity) * 100)) : 0;

  const isPremium = establishment.plan === SubscriptionPlan.PREMIUM;
  const planKey = establishment.plan === SubscriptionPlan.PREMIUM ? "premium" : "essential";

  return (
    <div>
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-foreground/70">
        {establishment.name} · {t("plan", { plan: tp(`${planKey}.label`) })}
        {!isPremium && (
          <span>
            {" "}
            —{" "}
            <Link href="/pro/tarifs" className="text-pro underline">
              {t("upgrade")}
            </Link>{" "}
            {t("upgradeHint")}
          </span>
        )}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t("weekAppt")} value={String(weekConfirmed)} />
        <Kpi label={t("fillRate")} value={`${fillRate} %`} hint={t("fillHint")} />
        <Kpi label={t("noShows")} value={String(monthNoShows)} />
        <Kpi
          label={t("revenue")}
          value={isPremium ? formatPrice(revenueCents) : "—"}
          hint={isPremium ? t("revenueHint") : t("premiumOnly")}
        />
      </div>

      {weekCancelled > 0 && (
        <p className="mt-6 text-sm text-foreground/60">
          {t("cancellations", { count: weekCancelled })}
        </p>
      )}

      <div className="mt-8">
        <Button href="/pro/planning" variant="pro">
          {t("viewPlanning")}
        </Button>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-foreground/8 bg-white p-6">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-pro">{value}</p>
      {hint && <p className="mt-1 text-xs text-foreground/45">{hint}</p>}
    </div>
  );
}
