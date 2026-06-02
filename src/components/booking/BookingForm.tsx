"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { formatDuration, formatPrice } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};

type Staff = { id: string; firstName: string; lastName: string };

type DefaultClient = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  smsReminders: boolean;
};

export function BookingForm({
  establishmentId,
  services,
  staff,
  defaultServiceId,
  defaultClient,
}: {
  establishmentId: string;
  services: Service[];
  staff: Staff[];
  defaultServiceId?: string;
  defaultClient?: DefaultClient;
}) {
  const t = useTranslations("booking");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [serviceId, setServiceId] = useState(defaultServiceId ?? services[0]?.id);
  const [staffId, setStaffId] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [firstName, setFirstName] = useState(defaultClient?.firstName ?? "");
  const [lastName, setLastName] = useState(defaultClient?.lastName ?? "");
  const [email, setEmail] = useState(defaultClient?.email ?? "");
  const [phone, setPhone] = useState(defaultClient?.phone ?? "");
  const [smsReminders, setSmsReminders] = useState(defaultClient?.smsReminders ?? true);
  const isLoggedIn = !!defaultClient;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find((s) => s.id === serviceId);

  const loadSlots = useCallback(async () => {
    if (!date || !serviceId) {
      setSlots([]);
      setTime("");
      return;
    }
    setSlotsLoading(true);
    try {
      const params = new URLSearchParams({
        establishmentId,
        serviceId,
        date,
      });
      if (staffId) params.set("staffId", staffId);
      const res = await fetch(`/api/availability?${params}`);
      const data = await res.json();
      const list: string[] = data.slots ?? [];
      setSlots(list);
      setTime((prev) => (list.includes(prev) ? prev : list[0] ?? ""));
    } catch {
      setSlots([]);
      setTime("");
    } finally {
      setSlotsLoading(false);
    }
  }, [establishmentId, serviceId, date, staffId]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!time) {
      setError(t("pickSlot"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          establishmentId,
          serviceId,
          staffId: staffId || undefined,
          date,
          time,
          client: { firstName, lastName, email, phone, smsReminders },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Réservation impossible");
      router.push(`/compte/rendez-vous?confirmed=${data.appointmentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-foreground/12 bg-white px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <label className="block text-sm">
        {t("service")}
        <select
          className={inputClass}
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          required
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatPrice(s.priceCents)} ({formatDuration(s.durationMinutes)})
            </option>
          ))}
        </select>
      </label>

      {staff.length > 0 && (
        <label className="block text-sm">
          {t("withOptional")}
          <select
            className={inputClass}
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          >
            <option value="">{t("noPreference")}</option>
            {staff.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          {t("date")}
          <input
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={new Date().toISOString().slice(0, 10)}
          />
        </label>
        <label className="block text-sm">
          {t("time")}
          <select
            className={inputClass}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            disabled={!date || slotsLoading || slots.length === 0}
          >
            {slotsLoading ? (
              <option value="">{t("loadingSlots")}</option>
            ) : slots.length === 0 ? (
              <option value="">{t("noSlots")}</option>
            ) : (
              slots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      {date && !slotsLoading && slots.length === 0 && (
        <p className="text-sm text-foreground/55">{t("noSlotsDay")}</p>
      )}

      <fieldset className="space-y-3 rounded-xl border border-foreground/8 p-4">
        <legend className="px-1 text-sm font-medium">{t("yourDetails")}</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            {tAuth("firstName")}
            <input
              className={inputClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            {tAuth("lastName")}
            <input
              className={inputClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
        </div>
        <label className="block text-sm">
          {tAuth("email")}
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            readOnly={isLoggedIn}
          />
        </label>
        {isLoggedIn && (
          <p className="text-xs text-foreground/50">{t("linkedAccount")}</p>
        )}
        <label className="block text-sm">
          {t("phoneSms")}
          <input
            type="tel"
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12 34 56 78"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={smsReminders}
            onChange={(e) => setSmsReminders(e.target.checked)}
          />
          {t("smsReminder")}
        </label>
      </fieldset>

      {service && (
        <p className="text-sm text-foreground/60">
          {t("duration")} : {formatDuration(service.durationMinutes)} ·{" "}
          {formatPrice(service.priceCents)}
          {staffId ? "" : ` · ${t("autoStaff")}`}
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        className="w-full"
        variant="primary"
        disabled={loading || !time}
      >
        {loading ? t("confirming") : t("confirm")}
      </Button>

      <p className="text-center text-xs text-foreground/50">
        {t("afterConfirm")}{" "}
        <Link href="/compte/rendez-vous" className="underline">
          {t("myAccount")}
        </Link>
        .
      </p>
    </form>
  );
}
