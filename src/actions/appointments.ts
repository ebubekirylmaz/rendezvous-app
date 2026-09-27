"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/data";

export type CreateAppointmentInput = {
  businessId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  customerPhone: string;
};

export async function createAppointment(input: CreateAppointmentInput) {
  const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
  if (!service) {
    throw new Error("Service not found.");
  }

  const [hours, minutes] = input.time.split(":").map(Number);
  const startTime = new Date(`${input.date}T00:00:00`);
  startTime.setHours(hours, minutes, 0, 0);
  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      businessId: input.businessId,
      status: { not: "cancelled" },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (conflict) {
    throw new Error("That time slot was just booked. Please choose another time.");
  }

  const appointment = await prisma.appointment.create({
    data: {
      businessId: input.businessId,
      serviceId: input.serviceId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      startTime,
      endTime,
      status: "confirmed",
    },
  });

  revalidatePath("/admin/calendar");

  return { id: appointment.id };
}

export async function getAvailableSlotsAction(businessId: string, serviceId: string, date: string) {
  return getAvailableSlots(businessId, serviceId, date);
}

export async function cancelAppointment(appointmentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized.");

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment || appointment.businessId !== session.user.id) {
    throw new Error("Appointment not found.");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "cancelled" },
  });

  revalidatePath("/admin/calendar");
}
