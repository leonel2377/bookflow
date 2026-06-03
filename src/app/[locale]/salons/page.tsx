import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function fetchSalons() {
  return prisma.establishment.findMany({
    include: {
      services: { where: { active: true }, take: 1, orderBy: { priceCents: "asc" } },
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });
}

type SalonCard = Awaited<ReturnType<typeof fetchSalons>>[number];

export default async function SalonsPage() {
  const t = await getTranslations("salons");

  let establishments: SalonCard[] = [];

  try {
    establishments = await fetchSalons();
  } catch (err) {
    console.error("[salons] DB error:", err);
  }

  return (
    <>
      <SiteHeader mode="client" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-foreground/70">{t("subtitle")}</p>

        {establishments.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-foreground/15 bg-white p-10 text-center text-foreground/55">
            {t("empty")}
          </p>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {establishments.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/salons/${e.slug}`}
                  className="block overflow-hidden rounded-2xl border border-foreground/8 bg-white transition-shadow hover:shadow-md"
                >
                  <div
                    className="h-36 bg-accent-soft bg-cover bg-center"
                    style={
                      e.photos[0]?.url
                        ? { backgroundImage: `url(${e.photos[0].url})` }
                        : undefined
                    }
                  />
                  <div className="p-5">
                    <h2 className="font-semibold">{e.name}</h2>
                    <p className="mt-1 text-sm text-foreground/60">
                      {[e.city, e.address].filter(Boolean).join(" · ") || "—"}
                    </p>
                    {e.services[0] && (
                      <p className="mt-3 text-sm text-accent">
                        {t("from")} {formatPrice(e.services[0].priceCents)}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
