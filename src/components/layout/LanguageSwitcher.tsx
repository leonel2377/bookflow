"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const LOCALE_LABELS: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  it: "IT",
};

export function LanguageSwitcher() {
  const t = useTranslations("lang");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full border border-foreground/10 bg-white/90 p-0.5 text-xs">
      <span className="sr-only">{t("label")}</span>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          title={t(loc)}
          onClick={() => router.replace(pathname, { locale: loc })}
          className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
            locale === loc
              ? "bg-accent text-white"
              : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
          }`}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
