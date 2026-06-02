import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function ReinitialiserMotDePassePage() {
  const t = await getTranslations("auth");

  return (
    <>
      <SiteHeader mode="client" />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <Suspense fallback={<p className="text-sm text-foreground/55">{t("wait")}</p>}>
          <ResetPasswordForm loginHref="/connexion" />
        </Suspense>
      </main>
    </>
  );
}
