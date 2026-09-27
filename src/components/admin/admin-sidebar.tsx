"use client";

import type { BusinessData } from "@/lib/data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { usePathname } from "next/navigation";

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.09A1.7 1.7 0 009 19.4a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.55-1H3a2 2 0 110-4h.09A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.55V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 9a1.7 1.7 0 001.55 1H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.55 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/admin/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/admin/services", label: "Services", icon: ListIcon },
  { href: "/admin/settings", label: "Settings", icon: GearIcon },
];

export function AdminSidebar({ business }: { business: BusinessData }) {
  const pathname = usePathname();
  const [firstName, ...restName] = business.name.split(" ");

  return (
    <aside className="flex h-full w-[260px] flex-shrink-0 flex-col border-r border-border bg-card py-6">
      <div className="flex items-center gap-3 border-b border-border px-6 pb-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-heading text-base font-bold text-primary-foreground">
          {business.name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <div className="text-sm font-bold leading-tight text-foreground">
            {firstName}
          </div>
          <div className="text-xs text-muted-foreground">
            {restName.join(" ")}
          </div>
        </div>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium",
                active
                  ? "bg-secondary text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary/60",
              )}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 border-t border-border px-6 pt-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-[#6B5A82]">
          A
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">Admin</div>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <LogoutIcon />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
