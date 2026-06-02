import type { Locale } from "@/i18n/routing";
import { enUS, fr, it } from "date-fns/locale";

export function getDateFnsLocale(locale: Locale) {
  switch (locale) {
    case "en":
      return enUS;
    case "it":
      return it;
    default:
      return fr;
  }
}
