import { Suspense } from "react";
import { UserRole } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function ProConnexionPage() {
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto max-w-md py-4">
      <Suspense fallback={<p className="text-sm text-foreground/55">{t("wait")}</p>}>
        <AuthForm
          role={UserRole.PROVIDER}
          mode="login"
          title={t("loginPro")}
          subtitle={t("loginProDesc")}
          alternateHref="/pro/inscription"
          alternateLabel={t("createPro")}
        />
      </Suspense>
      <p className="mt-8 text-center text-xs text-foreground/50">
        {t("isClient")}{" "}
        <Link href="/connexion" className="underline">
          {t("clientLoginLink")}
        </Link>
      </p>
    </div>
  );
}
