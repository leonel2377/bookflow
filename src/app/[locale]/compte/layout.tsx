import { SiteHeader } from "@/components/layout/SiteHeader";
import { requireClientLayout } from "@/lib/auth-guard";

export default async function CompteLayout({ children }: { children: React.ReactNode }) {
  await requireClientLayout();

  return (
    <>
      <SiteHeader mode="client" />
      <div className="mx-auto max-w-3xl px-4 py-10">{children}</div>
    </>
  );
}
