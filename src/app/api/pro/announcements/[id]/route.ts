import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  deleteLocalUpload,
  ImageUploadError,
  saveAnnouncementImages,
} from "@/lib/image-upload";
import { requireProEstablishment } from "@/lib/pro-route-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function getOwnAnnouncement(id: string, establishmentId: string) {
  return prisma.announcement.findFirst({
    where: { id, establishmentId },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireProEstablishment();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const existing = await getOwnAnnouncement(id, authResult.establishment.id);
  if (!existing) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const titleRaw = formData.get("title");
      const bodyRaw = formData.get("body");
      const publishedRaw = formData.get("published");
      const files = formData
        .getAll("photos")
        .filter((f): f is File => f instanceof File && f.size > 0);

      const totalPhotos = existing.photos.length + files.length;
      if (totalPhotos > 8) {
        return NextResponse.json(
          { error: "Maximum 8 photos par annonce" },
          { status: 400 },
        );
      }

      const newUrls =
        files.length > 0
          ? await saveAnnouncementImages(authResult.establishment.id, files)
          : [];

      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          ...(titleRaw != null && { title: String(titleRaw).trim() }),
          ...(bodyRaw != null && { body: String(bodyRaw).trim() || null }),
          ...(publishedRaw != null && { published: publishedRaw !== "false" }),
          ...(newUrls.length > 0 && {
            photos: {
              create: newUrls.map((url, index) => ({
                url,
                sortOrder: existing.photos.length + index,
              })),
            },
          }),
        },
        include: { photos: { orderBy: { sortOrder: "asc" } } },
      });

      return NextResponse.json({ announcement });
    }

    const body = (await request.json()) as {
      title?: string;
      body?: string | null;
      published?: boolean;
    };

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.body !== undefined && { body: body.body?.trim() || null }),
        ...(body.published !== undefined && { published: body.published }),
      },
      include: { photos: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ announcement });
  } catch (err) {
    if (err instanceof ImageUploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("PATCH /api/pro/announcements/[id]", err);
    return NextResponse.json({ error: "Impossible de modifier l'annonce" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireProEstablishment();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const existing = await getOwnAnnouncement(id, authResult.establishment.id);
  if (!existing) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }

  await prisma.announcement.delete({ where: { id } });
  await Promise.all(existing.photos.map((p) => deleteLocalUpload(p.url)));

  return NextResponse.json({ ok: true });
}
