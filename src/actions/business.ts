"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { updateWorkingHoursData } from "@/lib/data";
import { DAY_KEYS, type WorkingHoursMap } from "@/lib/working-hours";

export type BusinessSettingsInput = {
  name: string;
  slug: string;
  phone: string;
  address: string;
};

export async function updateBusinessSettings(input: BusinessSettingsInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized.");

  const name = input.name.trim();
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  if (!name) throw new Error("Business name is required.");
  if (!slug) throw new Error("Booking page link is required.");

  try {
    await prisma.business.update({
      where: { id: session.user.id },
      data: {
        name,
        slug,
        phone: input.phone.trim(),
        address: input.address.trim() || null,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new Error("This booking page link is already used by another business.");
    }
    throw err;
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath(`/${slug}`);
}

const TIME_RE = /^\d{2}:\d{2}$/;
const DAY_LABELS_EN: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export async function updateWorkingHours(input: WorkingHoursMap) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized.");

  for (const day of DAY_KEYS) {
    const d = input[day];
    if (!d) throw new Error("Invalid data.");
    if (!d.closed) {
      if (!TIME_RE.test(d.start) || !TIME_RE.test(d.end)) {
        throw new Error(`${DAY_LABELS_EN[day]}: invalid time format.`);
      }
      if (d.start >= d.end) {
        throw new Error(`${DAY_LABELS_EN[day]}: closing time must be after opening time.`);
      }
    }
  }

  await updateWorkingHoursData(session.user.id, input);

  revalidatePath("/admin/settings");
}
