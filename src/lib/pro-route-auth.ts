import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { getEstablishmentForProvider } from "@/lib/session";

export async function requireProEstablishment() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PROVIDER) {
    return { error: "Non autorisé" as const, status: 401 as const };
  }

  const establishment = await getEstablishmentForProvider(session.user.id);
  if (!establishment) {
    return { error: "Établissement introuvable" as const, status: 404 as const };
  }

  return { establishment };
}
