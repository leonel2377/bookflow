import { getTranslations } from "next-intl/server";
import { PartnerLanding } from "@/components/pro/PartnerLanding";

export async function generateMetadata() {
  const t = await getTranslations("partner");
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default function DevenirPartenairePage() {
  return <PartnerLanding />;
}
