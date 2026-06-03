import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return slug || `salon-${Date.now().toString(36)}`;
}

export async function uniqueEstablishmentSlug(
  name: string,
  findUnique: (slug: string) => Promise<{ id: string } | null>,
): Promise<string> {
  const base = slugify(name);
  let slug = base;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const taken = await findUnique(slug);
    if (!taken) return slug;
    slug = `${base.slice(0, 40)}-${Date.now().toString(36).slice(-4)}-${attempt}`;
  }

  return `salon-${Date.now().toString(36)}`;
}
