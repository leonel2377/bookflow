"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { OpeningRow } from "@/components/pro/OpeningHoursEditor";

export type StaffRow = {
  id: string;
  firstName: string;
  lastName: string;
  role: string | null;
  color: string | null;
  active: boolean;
  schedules: { dayOfWeek: number; startTime: string; endTime: string }[];
};

function buildScheduleRows(
  schedules: StaffRow["schedules"],
  openings: OpeningRow[],
): StaffRow["schedules"] {
  const byDay = new Map(schedules.map((s) => [s.dayOfWeek, s]));
  const openingByDay = new Map(openings.map((o) => [o.dayOfWeek, o]));
  return Array.from({ length: 7 }, (_, day) => {
    const existing = byDay.get(day);
    if (existing) return existing;
    const opening = openingByDay.get(day);
    return {
      dayOfWeek: day,
      startTime: opening?.openTime ?? "09:00",
      endTime: opening?.closeTime ?? "19:00",
    };
  });
}

function StaffCard({
  member,
  openings,
  onUpdated,
}: {
  member: StaffRow;
  openings: OpeningRow[];
  onUpdated: () => void;
}) {
  const t = useTranslations("pro.establishment");
  const tAuth = useTranslations("auth");
  const td = useTranslations("pro.days");
  const [expanded, setExpanded] = useState(false);
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [role, setRole] = useState(member.role ?? "");
  const [color, setColor] = useState(member.color ?? "#8b5a6b");
  const [schedules, setSchedules] = useState(() =>
    buildScheduleRows(member.schedules, openings),
  );
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-lg border border-foreground/12 px-2 py-1.5 text-sm outline-none focus:border-pro";

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pro/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, role, color, schedules }),
      });
      if (!res.ok) throw new Error();
      onUpdated();
      setExpanded(false);
    } catch {
      alert("Error");
    } finally {
      setLoading(false);
    }
  }

  async function setActive(active: boolean) {
    setLoading(true);
    try {
      await fetch(`/api/pro/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      onUpdated();
    } finally {
      setLoading(false);
    }
  }

  const closedDays = new Set(openings.filter((o) => o.closed).map((o) => o.dayOfWeek));

  return (
    <li
      className={`rounded-xl border p-4 ${member.active ? "border-foreground/8" : "border-dashed opacity-60"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium">
            {member.firstName} {member.lastName}
          </span>
          {member.role && <span className="text-sm text-foreground/50">— {member.role}</span>}
          {!member.active && <span className="text-xs text-foreground/45">{t("inactive")}</span>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setExpanded(!expanded)} className="text-xs font-medium text-pro underline">
            {expanded ? t("close") : t("edit")}
          </button>
          {member.active ? (
            <button type="button" onClick={() => setActive(false)} className="text-xs text-foreground/50 underline" disabled={loading}>
              {t("deactivate")}
            </button>
          ) : (
            <button type="button" onClick={() => setActive(true)} className="text-xs text-pro underline" disabled={loading}>
              {t("reactivate")}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-foreground/8 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              {tAuth("firstName")}
              <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label className="text-sm">
              {tAuth("lastName")}
              <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              {t("role")}
              <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} />
            </label>
            <label className="text-sm">
              {t("planningColor")}
              <input type="color" className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-foreground/12" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium">{t("workHours")}</p>
            <div className="mt-2 space-y-1">
              {schedules.map((s) => (
                <div key={s.dayOfWeek} className="grid grid-cols-[3rem_1fr_1fr] items-center gap-2 text-sm">
                  <span className={closedDays.has(s.dayOfWeek) ? "text-foreground/35" : ""}>
                    {td(String(s.dayOfWeek))}
                  </span>
                  <input type="time" className={inputClass} value={s.startTime} disabled={closedDays.has(s.dayOfWeek)} onChange={(e) => setSchedules((list) => list.map((r) => (r.dayOfWeek === s.dayOfWeek ? { ...r, startTime: e.target.value } : r)))} />
                  <input type="time" className={inputClass} value={s.endTime} disabled={closedDays.has(s.dayOfWeek)} onChange={(e) => setSchedules((list) => list.map((r) => (r.dayOfWeek === s.dayOfWeek ? { ...r, endTime: e.target.value } : r)))} />
                </div>
              ))}
            </div>
          </div>
          <Button type="button" variant="pro" disabled={loading} onClick={save}>
            {loading ? "…" : t("save")}
          </Button>
        </div>
      )}
    </li>
  );
}

export function StaffManager({ staff: initial, openings }: { staff: StaffRow[]; openings: OpeningRow[] }) {
  const t = useTranslations("pro.establishment");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [adding, setAdding] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-xl border border-foreground/12 px-3 py-2 text-sm outline-none focus:border-pro";

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/pro/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, role }),
      });
      if (!res.ok) throw new Error();
      setFirstName("");
      setLastName("");
      setRole("");
      router.refresh();
    } catch {
      alert("Error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="rounded-2xl border border-foreground/8 bg-white p-6">
      <h2 className="font-semibold">{t("team")}</h2>
      <p className="mt-1 text-xs text-foreground/55">{t("teamHint")}</p>
      <ul className="mt-4 space-y-3">
        {initial.map((m) => (
          <StaffCard key={m.id} member={m} openings={openings} onUpdated={() => router.refresh()} />
        ))}
      </ul>
      <form onSubmit={addStaff} className="mt-6 space-y-3 border-t border-foreground/8 pt-6">
        <h3 className="text-sm font-medium text-pro">{t("addMember")}</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            {tAuth("firstName")}
            <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label className="text-sm">
            {tAuth("lastName")}
            <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
          <label className="text-sm">
            {t("role")}
            <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} />
          </label>
        </div>
        <Button type="submit" variant="pro" disabled={adding}>
          {adding ? t("adding") : t("add")}
        </Button>
      </form>
    </div>
  );
}
