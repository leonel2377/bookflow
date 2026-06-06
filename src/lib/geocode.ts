/** Géocodage via Nominatim (OpenStreetMap) — usage modéré requis. */
export async function geocodeAddress(
  address?: string | null,
  city?: string | null
): Promise<{ latitude: number; longitude: number } | null> {
  const parts = [address, city].filter(Boolean).map((s) => s!.trim());
  if (parts.length === 0) return null;

  const q = encodeURIComponent(parts.join(", "));
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "BOOKFLOW/1.0 (salon booking app)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data[0]) return null;

    const latitude = parseFloat(data[0].lat);
    const longitude = parseFloat(data[0].lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

    return { latitude, longitude };
  } catch {
    return null;
  }
}
