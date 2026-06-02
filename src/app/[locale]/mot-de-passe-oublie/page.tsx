import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default async function MotDePasseOubliePage() {
  const t = await getTranslations("auth");

  return (
    <>
      <SiteHeader mode="client" />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <Suspense fallback={<p className="text-sm text-foreground/55">{t("wait")}</p>}>
          <ForgotPasswordForm loginHref="/connexion" />
        </Suspense>
      </main>
    </>
  );
}
