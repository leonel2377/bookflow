import { PrismaClient, SubscriptionPlan, UserRole } from "@prisma/client";
import { addDays, setHours, setMinutes } from "date-fns";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo1234";

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const proUser = await prisma.user.upsert({
    where: { email: "pro@studio-eclat.demo" },
    update: {},
    create: {
      email: "pro@studio-eclat.demo",
      passwordHash,
      role: UserRole.PROVIDER,
      firstName: "Marie",
      lastName: "Bernard",
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "client@demo.com" },
    update: {},
    create: {
      email: "client@demo.com",
      passwordHash,
      role: UserRole.CLIENT,
      firstName: "Julie",
      lastName: "Dupont",
    },
  });

  const salon = await prisma.establishment.upsert({
    where: { slug: "studio-eclat" },
    update: { ownerId: proUser.id },
    create: {
      slug: "studio-eclat",
      name: "Studio Éclat",
      description:
        "Salon de coiffure et soins bien-être au centre-ville. Colorations, coupes et soins visage.",
      address: "12 rue des Lilas",
      city: "Lyon",
      phone: "04 00 00 00 00",
      email: "contact@studio-eclat.demo",
      plan: SubscriptionPlan.PREMIUM,
      addons: JSON.stringify(["BOUTIQUE_EN_LIGNE"]),
      ownerId: proUser.id,
      photos: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
            sortOrder: 0,
          },
        ],
      },
      openings: {
        create: [
          { dayOfWeek: 1, openTime: "09:00", closeTime: "19:00" },
          { dayOfWeek: 2, openTime: "09:00", closeTime: "19:00" },
          { dayOfWeek: 3, openTime: "09:00", closeTime: "19:00" },
          { dayOfWeek: 4, openTime: "09:00", closeTime: "19:00" },
          { dayOfWeek: 5, openTime: "09:00", closeTime: "19:00" },
          { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00" },
          { dayOfWeek: 0, closed: true, openTime: "00:00", closeTime: "00:00" },
        ],
      },
      staff: {
        create: [
          { firstName: "Léa", lastName: "Martin", role: "Coiffeuse", color: "#8b5a6b" },
          { firstName: "Noémie", lastName: "Dupont", role: "Esthéticienne", color: "#2d4a3e" },
        ],
      },
      services: {
        create: [
          {
            name: "Coupe femme",
            durationMinutes: 45,
            priceCents: 4500,
            category: "Coiffure",
          },
          {
            name: "Coloration",
            durationMinutes: 120,
            priceCents: 8500,
            category: "Coiffure",
          },
          {
            name: "Soin visage",
            durationMinutes: 60,
            priceCents: 6500,
            category: "Soins",
          },
        ],
      },
    },
  });

  const client = await prisma.client.upsert({
    where: { email: "client@demo.com" },
    update: { userId: clientUser.id },
    create: {
      email: "client@demo.com",
      firstName: "Julie",
      lastName: "Dupont",
      phone: "06 00 00 00 00",
      smsReminders: true,
      userId: clientUser.id,
    },
  });

  const service = await prisma.service.findFirst({
    where: { establishmentId: salon.id, name: "Coupe femme" },
  });
  const staffList = await prisma.staffMember.findMany({
    where: { establishmentId: salon.id },
  });

  for (const member of staffList) {
    for (const day of [1, 2, 3, 4, 5, 6]) {
      await prisma.staffSchedule.upsert({
        where: {
          id: `schedule-${member.id}-${day}`,
        },
        update: {},
        create: {
          id: `schedule-${member.id}-${day}`,
          staffId: member.id,
          dayOfWeek: day,
          startTime: day === 6 ? "09:00" : "09:00",
          endTime: day === 6 ? "17:00" : "19:00",
        },
      });
    }
  }

  const staff = staffList[0];

  if (service) {
    const tomorrow = addDays(new Date(), 1);
    const startAt = setMinutes(setHours(tomorrow, 10), 30);
    const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000);

    await prisma.appointment.upsert({
      where: { id: "demo-appointment-1" },
      update: {},
      create: {
        id: "demo-appointment-1",
        startAt,
        endAt,
        clientId: client.id,
        establishmentId: salon.id,
        serviceId: service.id,
        staffId: staff?.id,
        status: "CONFIRMED",
      },
    });
  }

  console.log(`Salon démo : /salons/${salon.slug}`);
  console.log("Comptes démo (mot de passe: demo1234):");
  console.log("  Client : client@demo.com → /connexion");
  console.log("  Pro    : pro@studio-eclat.demo → /pro/connexion");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
