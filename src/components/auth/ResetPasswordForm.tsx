"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export function ResetPasswordForm({ loginHref }: { loginHref: string }) {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass = "input-field";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t("resetTokenMissing"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("resetPasswordMismatch"));
      return;
    }
    if (password.length < 8) {
      setError(t("passwordMin"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        if (data.error === "expired_token") throw new Error(t("resetTokenExpired"));
        throw new Error(t("resetTokenInvalid"));
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("resetPasswordError"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold">{t("resetPasswordTitle")}</h1>
        <p className="mt-4 text-sm text-foreground/70">{t("resetPasswordSuccess")}</p>
        <Link
          href={loginHref}
          className="mt-8 inline-block text-sm underline hover:text-foreground"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold">{t("resetPasswordTitle")}</h1>
        <p className="mt-4 text-sm text-red-600">{t("resetTokenMissing")}</p>
        <Link
          href="/mot-de-passe-oublie"
          className="mt-6 inline-block text-sm underline hover:text-foreground"
        >
          {t("requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-semibold">{t("resetPasswordTitle")}</h1>
      <p className="mt-2 text-sm text-foreground/65">{t("resetPasswordDesc")}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          {t("newPassword")}
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        <label className="block text-sm">
          {t("confirmPassword")}
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("wait") : t("resetPasswordSubmit")}
        </Button>
      </form>
    </div>
  );
}
