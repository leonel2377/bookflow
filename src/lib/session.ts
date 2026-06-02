import { UserRole } from "@/types/roles";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireClientSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.CLIENT) {
    return null;
  }
  return session;
}

export async function requireProviderSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PROVIDER) {
    return null;
  }
  return session;
}

export async function getClientProfileForUser(userId: string) {
  return prisma.client.findUnique({ where: { userId } });
}

export async function getEstablishmentForProvider(userId: string) {
  return prisma.establishment.findUnique({ where: { ownerId: userId } });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
