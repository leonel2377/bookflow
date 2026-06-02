"use client";

import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-foreground/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight">{t("company")}</p>
            <p className="mt-1 text-sm text-foreground/60">{t("title")}</p>
          </div>
          <div className="text-sm text-foreground/70">
            <span className="text-foreground/50">{t("websiteLabel")} </span>
            <a
              href="https://stkmsoft.online"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              stkmsoft.online
            </a>
          </div>
        </div>
        <p className="mt-6 text-xs text-foreground/45">{t("copyright")}</p>
      </div>
    </footer>
  );
}

