import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProBottomNav } from "@/components/layout/ProBottomNav";

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader mode="pro" />
      <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:py-8 md:pb-8">{children}</div>
      <ProBottomNav />
    </>
  );
}
