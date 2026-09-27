import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAppointmentsForBusiness, getBusinessById } from "@/lib/data";
import { AdminCalendarView } from "@/components/admin/admin-calendar-view";

export default async function AdminCalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");

  const business = await getBusinessById(session.user.id);
  if (!business) redirect("/admin/login");

  const appointments = await getAppointmentsForBusiness(business.id);

  return <AdminCalendarView business={business} appointments={appointments} />;
}
