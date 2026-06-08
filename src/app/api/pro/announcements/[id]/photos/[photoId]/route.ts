import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteLocalUpload } from "@/lib/image-upload";
import { requireProEstablishment } from "@/lib/pro-route-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; photoId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireProEstablishment();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id, photoId } = await params;

  const photo = await prisma.announcementPhoto.findFirst({
    where: {
      id: photoId,
      announcementId: id,
      announcement: { establishmentId: authResult.establishment.id },
    },
  });

  if (!photo) {
    return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
  }

  await prisma.announcementPhoto.delete({ where: { id: photoId } });
  await deleteLocalUpload(photo.url);

  return NextResponse.json({ ok: true });
}
