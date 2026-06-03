import { notFound } from "next/navigation";
import { UserRole } from "@/types/roles";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BookingForm } from "@/components/booking/BookingForm";
import { prisma } from "@/lib/prisma";
import { getClientProfileForUser } from "@/lib/session";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
};

export default async function ReserverPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { service: serviceId } = await searchParams;
  const t = await getTranslations("salons");

  const establishment = await prisma.establishment.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true }, orderBy: { name: "asc" } },
      staff: { where: { active: true } },
    },
  });

  if (!establishment) notFound();

  const selectedService =
    establishment.services.find((s) => s.id === serviceId) ??
    establishment.services[0];

  const session = await auth();
  const profile =
    session?.user?.role === UserRole.CLIENT && session.user.id
      ? await getClientProfileForUser(session.user.id)
      : null;

  return (
    <>
      <SiteHeader mode="client" />
      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-2xl font-semibold">{t("bookAt", { name: establishment.name })}</h1>
        <p className="mt-2 text-sm text-foreground/65">{t("bookDesc")}</p>
        <BookingForm
          establishmentId={establishment.id}
          services={establishment.services}
          staff={establishment.staff}
          defaultServiceId={selectedService?.id}
          defaultClient={
            profile
              ? {
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  email: profile.email,
                  phone: profile.phone,
                  smsReminders: profile.smsReminders,
                }
              : undefined
          }
        />
      </main>
    </>
  );
}
