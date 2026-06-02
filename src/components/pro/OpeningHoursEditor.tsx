"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export type OpeningRow = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  closed: boolean;
};

export function OpeningHoursEditor({ openings: initial }: { openings: OpeningRow[] }) {
  const t = useTranslations("pro.establishment");
  const td = useTranslations("pro.days");
  const router = useRouter();
  const [rows, setRows] = useState<OpeningRow[]>(() => {
    const byDay = new Map(initial.map((o) => [o.dayOfWeek, o]));
    return Array.from({ length: 7 }, (_, day) => {
      const existing = byDay.get(day);
      return (
        existing ?? {
          dayOfWeek: day,
          openTime: "09:00",
          closeTime: "19:00",
          closed: day === 0,
        }
      );
    });
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const inputClass =
    "rounded-lg border border-foreground/12 px-2 py-1.5 text-sm outline-none focus:border-pro";

  function updateRow(day: number, patch: Partial<OpeningRow>) {
    setRows((list) => list.map((r) => (r.dayOfWeek === day ? { ...r, ...patch } : r)));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pro/openings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openings: rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMessage(t("openingsSaved"));
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSave} className="rounded-2xl border border-foreground/8 bg-white p-6">
      <h2 className="font-semibold">{t("openings")}</h2>
      <p className="mt-1 text-xs text-foreground/55">{t("openingsHint")}</p>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div
            key={row.dayOfWeek}
            className="grid grid-cols-[3rem_1fr_1fr_auto] items-center gap-2 text-sm sm:grid-cols-[4rem_1fr_1fr_5rem]"
          >
            <span className="font-medium">{td(String(row.dayOfWeek))}</span>
            <input
              type="time"
              className={inputClass}
              value={row.openTime}
              disabled={row.closed}
              onChange={(e) => updateRow(row.dayOfWeek, { openTime: e.target.value })}
            />
            <input
              type="time"
              className={inputClass}
              value={row.closeTime}
              disabled={row.closed}
              onChange={(e) => updateRow(row.dayOfWeek, { closeTime: e.target.value })}
            />
            <label className="flex items-center gap-1 text-xs text-foreground/60">
              <input
                type="checkbox"
                checked={row.closed}
                onChange={(e) => updateRow(row.dayOfWeek, { closed: e.target.checked })}
              />
              {t("closed")}
            </label>
          </div>
        ))}
      </div>
      {message && (
        <p className={`mt-4 text-sm ${message === t("openingsSaved") ? "text-pro" : "text-red-600"}`}>
          {message}
        </p>
      )}
      <div className="mt-4">
        <Button type="submit" variant="pro" disabled={loading}>
          {loading ? t("saving") : t("saveOpenings")}
        </Button>
      </div>
    </form>
  );
}
