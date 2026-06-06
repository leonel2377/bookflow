import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { geocodeAddress } from "@/lib/geocode";
import { prisma } from "@/lib/prisma";
import { getEstablishmentForProvider } from "@/lib/session";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PROVIDER) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const establishment = await getEstablishmentForProvider(session.user.id);
  if (!establishment) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const { name, description, address, city, phone, email } = body as {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  const trimmedAddress = address?.trim() || null;
  const trimmedCity = city?.trim() || null;

  let latitude: number | null = establishment.latitude;
  let longitude: number | null = establishment.longitude;
  const addressChanged =
    trimmedAddress !== establishment.address || trimmedCity !== establishment.city;

  if (addressChanged && (trimmedAddress || trimmedCity)) {
    const coords = await geocodeAddress(trimmedAddress, trimmedCity);
    if (coords) {
      latitude = coords.latitude;
      longitude = coords.longitude;
    }
  } else if (!trimmedAddress && !trimmedCity) {
    latitude = null;
    longitude = null;
  }

  const updated = await prisma.establishment.update({
    where: { id: establishment.id },
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      address: trimmedAddress,
      city: trimmedCity,
      latitude,
      longitude,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
    },
  });

  return NextResponse.json({ establishment: updated });
}
