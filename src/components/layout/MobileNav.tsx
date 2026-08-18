"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/format";
import { Home, LayoutGrid, Truck, CalendarCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/marketplace",
    label: "Shop",
    icon: LayoutGrid,
    match: (p: string) => p.startsWith("/marketplace"),
  },
  {
    href: "/moves",
    label: "Moves",
    icon: Truck,
    match: (p: string) => p.startsWith("/moves"),
  },
  {
    href: "/bookings",
    label: "Jobs",
    icon: CalendarCheck,
    match: (p: string) =>
      p.startsWith("/bookings") ||
      p.startsWith("/checkout") ||
      p.startsWith("/inbox"),
  },
  {
    href: "/dashboard",
    label: "You",
    icon: UserRound,
    match: (p: string) =>
      p.startsWith("/dashboard") ||
      p.startsWith("/login") ||
      p.startsWith("/signup") ||
      p.startsWith("/movers/join"),
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const href = t.href === "/dashboard" && !currentUser ? "/login" : t.href;
          const active = t.match(pathname);
          const Icon = t.icon;
          return (
            <li key={t.label}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                  active ? "text-forest" : "text-ink-soft",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
