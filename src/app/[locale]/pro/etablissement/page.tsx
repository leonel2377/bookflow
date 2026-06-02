import { getTranslations } from "next-intl/server";
import { EstablishmentForm } from "@/components/pro/EstablishmentForm";
import { OpeningHoursEditor } from "@/components/pro/OpeningHoursEditor";
import { ServicesManager } from "@/components/pro/ServicesManager";
import { StaffManager } from "@/components/pro/StaffManager";
import { requireProviderEstablishment } from "@/lib/pro";

export default async function ProEstablishmentPage() {
  const t = await getTranslations("pro.establishment");
  const { establishment } = await requireProviderEstablishment();

  const openings = establishment.openings.map((o) => ({
    dayOfWeek: o.dayOfWeek,
    openTime: o.openTime,
    closeTime: o.closeTime,
    closed: o.closed,
  }));

  const staff = establishment.staff.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    role: m.role,
    color: m.color,
    active: m.active,
    schedules: m.schedules.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-foreground/70">{t("subtitle")}</p>
      </div>

      <EstablishmentForm establishment={establishment} />
      <OpeningHoursEditor openings={openings} />
      <StaffManager staff={staff} openings={openings} />
      <ServicesManager services={establishment.services} />
    </div>
  );
}
