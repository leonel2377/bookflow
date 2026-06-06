import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { distanceKm } from "@/lib/geo";

export const dynamic = "force-dynamic";

const DEFAULT_RADIUS_KM = 50;
const MAX_RADIUS_KM = 200;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radiusKm = Math.min(
    MAX_RADIUS_KM,
    Math.max(1, parseFloat(searchParams.get("radius") ?? "") || DEFAULT_RADIUS_KM)
  );

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  }

  try {
    const establishments = await prisma.establishment.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        services: { where: { active: true }, take: 1, orderBy: { priceCents: "asc" } },
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    const withDistance = establishments
      .map((e) => ({
        ...e,
        distanceKm: distanceKm(lat, lng, e.latitude!, e.longitude!),
      }))
      .filter((e) => e.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({
      salons: withDistance.map(({ distanceKm: d, ...rest }) => ({
        ...rest,
        distanceKm: Math.round(d * 10) / 10,
      })),
      meta: { lat, lng, radiusKm, count: withDistance.length },
    });
  } catch (err) {
    console.error("[salons/nearby]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
