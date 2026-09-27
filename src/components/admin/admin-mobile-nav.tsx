"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { NAV_ITEMS, LogoutIcon } from "@/components/admin/admin-sidebar";
import type { BusinessData } from "@/lib/data";

export function AdminMobileHeader({ business }: { business: BusinessData }) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
          {business.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
        <div className="truncate text-sm font-bold text-foreground">{business.name}</div>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground"
          aria-label="Logout"
        >
          <LogoutIcon />
        </button>
      </form>
    </header>
  );
}

export function AdminMobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-shrink-0 items-stretch border-t border-border bg-card md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
