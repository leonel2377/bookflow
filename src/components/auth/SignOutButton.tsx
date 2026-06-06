"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const t = useTranslations("nav");

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={cn(
        "text-sm text-foreground/60 underline-offset-2 hover:text-foreground hover:underline",
        className,
      )}
    >
      {t("logout")}
    </button>
  );
}
