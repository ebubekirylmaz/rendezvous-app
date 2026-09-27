import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBusinessById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ServiceFormDialog } from "@/components/admin/service-form-dialog";
import { DeleteServiceButton } from "@/components/admin/delete-service-button";
import { cn } from "@/lib/utils";

export default async function AdminServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");

  const business = await getBusinessById(session.user.id);
  if (!business) redirect("/admin/login");

  return (
    <div className="flex h-full flex-col gap-6 px-8 py-7">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the services you offer, their duration, and pricing.
          </p>
        </div>
        <ServiceFormDialog
          trigger={<Button className="h-11 rounded-full px-5 text-sm font-semibold">+ New Service</Button>}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3.5 font-medium">Service</th>
              <th className="px-5 py-3.5 font-medium">Duration</th>
              <th className="px-5 py-3.5 font-medium">Price</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {business.services.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-5 py-4 font-semibold text-foreground">{s.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.durationMinutes} min</td>
                <td className="px-5 py-4 text-foreground">${s.price}</td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      s.active ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <ServiceFormDialog
                      service={s}
                      trigger={<button className="text-sm font-medium text-primary">Edit</button>}
                    />
                    <DeleteServiceButton serviceId={s.id} serviceName={s.name} />
                  </div>
                </td>
              </tr>
            ))}
            {business.services.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No services added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Changes are saved to the database instantly.
      </p>
    </div>
  );
}
