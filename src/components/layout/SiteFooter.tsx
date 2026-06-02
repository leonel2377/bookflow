"use client";

import { Globe, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const CONTACT_EMAIL = "l.awambo@yahoo.fr";
const CONTACT_PHONE_DISPLAY = "328 537 5381";
const CONTACT_PHONE_TEL = "+393285375381";
const COMPANY_WEBSITE = "https://stkmsoft.online";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-foreground/10 bg-gradient-to-b from-[#1a0a2e] to-[#12061f] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <Image
              src="/stkm-soft-logo.png"
              alt={t("company")}
              width={72}
              height={72}
              className="h-16 w-16 shrink-0 rounded-xl object-contain"
            />
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#ff8c42]">
                {t("company")}
              </p>
              <p className="mt-1 text-sm text-white/75">{t("tagline")}</p>
              <p className="mt-3 max-w-sm text-xs text-white/55">{t("pitch")}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#ff8c42]">
              {t("contactTitle")}
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-[#ff8c42]"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[#ff8c42]" aria-hidden />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT_PHONE_TEL}`}
                  className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-[#ff8c42]"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#ff8c42]" aria-hidden />
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={COMPANY_WEBSITE}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-[#ff8c42]"
                >
                  <Globe className="h-4 w-4 shrink-0 text-[#ff8c42]" aria-hidden />
                  stkmsoft.online
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
