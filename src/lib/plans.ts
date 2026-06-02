import { SubscriptionPlan, SubscriptionAddon } from "@prisma/client";

export const PLANS = {
  ESSENTIEL: {
    id: SubscriptionPlan.ESSENTIEL,
    label: "Essentiel",
    tagline: "Référencement, réservation en ligne et planning",
    features: [
      "Fiche établissement visible",
      "Prise de rendez-vous en ligne",
      "Planning équipe",
      "Notifications clients",
    ],
  },
  PREMIUM: {
    id: SubscriptionPlan.PREMIUM,
    label: "Premium",
    tagline: "Essentiel + caisse et outils avancés",
    features: [
      "Tout Essentiel",
      "Logiciel de caisse",
      "Statistiques avancées",
      "Fidélisation & campagnes",
    ],
  },
} as const;

export const ADDONS = {
  BOUTIQUE_EN_LIGNE: {
    id: SubscriptionAddon.BOUTIQUE_EN_LIGNE,
    label: "Boutique en ligne",
  },
  SITE_INTERNET: {
    id: SubscriptionAddon.SITE_INTERNET,
    label: "Site internet",
  },
  POINTAGE_EQUIPES: {
    id: SubscriptionAddon.POINTAGE_EQUIPES,
    label: "Pointage des équipes",
  },
} as const;

export function parseAddons(json: string): SubscriptionAddon[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is SubscriptionAddon =>
      Object.values(SubscriptionAddon).includes(v as SubscriptionAddon),
    );
  } catch {
    return [];
  }
}
