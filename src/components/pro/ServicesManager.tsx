"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDuration, formatPrice } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  category: string | null;
  active: boolean;
};

export function ServicesManager({ services: initial }: { services: Service[] }) {
  const t = useTranslations("pro.establishment");
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [services, setServices] = useState(initial);
  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [priceEuros, setPriceEuros] = useState("45");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-xl border border-foreground/12 bg-white px-3 py-2 text-sm outline-none focus:border-pro";

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pro/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          durationMinutes: Number(durationMinutes),
          priceCents: Math.round(parseFloat(priceEuros) * 100),
          category: category || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setServices((s) => [...s, data.service]);
      setName("");
      setCategory("");
      success(t("serviceAdded"));
      router.refresh();
    } catch {
      toastError(t("serviceAddError"));
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/pro/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) {
      const data = await res.json();
      setServices((list) => list.map((s) => (s.id === id ? data.service : s)));
      success(active ? t("serviceDeactivated") : t("serviceActivated"));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-foreground/8 bg-white p-6">
        <h2 className="font-semibold">Prestations & tarifs</h2>
        <ul className="mt-4 divide-y divide-foreground/8">
          {services.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className={s.active ? "" : "opacity-50"}>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-foreground/55">
                  {formatDuration(s.durationMinutes)} · {formatPrice(s.priceCents)}
                  {s.category ? ` · ${s.category}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(s.id, s.active)}
                className="text-xs font-medium text-pro underline"
              >
                {s.active ? "Désactiver" : "Réactiver"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={addService} className="rounded-2xl border border-dashed border-pro/30 bg-pro-soft/30 p-6 space-y-3">
        <h3 className="text-sm font-medium text-pro">Ajouter une prestation</h3>
        <label className="block text-sm">
          Nom
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-sm">
            Durée (min)
            <input
              type="number"
              className={inputClass}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
              min={15}
            />
          </label>
          <label className="block text-sm">
            Prix (€)
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={priceEuros}
              onChange={(e) => setPriceEuros(e.target.value)}
              required
              min={0}
            />
          </label>
          <label className="block text-sm">
            Catégorie
            <input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} />
          </label>
        </div>
        <Button type="submit" variant="pro" disabled={loading}>
          Ajouter
        </Button>
      </form>
    </div>
  );
}
