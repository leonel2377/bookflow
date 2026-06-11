export type ProOnboardingStep = {
  id: "profile" | "services" | "hours" | "announcement";
  done: boolean;
  href: string;
};

export type ProOnboardingInput = {
  description: string | null;
  address: string | null;
  phone: string | null;
  servicesCount: number;
  openings: { closed: boolean }[];
  announcementsCount: number;
};

export function getProOnboardingSteps(input: ProOnboardingInput): ProOnboardingStep[] {
  const profileDone = Boolean(
    input.description?.trim() || input.address?.trim() || input.phone?.trim(),
  );
  const servicesDone = input.servicesCount > 0;
  const hoursDone = input.openings.some((o) => !o.closed);
  const announcementDone = input.announcementsCount > 0;

  return [
    { id: "profile", done: profileDone, href: "/pro/etablissement" },
    { id: "services", done: servicesDone, href: "/pro/etablissement" },
    { id: "hours", done: hoursDone, href: "/pro/etablissement" },
    { id: "announcement", done: announcementDone, href: "/pro/actualites" },
  ];
}

export function getProOnboardingProgress(steps: ProOnboardingStep[]): number {
  if (steps.length === 0) return 100;
  return Math.round((steps.filter((s) => s.done).length / steps.length) * 100);
}

export function isProOnboardingComplete(steps: ProOnboardingStep[]): boolean {
  return steps.every((s) => s.done);
}
