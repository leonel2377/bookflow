import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Button } from "@/components/ui/Button";
import { getClientProfileForUser } from "@/lib/session";

export default async function ComptePage() {
  const session = await auth();
  const profile = session?.user?.id
    ? await getClientProfileForUser(session.user.id)
    : null;
  const t = await getTranslations("account");

  const name = profile?.firstName ?? session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div>
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-foreground/70">{t("hello", { name })}</p>
      <p className="mt-2 text-sm text-foreground/55">{session?.user?.email}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/compte/rendez-vous">{t("myAppointments")}</Button>
        <Button href="/salons" variant="secondary">
          {t("newBooking")}
        </Button>
      </div>
    </div>
  );
}
