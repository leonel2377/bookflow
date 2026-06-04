import { UserRole } from "@prisma/client";
import { endOfWeek, startOfWeek } from "date-fns";
import { BarChart3, CalendarDays, ExternalLink, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { getProviderEstablishment } from "@/lib/pro";
import { prisma } from "@/lib/prisma";

export default async function ProHomePage() {
  const t = await getTranslations("pro");
  const session = await auth();
  const isProvider = session?.user?.role === UserRole.PROVIDER;

  const modules = [
    { href: "/pro/planning", icon: CalendarDays, key: "planning" as const },
    { href: "/pro/tarifs", icon: Wallet, key: "plans" as const },
    { href: "/pro/tableau-de-bord", icon: BarChart3, key: "dashboard" as const },
  ];

  let establishment = null;
  let todayCount = 0;

  if (isProvider && session?.user?.id) {
    establishment = await getProviderEstablishment(session.user.id);
    if (establishment) {
      const now = new Date();
      todayCount = await prisma.appointment.count({
        where: {
          establishmentId: establishment.id,
          status: "CONFIRMED",
          startAt: {
            gte: startOfWeek(now, { weekStartsOn: 1 }),
            lte: endOfWeek(now, { weekStartsOn: 1 }),
          },
        },
      });
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      {establishment ? (
        <p className="mt-2 max-w-2xl text-foreground/70">
          {t("welcome", { name: establishment.name, count: todayCount })}
        </p>
      ) : (
        <p className="mt-2 max-w-2xl text-foreground/70">{t("subtitle")}</p>
      )}

      {!isProvider && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/pro/devenir-partenaire" variant="pro">
            {t("discover")}
          </Button>
          <Button href="/pro/connexion" variant="secondary">
            {t("login")}
          </Button>
          <Button href="/pro/inscription" variant="secondary">
            {t("createAccount")}
          </Button>
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {modules.map(({ href, icon: Icon, key }) => (
          <Link
            key={href}
            href={isProvider ? href : "/pro/connexion"}
            className="group rounded-2xl border border-foreground/8 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pro-soft text-pro">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-medium group-hover:text-pro">{t(`modules.${key}.title`)}</h2>
            <p className="mt-2 text-sm text-foreground/65">{t(`modules.${key}.desc`)}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-pro-soft p-6 md:p-8">
        <h2 className="text-lg font-semibold text-pro">{t("configure")}</h2>
        <p className="mt-2 text-sm text-foreground/70">{t("configureDesc")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href={isProvider ? "/pro/etablissement" : "/pro/connexion"} variant="pro">
            {t("myEstablishment")}
          </Button>
          {establishment && (
            <Link
              href={`/salons/${establishment.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-full border border-pro/20 px-5 py-2.5 text-sm font-medium text-pro hover:bg-white"
            >
              {t("publicPage")}
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
