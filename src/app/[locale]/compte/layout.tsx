import { SiteHeader } from "@/components/layout/SiteHeader";

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader mode="client" />
      <div className="mx-auto max-w-3xl px-4 py-10">{children}</div>
    </>
  );
}
