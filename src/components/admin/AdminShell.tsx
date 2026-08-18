"use client";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Media";
import { ADMIN_NAV, isAdmin } from "@/lib/admin";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  const { currentUser, hydrated, logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace("/login?next=/admin");
      return;
    }
    if (!isAdmin(currentUser)) {
      router.replace("/dashboard");
    }
  }, [hydrated, currentUser, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!hydrated || !currentUser || !isAdmin(currentUser)) {
    return <PageLoader />;
  }

  return (
    <div className="flex h-svh overflow-hidden bg-canvas">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 shrink-0 flex-col bg-forest text-cream transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-cream/10 px-3">
          <Logo
            className="[&_span.font-display]:text-cream"
            markClassName="h-8 w-8 bg-forest-deep text-tape"
          />
          <button
            className="grid h-8 w-8 place-items-center rounded-lg md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
        <p className="shrink-0 px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-tape">
          Operations
        </p>
        <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {ADMIN_NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-cream/15 text-cream"
                    : "text-cream/70 hover:bg-cream/10 hover:text-cream",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-cream/10 p-3">
          <p className="truncate text-sm font-medium">{currentUser.name}</p>
          <p className="truncate text-xs text-cream/60">{currentUser.email}</p>
          <div className="mt-2 flex gap-2">
            <Button href="/" variant="cream" size="sm" className="h-8 flex-1">
              Site
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-cream/80 hover:bg-cream/10 hover:text-cream"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut size={14} />
            </Button>
          </div>
        </div>
      </aside>
      {open ? (
        <button
          className="fixed inset-0 z-40 bg-ink/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-canvas px-4">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-cream md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={16} />
          </button>
          <p className="font-display text-base">Haulsy admin</p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
