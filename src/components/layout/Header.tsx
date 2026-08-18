"use client";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { initials } from "@/lib/format";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/moves", label: "Book a move" },
  { href: "/movers", label: "Movers" },
];

export function Header() {
  const { currentUser, logout, hydrated } = useStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                pathname === l.href || pathname.startsWith(l.href + "/")
                  ? "bg-sage text-forest"
                  : "text-ink-soft hover:bg-sage/60 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button href="/marketplace/new" variant="outline" size="sm">
            Sell an item
          </Button>
          {!hydrated ? (
            <div className="h-10 w-36 rounded-2xl bg-sage/70" aria-hidden />
          ) : currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.roles.includes("admin") ? (
                <Button href="/admin" variant="ghost" size="sm">
                  Admin
                </Button>
              ) : null}
              {currentUser.roles.includes("mover") ? (
                <Button href="/inbox" variant="ghost" size="sm">
                  Inbox
                </Button>
              ) : null}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-2xl border border-line bg-cream py-1 pr-3 pl-1"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest text-xs font-semibold text-cream">
                  {initials(currentUser.name)}
                </span>
                <span className="text-sm font-medium">{currentUser.name.split(" ")[0]}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Log out
              </Button>
            </div>
          ) : (
            <Button href="/login" size="sm">
              Log in
            </Button>
          )}
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-cream md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-line bg-cream px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-sage"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/marketplace/new"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-sage"
            >
              Sell an item
            </Link>
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-sage"
                >
                  Dashboard
                </Link>
                {currentUser.roles.includes("admin") ? (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-sage"
                  >
                    Admin
                  </Link>
                ) : null}
                {currentUser.roles.includes("mover") ? (
                  <Link
                    href="/inbox"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-sage"
                  >
                    Inbox
                  </Link>
                ) : null}
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-sage"
                >
                  Account
                </Link>
                <button
                  className="rounded-xl px-3 py-3 text-left text-sm font-medium text-ink-soft"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-forest"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
