import type { BookingStatus, ListingStatus, Role, User } from "./types";

export function isAdmin(user: User | null | undefined): boolean {
  return Boolean(user?.roles.includes("admin"));
}

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", match: (p: string) => p === "/admin" },
  {
    href: "/admin/users",
    label: "People",
    match: (p: string) => p.startsWith("/admin/users"),
  },
  {
    href: "/admin/listings",
    label: "Listings",
    match: (p: string) => p.startsWith("/admin/listings"),
  },
  {
    href: "/admin/jobs",
    label: "Jobs",
    match: (p: string) => p.startsWith("/admin/jobs"),
  },
  {
    href: "/admin/movers",
    label: "Movers",
    match: (p: string) => p.startsWith("/admin/movers"),
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    match: (p: string) => p.startsWith("/admin/reviews"),
  },
  {
    href: "/admin/messages",
    label: "Messages",
    match: (p: string) => p.startsWith("/admin/messages"),
  },
  {
    href: "/admin/finance",
    label: "Finance",
    match: (p: string) => p.startsWith("/admin/finance"),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    match: (p: string) => p.startsWith("/admin/settings"),
  },
] as const;

export const ADMIN_ROLES: Role[] = ["buyer", "seller", "mover", "admin"];

export const JOB_STATUSES: BookingStatus[] = [
  "pending",
  "accepted",
  "assigned",
  "en_route",
  "delivered",
  "declined",
  "cancelled",
];

export const LISTING_STATUSES: ListingStatus[] = [
  "live",
  "reserved",
  "sold",
  "withdrawn",
];

export const OPEN_JOB: BookingStatus[] = [
  "pending",
  "accepted",
  "assigned",
  "en_route",
];
