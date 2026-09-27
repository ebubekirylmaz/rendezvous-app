import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/data";
import { BookingWizard } from "@/components/booking/booking-wizard";

export default async function BusinessBookingPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-full flex-1 bg-background flex justify-center py-0 sm:py-10">
      <BookingWizard business={business} />
    </main>
  );
}
