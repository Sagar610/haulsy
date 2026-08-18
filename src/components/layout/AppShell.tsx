"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { PageLoader } from "@/components/ui/Media";
import { useStore } from "@/lib/store";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { hydrated } = useStore();

  return (
    <div className="grain flex min-h-full flex-col pb-16 md:pb-0">
      <Header />
      <main className="flex-1">
        {hydrated ? children : <PageLoader />}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
