import Link from "next/link";
import { getFirstBusiness } from "@/lib/data";

export default async function Home() {
  const business = await getFirstBusiness();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Book Appointment</h1>
        <p className="mt-2 text-muted-foreground">
          Online appointment management for small businesses — development environment.
        </p>
      </div>
      {business ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${business.slug}`}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Customer Booking Page ({business.name})
          </Link>
          <Link
            href="/admin/login"
            className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground"
          >
            Admin Login
          </Link>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No business yet — run <code className="rounded bg-secondary px-1.5 py-0.5">npx prisma db seed</code>.
        </p>
      )}
    </main>
  );
}
