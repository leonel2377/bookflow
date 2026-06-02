import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { UserRole } from "@/types/roles";

export async function requireClientLayout() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect(`/${locale}/connexion`);
  }
  if (session.user.role === UserRole.PROVIDER) {
    redirect(`/${locale}/pro`);
  }
  if (session.user.role !== UserRole.CLIENT) {
    redirect(`/${locale}/connexion`);
  }

  return session;
}
