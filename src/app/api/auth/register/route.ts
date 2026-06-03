import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/roles";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { uniqueEstablishmentSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

function registerError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      role,
      email,
      password,
      firstName,
      lastName,
      phone,
      establishmentName,
    } = body as {
      role: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      establishmentName?: string;
    };

    const normalizedEmail = email?.toLowerCase().trim();
    if (!normalizedEmail || !password || !firstName?.trim() || !lastName?.trim()) {
      return registerError("Champs obligatoires manquants", 400);
    }

    if (password.length < 8) {
      return registerError("Le mot de passe doit contenir au moins 8 caractères", 400);
    }

    const userRole =
      role === UserRole.PROVIDER || role === "PROVIDER"
        ? UserRole.PROVIDER
        : role === UserRole.CLIENT || role === "CLIENT"
          ? UserRole.CLIENT
          : null;

    if (!userRole) {
      return registerError("Rôle invalide", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return registerError("Cet e-mail est déjà utilisé", 409);
    }

    const passwordHash = await hashPassword(password);

    if (userRole === UserRole.CLIENT) {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            role: UserRole.CLIENT,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          },
        });
        const existingClient = await tx.client.findUnique({
          where: { email: normalizedEmail },
        });
        if (existingClient) {
          await tx.client.update({
            where: { id: existingClient.id },
            data: {
              userId: user.id,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phone: phone || existingClient.phone,
            },
          });
        } else {
          await tx.client.create({
            data: {
              email: normalizedEmail,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phone: phone || null,
              userId: user.id,
            },
          });
        }
      });
      return NextResponse.json({ ok: true });
    }

    const trimmedEstablishment = establishmentName?.trim();
    if (!trimmedEstablishment) {
      return registerError("Le nom de l'établissement est requis", 400);
    }

    const slug = await uniqueEstablishmentSlug(trimmedEstablishment, (s) =>
      prisma.establishment.findUnique({ where: { slug: s }, select: { id: true } }),
    );

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: UserRole.PROVIDER,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      });

      const establishment = await tx.establishment.create({
        data: {
          slug,
          name: trimmedEstablishment,
          email: normalizedEmail,
          phone: phone?.trim() || null,
          ownerId: user.id,
        },
      });

      await tx.openingHours.createMany({
        data: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
          establishmentId: establishment.id,
          dayOfWeek,
          openTime: "09:00",
          closeTime: "19:00",
        })),
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register]", e);

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return registerError("Cet e-mail ou ce nom de salon est déjà utilisé", 409);
      }
      if (e.code === "P1000" || e.code === "P1001" || e.code === "P1017") {
        return registerError(
          "Impossible de joindre la base de données. Vérifiez DATABASE_URL sur Hostinger.",
          503,
        );
      }
    }

    const message = e instanceof Error ? e.message : "";
    if (message.includes("Authentication failed") || message.includes("credentials")) {
      return registerError(
        "Connexion base de données refusée (mot de passe MySQL incorrect dans Hostinger).",
        503,
      );
    }

    return registerError("Erreur serveur", 500);
  }
}
