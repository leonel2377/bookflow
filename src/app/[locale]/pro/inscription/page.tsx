import { Suspense } from "react";
import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function ProInscriptionPage() {
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto max-w-md py-4">
      <Suspense fallback={<p className="text-sm text-foreground/55">{t("wait")}</p>}>
        <AuthForm
          role={UserRole.PROVIDER}
          mode="register"
          title={t("registerPro")}
          subtitle={t("registerProDesc")}
          alternateHref="/pro/connexion"
          alternateLabel={t("hasAccount")}
        />
      </Suspense>
      <p className="mt-8 text-center text-xs text-foreground/50">
        <Link href="/pro/devenir-partenaire" className="underline">
          {t("discoverPartner")}
        </Link>
        {" · "}
        <Link href="/pro/tarifs" className="underline">
          {t("seePlans")}
        </Link>
      </p>
    </div>
  );
}
