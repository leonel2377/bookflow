import { getTranslations } from "next-intl/server";
import { AnnouncementsManager } from "@/components/pro/AnnouncementsManager";
import { requireProviderEstablishment } from "@/lib/pro";
import { prisma } from "@/lib/prisma";

export default async function ProAnnouncementsPage() {
  const t = await getTranslations("pro.announcements");
  const { establishment } = await requireProviderEstablishment();

  const announcements = await prisma.announcement.findMany({
    where: { establishmentId: establishment.id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { publishedAt: "desc" },
  });

  const serialized = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    published: a.published,
    publishedAt: a.publishedAt.toISOString(),
    photos: a.photos.map((p) => ({
      id: p.id,
      url: p.url,
      sortOrder: p.sortOrder,
    })),
  }));

  return (
    <div className="space-y-6 pb-24 md:pb-10">
      <div>
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-foreground/70">{t("subtitle")}</p>
      </div>
      <AnnouncementsManager announcements={serialized} />
    </div>
  );
}
