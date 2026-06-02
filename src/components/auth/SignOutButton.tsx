"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function SignOutButton({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations("nav");

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "text-sm text-foreground/60 hover:text-foreground underline-offset-2 hover:underline"
      }
    >
      {t("logout")}
    </button>
  );
}
