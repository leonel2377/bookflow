"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { formatDistanceKm } from "@/lib/geo";

export type SalonListItem = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  distanceKm?: number;
  photos: { url: string }[];
  services: { priceCents: number }[];
};

type Props = {
  initialSalons: SalonListItem[];
};

export function SalonsList({ initialSalons }: Props) {
  const t = useTranslations("salons");
  const [salons, setSalons] = useState(initialSalons);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyActive, setNearbyActive] = useState(false);

  const resetList = useCallback(() => {
    setSalons(initialSalons);
    setNearbyActive(false);
    setError(null);
  }, [initialSalons]);

  const searchNearby = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t("geoUnsupported"));
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `/api/salons/nearby?lat=${latitude}&lng=${longitude}&radius=50`
          );
          const data = await res.json();

          if (!res.ok) {
            setError(data.error ?? t("geoError"));
            setLoading(false);
            return;
          }

          setSalons(data.salons);
          setNearbyActive(true);
          if (data.salons.length === 0) {
            setError(t("geoEmpty"));
          }
        } catch {
          setError(t("geoError"));
        } finally {
          setLoading(false);
        }
      },
      (geoErr) => {
        setLoading(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError(t("geoDenied"));
        } else {
          setError(t("geoError"));
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  }, [t]);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={searchNearby}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <span aria-hidden>📍</span>
          {loading ? t("geoLoading") : t("nearMe")}
        </button>
        {nearbyActive && (
          <button
            type="button"
            onClick={resetList}
            className="text-sm text-foreground/60 underline-offset-2 hover:underline"
          >
            {t("showAll")}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      {nearbyActive && salons.length > 0 && (
        <p className="mt-4 text-sm text-foreground/60">{t("sortedByDistance")}</p>
      )}

      {salons.length === 0 && !loading ? (
        <p className="mt-12 rounded-2xl border border-dashed border-foreground/15 bg-white p-10 text-center text-foreground/55">
          {t("empty")}
        </p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salons.map((e) => (
            <li key={e.id}>
              <Link
                href={`/salons/${e.slug}`}
                className="block overflow-hidden rounded-2xl border border-foreground/8 bg-white transition-shadow hover:shadow-md"
              >
                <div
                  className="h-36 bg-accent-soft bg-cover bg-center"
                  style={
                    e.photos[0]?.url
                      ? { backgroundImage: `url(${e.photos[0].url})` }
                      : undefined
                  }
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{e.name}</h2>
                    {e.distanceKm != null && (
                      <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        {formatDistanceKm(e.distanceKm)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-foreground/60">
                    {[e.city, e.address].filter(Boolean).join(" · ") || "—"}
                  </p>
                  {e.services[0] && (
                    <p className="mt-3 text-sm text-accent">
                      {t("from")} {formatPrice(e.services[0].priceCents)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
