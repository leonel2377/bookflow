import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SalonsList } from "@/components/salons/SalonsList";
import { prisma } from "@/lib/prisma";

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
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-foreground/70">{t("subtitle")}</p>

        <SalonsList initialSalons={establishments} />
      </main>
    </>
  );
}
