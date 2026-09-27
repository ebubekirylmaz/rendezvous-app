import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBusinessById } from "@/lib/data";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const business = await getBusinessById(session.user.id);
  if (!business) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-dvh w-full bg-background">
      <AdminSidebar business={business} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
