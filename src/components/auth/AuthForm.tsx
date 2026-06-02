"use client";

import { UserRole } from "@prisma/client";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

type Mode = "login" | "register";

export function AuthForm({
  role,
  mode,
  title,
  subtitle,
  alternateHref,
  alternateLabel,
}: {
  role: UserRole;
  mode: Mode;
  title: string;
  subtitle: string;
  alternateHref: string;
  alternateLabel: string;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const callbackUrl =
    role === UserRole.PROVIDER ? "/pro" : "/compte";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [establishmentName, setEstablishmentName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-xl border border-foreground/12 bg-white px-3 py-2 text-sm outline-none focus:border-accent";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            email,
            password,
            firstName,
            lastName,
            phone: phone || undefined,
            establishmentName:
              role === UserRole.PROVIDER ? establishmentName : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? t("loginFailed"));
      }

      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(
          mode === "register" ? t("registerThenLoginFailed") : t("loginFailed"),
        );
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-foreground/65">{subtitle}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === "register" && (
          <>
            {role === UserRole.PROVIDER && (
              <label className="block text-sm">
                {t("establishmentName")}
                <input
                  className={inputClass}
                  value={establishmentName}
                  onChange={(e) => setEstablishmentName(e.target.value)}
                  required
                />
              </label>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                {t("firstName")}
                <input
                  className={inputClass}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm">
                {t("lastName")}
                <input
                  className={inputClass}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
            </div>
            {role === UserRole.CLIENT && (
              <label className="block text-sm">
                {t("phone")}
                <input
                  type="tel"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            )}
          </>
        )}

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

        <label className="block text-sm">
          <span className="flex items-center justify-between">
            <span>{t("password")}</span>
            {mode === "login" && (
              <Link
                href="/mot-de-passe-oublie"
                className="text-xs font-normal text-foreground/55 underline hover:text-foreground"
              >
                {t("forgotPassword")}
              </Link>
            )}
          </span>
          <input
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" variant={role === UserRole.PROVIDER ? "pro" : "primary"}>
          {loading ? t("wait") : mode === "register" ? t("register") : t("login")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60">
        <Link href={alternateHref} className="underline hover:text-foreground">
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}
