import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";

export default async function ProTarifsPage() {
  const t = await getTranslations("pro.plansPage");
  const tp = await getTranslations("plans");

  const planKeys = ["essential", "premium"] as const;
  const addonKeys = ["shop", "website", "clockin"] as const;

  return (
    <div>
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-foreground/70">{t("subtitle")}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {planKeys.map((key) => {
          const features = tp.raw(`${key}.features`) as string[];
          const isPremium = key === "premium";
          return (
            <article
              key={key}
              className={`rounded-2xl border p-6 ${
                isPremium ? "border-pro bg-pro text-white" : "border-foreground/10 bg-white"
              }`}
            >
              <h2 className="text-xl font-semibold">{tp(`${key}.label`)}</h2>
              <p className={`mt-1 text-sm ${isPremium ? "text-white/80" : "text-foreground/65"}`}>
                {tp(`${key}.tagline`)}
              </p>
              <ul className="mt-6 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">{t("addons")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {addonKeys.map((key) => (
            <span
              key={key}
              className="rounded-full border border-foreground/10 bg-white px-4 py-2 text-sm"
            >
              {tp(`addons.${key}`)}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
