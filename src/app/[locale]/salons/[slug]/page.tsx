import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Clock, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export default async function SalonDetailPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("salons");
  const td = await getTranslations("pro.days");

  const establishment = await prisma.establishment.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true }, orderBy: { name: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
      staff: { where: { active: true } },
      openings: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!establishment) notFound();

  return (
    <>
      <SiteHeader mode="client" />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="lg:col-span-3">
            <h1 className="text-2xl font-semibold sm:text-3xl">{establishment.name}</h1>
            {establishment.description && (
              <p className="mt-3 text-foreground/70">{establishment.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground/65">
              {(establishment.address || establishment.city) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {[establishment.address, establishment.city]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>

            {establishment.photos.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {establishment.photos.map((p) => (
                  <div
                    key={p.id}
                    className="aspect-[4/3] rounded-xl bg-cover bg-center bg-accent-soft"
                    style={{ backgroundImage: `url(${p.url})` }}
                  />
                ))}
              </div>
            )}

            <section className="mt-10">
              <h2 className="text-xl font-semibold">{t("services")}</h2>
              <ul className="mt-4 divide-y divide-foreground/8 rounded-2xl border border-foreground/8 bg-white">
                {establishment.services.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-4"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-foreground/55">
                        {formatDuration(s.durationMinutes)}
                        {s.category ? ` · ${s.category}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-accent">
                        {formatPrice(s.priceCents)}
                      </span>
                      <Button
                        href={`/salons/${slug}/reserver?service=${s.id}`}
                        className="!px-4 !py-1.5 text-xs"
                      >
                        {t("book")}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-foreground/8 bg-white p-6">
              <h2 className="font-semibold">{t("hours")}</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {establishment.openings.map((o) => (
                  <li key={o.id} className="flex justify-between">
                    <span>{td(`full${o.dayOfWeek}`)}</span>
                    <span className="text-foreground/65">
                      {o.closed ? t("closed") : `${o.openTime} – ${o.closeTime}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {establishment.staff.length > 0 && (
              <div className="rounded-2xl border border-foreground/8 bg-white p-6">
                <h2 className="font-semibold">{t("team")}</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {establishment.staff.map((m) => (
                    <li key={m.id}>
                      {m.firstName} {m.lastName}
                      {m.role ? (
                        <span className="text-foreground/55"> — {m.role}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl bg-accent-soft p-6">
              <p className="flex items-center gap-2 text-sm font-medium text-accent">
                <Clock className="h-4 w-4" />
                {t("smsNote")}
              </p>
              <p className="mt-2 text-sm text-foreground/65">
                <Link href="/compte" className="underline">
                  {t("manageAccount")}
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
