import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { getEstablishmentForProvider } from "@/lib/session";

export async function getProEstablishmentId() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PROVIDER) {
    return null;
  }
  const establishment = await getEstablishmentForProvider(session.user.id);
  return establishment?.id ?? null;
}
