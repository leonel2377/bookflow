import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ImageUploadError, saveAnnouncementImages } from "@/lib/image-upload";
import { requireProEstablishment } from "@/lib/pro-route-auth";

export const runtime = "nodejs";

export async function GET() {
  const authResult = await requireProEstablishment();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const announcements = await prisma.announcement.findMany({
    where: { establishmentId: authResult.establishment.id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const authResult = await requireProEstablishment();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim() || null;
    const published = formData.get("published") !== "false";
    const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);

    if (!title) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    }

    const photoUrls = await saveAnnouncementImages(authResult.establishment.id, files);

    const announcement = await prisma.announcement.create({
      data: {
        establishmentId: authResult.establishment.id,
        title,
        body,
        published,
        photos: {
          create: photoUrls.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
      },
      include: { photos: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ announcement });
  } catch (err) {
    if (err instanceof ImageUploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("POST /api/pro/announcements", err);
    return NextResponse.json({ error: "Impossible de créer l'annonce" }, { status: 500 });
  }
}
