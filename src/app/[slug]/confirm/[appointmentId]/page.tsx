import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/data";

// Deep-link target for reminder emails etc. Not yet wired to a real
// appointment lookup by id — currently only confirms the business exists.
export default async function AppointmentConfirmPage(
  props: PageProps<"/[slug]/confirm/[appointmentId]">
) {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-4 text-center">
      <div className="max-w-sm">
        <h1 className="font-heading text-xl font-bold text-foreground">Appointment Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link isn&apos;t active yet. Appointment details will appear here once this page is connected.
        </p>
      </div>
    </main>
  );
}
