"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireBusinessId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized.");
  return session.user.id;
}

function validate(input: { name: string; durationMinutes: number; price: number }) {
  if (!input.name.trim()) throw new Error("Service name is required.");
  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) {
    throw new Error("Duration must be greater than 0.");
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error("Price cannot be negative.");
  }
}

export type ServiceInput = {
  name: string;
  durationMinutes: number;
  price: number;
};

export async function createService(input: ServiceInput) {
  const businessId = await requireBusinessId();
  validate(input);

  await prisma.service.create({
    data: {
      businessId,
      name: input.name.trim(),
      durationMinutes: input.durationMinutes,
      price: input.price,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/admin/calendar");
}

export async function deleteService(serviceId: string) {
  const businessId = await requireBusinessId();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.businessId !== businessId) {
    throw new Error("Service not found.");
  }

  const appointmentCount = await prisma.appointment.count({ where: { serviceId } });
  if (appointmentCount > 0) {
    throw new Error("This service has existing appointments — you can mark it Inactive instead.");
  }

  await prisma.service.delete({ where: { id: serviceId } });

  revalidatePath("/admin/services");
  revalidatePath("/admin/calendar");
}

export async function updateService(serviceId: string, input: ServiceInput & { active: boolean }) {
  const businessId = await requireBusinessId();
  validate(input);

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.businessId !== businessId) {
    throw new Error("Service not found.");
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: input.name.trim(),
      durationMinutes: input.durationMinutes,
      price: input.price,
      active: input.active,
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/admin/calendar");
}
