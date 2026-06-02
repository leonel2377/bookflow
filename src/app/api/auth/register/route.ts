import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { slugify } from "@/lib/session";

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
      role: UserRole;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      establishmentName?: string;
    };

    const normalizedEmail = email?.toLowerCase().trim();
    if (!normalizedEmail || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 },
      );
    }

    if (role !== UserRole.CLIENT && role !== UserRole.PROVIDER) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Cet e-mail est déjà utilisé" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    if (role === UserRole.CLIENT) {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            role: UserRole.CLIENT,
            firstName,
            lastName,
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
              firstName,
              lastName,
              phone: phone || existingClient.phone,
            },
          });
        } else {
          await tx.client.create({
            data: {
              email: normalizedEmail,
              firstName,
              lastName,
              phone: phone || null,
              userId: user.id,
            },
          });
        }
      });
      return NextResponse.json({ ok: true });
    }

    if (!establishmentName?.trim()) {
      return NextResponse.json(
        { error: "Le nom de l'établissement est requis" },
        { status: 400 },
      );
    }

    let slug = slugify(establishmentName);
    const slugTaken = await prisma.establishment.findUnique({ where: { slug } });
    if (slugTaken) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: UserRole.PROVIDER,
          firstName,
          lastName,
        },
      });
      await tx.establishment.create({
        data: {
          slug,
          name: establishmentName.trim(),
          email: normalizedEmail,
          phone: phone || null,
          ownerId: user.id,
          openings: {
            create: [1, 2, 3, 4, 5].map((day) => ({
              dayOfWeek: day,
              openTime: "09:00",
              closeTime: "19:00",
            })),
          },
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
