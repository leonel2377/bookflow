import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function getProviderEstablishment(userId: string) {
  return prisma.establishment.findUnique({
    where: { ownerId: userId },
    include: {
      services: { orderBy: { name: "asc" } },
      staff: {
        orderBy: [{ active: "desc" }, { firstName: "asc" }],
        include: { schedules: { orderBy: { dayOfWeek: "asc" } } },
      },
      openings: { orderBy: { dayOfWeek: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function requireProviderEstablishment() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.PROVIDER) {
    redirect("/pro/connexion");
  }

  const establishment = await getProviderEstablishment(session.user.id);
  if (!establishment) {
    redirect("/pro/inscription");
  }

  return { session, establishment };
}
