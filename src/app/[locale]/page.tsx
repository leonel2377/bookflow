import { SiteHeader } from "@/components/layout/SiteHeader";
import { HomePageClient } from "@/components/home/HomePageClient";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <HomePageClient />
      <SiteFooter />
    </>
  );
}
