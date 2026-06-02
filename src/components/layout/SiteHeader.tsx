import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export async function SiteHeader({ mode }: { mode?: "default" | "pro" | "client" }) {
  const session = await auth();
  const user = session?.user;
  const isClient = user?.role === UserRole.CLIENT;
  const isProvider = user?.role === UserRole.PROVIDER;
  const t = await getTranslations("nav");

  return (
    <header className="border-b border-foreground/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          BOOK<span className="text-accent">FLOW</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-foreground/70 md:flex">
          {mode !== "pro" && (
            <Link href="/salons" className="hover:text-foreground">
              {t("findSalon")}
            </Link>
          )}
          {mode !== "client" && (
            <Link href="/pro" className="hover:text-foreground">
              {t("proSpace")}
            </Link>
          )}
          {mode !== "pro" && isClient && (
            <Link href="/compte" className="hover:text-foreground">
              {t("myAccount")}
            </Link>
          )}
          {user && (
            <span className="text-foreground/50">{user.name ?? user.email}</span>
          )}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {user && <SignOutButton />}
          {mode === "pro" ? (
            isProvider ? (
              <Button href="/pro/planning" variant="pro">
                {t("planning")}
              </Button>
            ) : (
              <Button href="/pro/connexion" variant="pro">
                {t("proLogin")}
              </Button>
            )
          ) : mode === "client" ? (
            isClient ? (
              <Button href="/compte/rendez-vous">{t("myAppointments")}</Button>
            ) : (
              <Button href="/connexion">{t("login")}</Button>
            )
          ) : (
            <>
              {isProvider ? (
                <Button href="/pro" variant="secondary" className="hidden sm:inline-flex">
                  {t("proSpace")}
                </Button>
              ) : (
                <Button href="/pro" variant="secondary" className="hidden sm:inline-flex">
                  {t("iAmPro")}
                </Button>
              )}
              {isClient ? (
                <Button href="/compte">{t("myAccount")}</Button>
              ) : (
                <Button href="/salons">{t("book")}</Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
