"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { cn } from "@/lib/utils";

export type MobileNavProps = {
  mode?: "default" | "pro" | "client";
  isClient: boolean;
  isProvider: boolean;
  isLoggedIn: boolean;
  userLabel?: string | null;
};

export function MobileNav({
  mode = "default",
  isClient,
  isProvider,
  isLoggedIn,
  userLabel,
}: MobileNavProps) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [mode]);

  const links: { href: string; label: string; show: boolean }[] = [
    { href: "/salons", label: t("findSalon"), show: mode !== "pro" },
    {
      href: "/pro/devenir-partenaire",
      label: t("becomePartner"),
      show: mode !== "client",
    },
    { href: "/pro", label: t("proSpace"), show: mode !== "client" },
    { href: "/compte", label: t("myAccount"), show: mode !== "pro" && isClient },
    {
      href: "/compte/rendez-vous",
      label: t("myAppointments"),
      show: mode === "client" && isClient,
    },
    {
      href: "/pro/planning",
      label: t("planning"),
      show: mode === "pro" && isProvider,
    },
    {
      href: "/pro/tableau-de-bord",
      label: t("dashboard"),
      show: mode === "pro" && isProvider,
    },
    {
      href: "/pro/etablissement",
      label: t("establishment"),
      show: mode === "pro" && isProvider,
    },
  ].filter((l) => l.show);

  return (
    <>
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/10 text-foreground md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t("menuClose") : t("menuOpen")}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <nav
        id="mobile-nav"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100vw-3rem,20rem)] flex-col bg-white shadow-xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-foreground/8 px-4 py-4">
          <span className="font-semibold">
            BOOK<span className="text-accent">FLOW</span>
          </span>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-foreground/5"
            onClick={() => setOpen(false)}
            aria-label={t("menuClose")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoggedIn && userLabel && (
            <p className="mb-4 truncate rounded-xl bg-foreground/5 px-3 py-2 text-sm text-foreground/70">
              {userLabel}
            </p>
          )}

          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl px-3 py-3 text-base font-medium text-foreground/80 hover:bg-accent-soft hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-foreground/8 pt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/45">
              {t("language")}
            </p>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="space-y-2 border-t border-foreground/8 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {isLoggedIn && <SignOutButton className="w-full justify-center" />}
          {mode === "pro" ? (
            isProvider ? (
              <Button href="/pro/planning" variant="pro" className="w-full">
                {t("planning")}
              </Button>
            ) : (
              <Button href="/pro/connexion" variant="pro" className="w-full">
                {t("proLogin")}
              </Button>
            )
          ) : mode === "client" ? (
            isClient ? (
              <Button href="/compte/rendez-vous" className="w-full">
                {t("myAppointments")}
              </Button>
            ) : (
              <Button href="/connexion" className="w-full">
                {t("login")}
              </Button>
            )
          ) : (
            <>
              {isClient ? (
                <Button href="/compte" className="w-full">
                  {t("myAccount")}
                </Button>
              ) : (
                <Button href="/salons" className="w-full">
                  {t("book")}
                </Button>
              )}
              {!isProvider && (
                <Button href="/pro/connexion" variant="secondary" className="w-full">
                  {t("proLogin")}
                </Button>
              )}
            </>
          )}
        </div>
      </nav>
    </>
  );
}
