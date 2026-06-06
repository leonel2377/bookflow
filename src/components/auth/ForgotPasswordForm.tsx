"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function ForgotPasswordForm({
  loginHref,
}: {
  loginHref: string;
}) {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass = "input-field";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { code?: string } | null;
        if (res.status === 503 || data?.code === "database") {
          throw new Error(t("forgotPasswordServiceError"));
        }
        if (res.status === 502 || data?.code === "smtp") {
          throw new Error(t("forgotPasswordSmtpError"));
        }
        throw new Error(t("forgotPasswordError"));
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forgotPasswordError"));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold">{t("forgotPasswordTitle")}</h1>
        <p className="mt-4 text-sm text-foreground/70">{t("forgotPasswordSent")}</p>
        <Link
          href={loginHref}
          className="mt-8 inline-block text-sm underline hover:text-foreground"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-semibold">{t("forgotPasswordTitle")}</h1>
      <p className="mt-2 text-sm text-foreground/65">{t("forgotPasswordDesc")}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          {t("email")}
          <input
            type="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("wait") : t("sendResetLink")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60">
        <Link href={loginHref} className="underline hover:text-foreground">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
