"use client";

import { BarChart3, Building2, CalendarDays, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { UserRole } from "@/types/roles";
import { cn } from "@/lib/utils";

const HIDDEN_PREFIXES = ["/pro/connexion", "/pro/inscription", "/pro/devenir-partenaire"];

export function ProBottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();
  const isProvider = session?.user?.role === UserRole.PROVIDER;

  if (!isProvider) return null;
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const items = [
    { href: "/pro", icon: Home, label: t("proHome") },
    { href: "/pro/planning", icon: CalendarDays, label: t("planning") },
    { href: "/pro/tableau-de-bord", icon: BarChart3, label: t("dashboard") },
    { href: "/pro/etablissement", icon: Building2, label: t("establishment") },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/8 bg-white/95 backdrop-blur-md md:hidden"
      aria-label={t("proNav")}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/pro" ? pathname === "/pro" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium leading-tight transition-colors",
                  active ? "text-pro" : "text-foreground/55 hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
