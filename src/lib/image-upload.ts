import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS_PER_ANNOUNCEMENT = 8;

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

function extensionForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return "webp";
}

export function isLocalUploadUrl(url: string): boolean {
  return url.startsWith("/uploads/announcements/");
}

export async function saveAnnouncementImages(
  establishmentId: string,
  files: File[],
): Promise<string[]> {
  if (files.length === 0) return [];
  if (files.length > MAX_PHOTOS_PER_ANNOUNCEMENT) {
    throw new ImageUploadError(`Maximum ${MAX_PHOTOS_PER_ANNOUNCEMENT} photos par annonce`);
  }

  const dir = path.join(process.cwd(), "public", "uploads", "announcements", establishmentId);
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new ImageUploadError("Format accepté : JPG, PNG ou WebP");
    }
    if (file.size > MAX_BYTES) {
      throw new ImageUploadError("Chaque photo doit faire moins de 5 Mo");
    }

    const ext = extensionForMime(file.type);
    const name = `${randomBytes(16).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buffer);
    urls.push(`/uploads/announcements/${establishmentId}/${name}`);
  }

  return urls;
}

export async function deleteLocalUpload(url: string): Promise<void> {
  if (!isLocalUploadUrl(url)) return;
  const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  try {
    await unlink(filePath);
  } catch {
    // fichier déjà absent
  }
}
