import { prisma } from "@/lib/prisma";
import { DAY_KEYS, type DayHours, type DayKey, type WorkingHoursMap } from "@/lib/working-hours";

export type ServiceData = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

export type BusinessData = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  services: ServiceData[];
};

const JS_DAY_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export type AppointmentData = {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
};

function toServiceData(service: {
  id: string;
  name: string;
  durationMinutes: number;
  price: unknown;
  active: boolean;
}): ServiceData {
  return {
    id: service.id,
    name: service.name,
    durationMinutes: service.durationMinutes,
    price: Number(service.price),
    active: service.active,
  };
}

export async function getBusinessBySlug(slug: string): Promise<BusinessData | null> {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: { services: { where: { active: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!business) return null;
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    phone: business.phone,
    address: business.address ?? "",
    services: business.services.map(toServiceData),
  };
}

// Convenience for single-tenant MVP surfaces (dev landing page, login screen
// branding) that run before a session exists. Once this becomes multi-tenant,
// these call sites will need a real business lookup instead.
export async function getFirstBusiness(): Promise<BusinessData | null> {
  const business = await prisma.business.findFirst({
    include: { services: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  if (!business) return null;
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    phone: business.phone,
    address: business.address ?? "",
    services: business.services.map(toServiceData),
  };
}

export async function getBusinessById(id: string): Promise<BusinessData | null> {
  const business = await prisma.business.findUnique({
    where: { id },
    include: { services: { orderBy: { createdAt: "asc" } } },
  });
  if (!business) return null;
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    phone: business.phone,
    address: business.address ?? "",
    services: business.services.map(toServiceData),
  };
}

export async function getAppointmentsForBusiness(businessId: string): Promise<AppointmentData[]> {
  const appointments = await prisma.appointment.findMany({
    where: { businessId, status: { not: "cancelled" } },
    include: { service: true },
    orderBy: { startTime: "asc" },
  });

  return appointments.map((apt) => ({
    id: apt.id,
    customerName: apt.customerName,
    customerPhone: apt.customerPhone,
    serviceId: apt.serviceId,
    serviceName: apt.service.name,
    startTime: apt.startTime,
    endTime: apt.endTime,
    durationMinutes: Math.round((apt.endTime.getTime() - apt.startTime.getTime()) / 60000),
  }));
}

const STEP_MINUTES = 30;
const DEFAULT_DAY_HOURS: DayHours = { closed: false, start: "09:00", end: "19:00" };

function parseWorkingHours(raw: unknown): WorkingHoursMap {
  const source = (raw as Record<string, { start: string; end: string }[]>) ?? {};
  const result = {} as WorkingHoursMap;
  for (const day of DAY_KEYS) {
    const ranges = source[day];
    if (Array.isArray(ranges) && ranges.length > 0) {
      result[day] = { closed: false, start: ranges[0].start, end: ranges[0].end };
    } else if (Array.isArray(ranges)) {
      result[day] = { closed: true, start: DEFAULT_DAY_HOURS.start, end: DEFAULT_DAY_HOURS.end };
    } else {
      result[day] = DEFAULT_DAY_HOURS;
    }
  }
  return result;
}

export async function getWorkingHours(businessId: string): Promise<WorkingHoursMap> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { workingHours: true },
  });
  return parseWorkingHours(business?.workingHours);
}

export async function updateWorkingHoursData(businessId: string, hours: WorkingHoursMap) {
  const raw: Record<DayKey, { start: string; end: string }[]> = {} as Record<
    DayKey,
    { start: string; end: string }[]
  >;
  for (const day of DAY_KEYS) {
    const d = hours[day];
    raw[day] = d.closed ? [] : [{ start: d.start, end: d.end }];
  }
  await prisma.business.update({ where: { id: businessId }, data: { workingHours: raw } });
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function getAvailableSlots(businessId: string, serviceId: string, dateISO: string) {
  const [service, business] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.business.findUnique({ where: { id: businessId }, select: { workingHours: true } }),
  ]);
  if (!service || !business) return { available: [] as string[], booked: [] as string[] };

  const dayStart = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(dayStart.getTime())) return { available: [] as string[], booked: [] as string[] };

  const dayKey = JS_DAY_TO_KEY[dayStart.getDay()];
  const dayHours = parseWorkingHours(business.workingHours)[dayKey];
  if (dayHours.closed) return { available: [] as string[], booked: [] as string[] };

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const existing = await prisma.appointment.findMany({
    where: {
      businessId,
      status: { not: "cancelled" },
      startTime: { gte: dayStart, lt: dayEnd },
    },
  });

  const available: string[] = [];
  const booked: string[] = [];
  const openMinutes = timeToMinutes(dayHours.start);
  const closeMinutes = timeToMinutes(dayHours.end);

  for (
    let minutes = openMinutes;
    minutes + service.durationMinutes <= closeMinutes;
    minutes += STEP_MINUTES
  ) {
    const slotStart = new Date(dayStart);
    slotStart.setMinutes(minutes);
    const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60000);
    const label = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

    const overlaps = existing.some((apt) => slotStart < apt.endTime && slotEnd > apt.startTime);
    if (overlaps) {
      booked.push(label);
    } else {
      available.push(label);
    }
  }

  return { available, booked };
}
