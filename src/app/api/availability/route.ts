import { NextResponse } from "next/server";
import { computeAvailableSlots } from "@/lib/availability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const establishmentId = searchParams.get("establishmentId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");
  const staffId = searchParams.get("staffId") ?? undefined;

  if (!establishmentId || !serviceId || !date) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const slots = await computeAvailableSlots({
    establishmentId,
    serviceId,
    date,
    staffId: staffId || undefined,
  });

  return NextResponse.json({ slots });
}
