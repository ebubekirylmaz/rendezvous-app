import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/actions/auth";
import { getFirstBusiness } from "@/lib/data";

export default async function AdminLoginPage(props: PageProps<"/admin/login">) {
  const searchParams = await props.searchParams;
  const hasError = searchParams?.error !== undefined;
  const business = await getFirstBusiness();

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-[28px] bg-card p-8 shadow-xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-heading text-xl font-bold text-primary-foreground">
            {(business?.name ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">Admin Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">{business?.name ?? "Business not found"}</p>
          </div>
        </div>

        <form action={login} className="mt-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="example@business.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>

          {hasError && (
            <p className="text-sm text-destructive">
              Login failed. Please check your credentials.
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 h-[50px] rounded-full text-base font-semibold">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo account: admin@bloombeautystudio.com / demo1234
        </p>

        {business && (
          <Link
            href={`/${business.slug}`}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-foreground"
          >
            View Customer Booking Page
          </Link>
        )}
      </div>
    </main>
  );
}
