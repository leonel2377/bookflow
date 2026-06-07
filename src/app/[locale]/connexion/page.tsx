import { Suspense } from "react";
import { UserRole } from "@/types/roles";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function ConnexionPage() {
  const t = await getTranslations("auth");

  return (
    <>
      <SiteHeader mode="client" />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <Suspense fallback={<p className="text-sm text-foreground/55">{t("wait")}</p>}>
          <AuthForm
            role={UserRole.CLIENT}
            mode="login"
            title={t("loginClient")}
            subtitle={t("loginClientDesc")}
            alternateHref="/inscription"
            alternateLabel={t("noAccount")}
          />
        </Suspense>
        <p className="mt-8 text-center text-xs text-foreground/50">
          {t("isPro")}{" "}
          <Link href="/pro/connexion" className="underline">
            {t("proLoginLink")}
          </Link>
        </p>
      </main>
    </>
  );
}
