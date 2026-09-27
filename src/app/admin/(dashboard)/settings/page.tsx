import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBusinessById, getWorkingHours } from "@/lib/data";
import { BusinessSettingsForm } from "@/components/admin/business-settings-form";
import { WorkingHoursForm } from "@/components/admin/working-hours-form";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");

  const business = await getBusinessById(session.user.id);
  if (!business) redirect("/admin/login");

  const workingHours = await getWorkingHours(business.id);

  return (
    <div className="flex h-full flex-col gap-6 px-4 py-5 md:px-8 md:py-7">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Business information and working hours.</p>
      </div>

      <BusinessSettingsForm business={business} />
      <WorkingHoursForm initial={workingHours} />
    </div>
  );
}
