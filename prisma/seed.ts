import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "admin@bloombeautystudio.com";
const ADMIN_PASSWORD = "demo1234";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const business = await prisma.business.upsert({
    where: { slug: "bloom-beauty-studio" },
    update: {},
    create: {
      name: "Bloom Beauty Studio",
      slug: "bloom-beauty-studio",
      phone: "+1 (555) 987-6543",
      address: "123 Main Street, Downtown",
      workingHours: {
        mon: [{ start: "09:00", end: "19:00" }],
        tue: [{ start: "09:00", end: "19:00" }],
        wed: [{ start: "09:00", end: "19:00" }],
        thu: [{ start: "09:00", end: "19:00" }],
        fri: [{ start: "09:00", end: "19:00" }],
        sat: [{ start: "09:00", end: "19:00" }],
        sun: [],
      },
      adminEmail: ADMIN_EMAIL,
      adminPassword: passwordHash,
      services: {
        create: [
          { name: "Haircut", durationMinutes: 30, price: 300 },
          { name: "Facial Treatment", durationMinutes: 60, price: 500 },
          { name: "Manicure & Pedicure", durationMinutes: 45, price: 250 },
          { name: "Massage Therapy", durationMinutes: 60, price: 600 },
        ],
      },
    },
  });

  console.log(`Seeded business: ${business.name} (${business.slug})`);
  console.log(`Admin login -> email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
