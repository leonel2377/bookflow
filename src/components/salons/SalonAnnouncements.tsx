import { format } from "date-fns";
import { fr, enUS, it } from "date-fns/locale";
import { getLocale, getTranslations } from "next-intl/server";

type AnnouncementPhoto = {
  id: string;
  url: string;
  sortOrder: number;
};

type Announcement = {
  id: string;
  title: string;
  body: string | null;
  publishedAt: Date;
  photos: AnnouncementPhoto[];
};

const dateLocales = { fr, en: enUS, it } as const;

export async function SalonAnnouncements({
  announcements,
}: {
  announcements: Announcement[];
}) {
  if (announcements.length === 0) return null;

  const t = await getTranslations("salons");
  const locale = (await getLocale()) as keyof typeof dateLocales;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{t("announcements")}</h2>
      <p className="mt-1 text-sm text-foreground/55">{t("announcementsDesc")}</p>
      <ul className="mt-4 space-y-6">
        {announcements.map((a) => (
          <li
            key={a.id}
            className="overflow-hidden rounded-2xl border border-foreground/8 bg-white"
          >
            {a.photos.length > 0 && (
              <div
                className={
                  a.photos.length === 1
                    ? "aspect-[16/9] bg-accent-soft"
                    : "grid grid-cols-2 gap-0.5 sm:grid-cols-3"
                }
              >
                {a.photos.map((p) => (
                  <div
                    key={p.id}
                    className={
                      a.photos.length === 1
                        ? "h-full w-full bg-cover bg-center"
                        : "aspect-square bg-cover bg-center bg-accent-soft"
                    }
                    style={{ backgroundImage: `url(${p.url})` }}
                  />
                ))}
              </div>
            )}
            <div className="p-5">
              <p className="text-xs text-foreground/50">
                {format(a.publishedAt, "d MMMM yyyy", {
                  locale: dateLocales[locale] ?? fr,
                })}
              </p>
              <h3 className="mt-1 font-semibold">{a.title}</h3>
              {a.body && (
                <p className="mt-2 text-sm text-foreground/70 whitespace-pre-wrap">{a.body}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
