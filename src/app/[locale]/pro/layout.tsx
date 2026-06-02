import { SiteHeader } from "@/components/layout/SiteHeader";

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader mode="pro" />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </>
  );
}
