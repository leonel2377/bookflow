import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { UserRole } from "@/types/roles";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileNav } from "@/components/layout/MobileNav";

export async function SiteHeader({ mode }: { mode?: "default" | "pro" | "client" }) {
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }
  const user = session?.user;
  const isClient = user?.role === UserRole.CLIENT;
  const isProvider = user?.role === UserRole.PROVIDER;
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/5 bg-white/80 backdrop-blur-md supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:py-4">
        <Link href="/" className="shrink-0 text-base font-semibold tracking-tight sm:text-lg">
          BOOK<span className="text-accent">FLOW</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-foreground/70 md:flex">
          {mode !== "pro" && (
            <Link href="/salons" className="hover:text-foreground">
              {t("findSalon")}
            </Link>
          )}
          {mode !== "client" && (
            <Link href="/pro/devenir-partenaire" className="hover:text-foreground">
              {t("becomePartner")}
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
            <span className="max-w-[12rem] truncate text-foreground/50">
              {user.name ?? user.email}
            </span>
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          {user && (
            <div className="hidden md:block">
              <SignOutButton />
            </div>
          )}

          <div className="hidden items-center gap-2 md:flex">
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
                  <Button href="/pro" variant="secondary">
                    {t("proSpace")}
                  </Button>
                ) : (
                  <Button href="/pro" variant="secondary">
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

          <MobileNav
            mode={mode}
            isClient={isClient}
            isProvider={isProvider}
            isLoggedIn={!!user}
            userLabel={user?.name ?? user?.email}
          />
        </div>
      </div>
    </header>
  );
}
