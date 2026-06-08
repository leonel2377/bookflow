"use client";

import { format } from "date-fns";
import { fr, enUS, it } from "date-fns/locale";
import { ImagePlus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string | null;
  published: boolean;
  publishedAt: string;
  photos: { id: string; url: string; sortOrder: number }[];
};

const dateLocales = { fr, en: enUS, it } as const;

export function AnnouncementsManager({
  announcements: initial,
}: {
  announcements: AnnouncementItem[];
}) {
  const t = useTranslations("pro.announcements");
  const locale = useLocale() as keyof typeof dateLocales;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [announcements, setAnnouncements] = useState(initial);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "mt-1 w-full rounded-xl border border-foreground/12 bg-white px-3 py-2 text-sm outline-none focus:border-pro";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    const combined = [...files, ...selected].slice(0, 8);
    setFiles(combined);
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return combined.map((f) => URL.createObjectURL(f));
    });
    e.target.value = "";
  }

  function removePendingFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function createAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      formData.append("published", "true");
      files.forEach((file) => formData.append("photos", file));

      const res = await fetch("/api/pro/announcements", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("createError"));

      setAnnouncements((list) => [data.announcement, ...list]);
      setTitle("");
      setBody("");
      setFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("createError"));
    } finally {
      setLoading(false);
    }
  }

  async function togglePublished(id: string, published: boolean) {
    const res = await fetch(`/api/pro/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    if (res.ok) {
      const data = await res.json();
      setAnnouncements((list) =>
        list.map((a) => (a.id === id ? data.announcement : a)),
      );
      router.refresh();
    }
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    const res = await fetch(`/api/pro/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnouncements((list) => list.filter((a) => a.id !== id));
      router.refresh();
    }
  }

  async function deletePhoto(announcementId: string, photoId: string) {
    const res = await fetch(
      `/api/pro/announcements/${announcementId}/photos/${photoId}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      setAnnouncements((list) =>
        list.map((a) =>
          a.id === announcementId
            ? { ...a, photos: a.photos.filter((p) => p.id !== photoId) }
            : a,
        ),
      );
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={createAnnouncement}
        className="rounded-2xl border border-dashed border-pro/30 bg-pro-soft/30 p-6 space-y-4"
      >
        <h2 className="font-semibold text-pro">{t("newTitle")}</h2>
        <p className="text-sm text-foreground/65">{t("newDesc")}</p>

        <label className="block text-sm">
          {t("fieldTitle")}
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
            placeholder={t("titlePlaceholder")}
          />
        </label>

        <label className="block text-sm">
          {t("fieldBody")}
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            placeholder={t("bodyPlaceholder")}
          />
        </label>

        <div>
          <p className="text-sm font-medium">{t("photos")}</p>
          <p className="text-xs text-foreground/55">{t("photosHint")}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-pro/25 bg-white px-4 py-2.5 text-sm font-medium text-pro hover:bg-pro-soft/50"
          >
            <ImagePlus className="h-4 w-4" />
            {t("addPhotos")}
          </button>

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {previews.map((url, index) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                    aria-label={t("removePhoto")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" variant="pro" disabled={loading}>
          {loading ? t("publishing") : t("publish")}
        </Button>
      </form>

      <div className="rounded-2xl border border-foreground/8 bg-white p-6">
        <h2 className="font-semibold">{t("listTitle")}</h2>
        {announcements.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/55">{t("empty")}</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {announcements.map((a) => (
              <li
                key={a.id}
                className={`rounded-xl border border-foreground/8 p-4 ${a.published ? "" : "opacity-60"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-foreground/50">
                      {format(new Date(a.publishedAt), "d MMMM yyyy", {
                        locale: dateLocales[locale] ?? fr,
                      })}
                      {!a.published && ` · ${t("draft")}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => togglePublished(a.id, a.published)}
                      className="font-medium text-pro underline"
                    >
                      {a.published ? t("unpublish") : t("publishAction")}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAnnouncement(a.id)}
                      className="font-medium text-red-600 underline"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>

                {a.body && (
                  <p className="mt-2 text-sm text-foreground/70 whitespace-pre-wrap">{a.body}</p>
                )}

                {a.photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {a.photos.map((p) => (
                      <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => deletePhoto(a.id, p.id)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={t("removePhoto")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
