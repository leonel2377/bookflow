"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

type EstablishmentData = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  slug: string;
};

export function EstablishmentForm({ establishment }: { establishment: EstablishmentData }) {
  const t = useTranslations("pro.establishment");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [name, setName] = useState(establishment.name);
  const [description, setDescription] = useState(establishment.description ?? "");
  const [address, setAddress] = useState(establishment.address ?? "");
  const [city, setCity] = useState(establishment.city ?? "");
  const [phone, setPhone] = useState(establishment.phone ?? "");
  const [email, setEmail] = useState(establishment.email ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const inputClass =
    "mt-1 w-full rounded-xl border border-foreground/12 bg-white px-3 py-2 text-sm outline-none focus:border-pro";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pro/establishment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, address, city, phone, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMessage(t("saved"));
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-foreground/8 bg-white p-6 space-y-4">
      <h2 className="font-semibold">{t("identity")}</h2>
      <p className="text-xs text-foreground/50">
        {t("publicPage")}:{" "}
        <Link href={`/salons/${establishment.slug}`} className="underline" target="_blank">
          /salons/{establishment.slug}
        </Link>
      </p>
      <label className="block text-sm">
        {tAuth("establishmentName")}
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="block text-sm">
        {t("description")}
        <textarea
          className={`${inputClass} min-h-[80px]`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          {t("address")}
          <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label className="block text-sm">
          {t("city")}
          <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          {tAuth("phone")}
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="block text-sm">
          {tAuth("email")}
          <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>
      {message && (
        <p className={`text-sm ${message === t("saved") ? "text-pro" : "text-red-600"}`}>{message}</p>
      )}
      <Button type="submit" variant="pro" disabled={loading}>
        {loading ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
