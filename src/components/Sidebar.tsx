"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  Activity,
  HomeIcon,
  BellRing,
} from "lucide-react";
import { clsx } from "clsx";

const NAV: { href: string; label: string; icon: typeof HomeIcon }[] = [
  { href: "/", label: "Board", icon: LayoutGrid },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/activity", label: "Activity", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] hidden md:flex flex-col">
      <div className="px-5 pt-6 pb-5 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-[var(--accent)] grid place-items-center text-white font-semibold text-sm">
            kw
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">Listings</div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--foreground-subtle)]">
              Keller Williams
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--foreground-subtle)] px-2 mb-2">
          Workspace
        </div>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] font-medium"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-[var(--border)]">
        <div className="rounded-lg bg-[var(--background)] border border-[var(--border)] p-3">
          <div className="flex items-start gap-2">
            <BellRing className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
            <div>
              <div className="text-[12px] font-semibold leading-tight">
                One source of truth
              </div>
              <div className="text-[11px] text-[var(--foreground-muted)] mt-0.5 leading-snug">
                Subscribe to listings to get pinged when Marie moves things.
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
