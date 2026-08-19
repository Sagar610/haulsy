import { Logo } from "@/components/layout/Logo";
import { SmartImage } from "@/components/ui/Media";
import { ShieldCheck, Truck, Wallet } from "lucide-react";
import type { ReactNode } from "react";

const points = [
  {
    icon: Truck,
    title: "Pickup included",
    body: "Match a van to the real size of the item, then have it collected and delivered.",
  },
  {
    icon: Wallet,
    title: "One checkout",
    body: "Pay for the listing and the haul together, in CAD.",
  },
  {
    icon: ShieldCheck,
    title: "Built for Canada",
    body: "Buyers, sellers, and drivers from Toronto to Vancouver.",
  },
];

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh bg-canvas lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <aside className="relative hidden overflow-hidden bg-forest lg:flex lg:min-h-svh lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(247,243,236,0.08) 0.8px, transparent 0.8px)",
            backgroundSize: "12px 12px",
          }}
        />
        <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-tape/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

        <div className="relative z-10 flex min-h-svh w-full flex-col justify-between px-12 py-10 xl:px-16">
          <Logo light />

          <div className="mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tape">
              Marketplace + movers
            </p>
            <h2 className="font-display mt-4 max-w-md text-4xl leading-[1.15] text-cream xl:text-5xl">
              Buy bulky. We bring it home.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cream/70">
              One account to shop large items, list furniture, or take driving
              jobs — with pickup and delivery in the same checkout.
            </p>

            <div className="mt-8 hidden overflow-hidden rounded-3xl border border-white/10 xl:block">
              <SmartImage
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
                alt="Velvet sofa ready for pickup"
                className="aspect-[16/9]"
              />
            </div>

            <ul className="mt-8 space-y-4">
              {points.map((p) => (
                <li key={p.title} className="flex gap-3.5">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-tape">
                    <p.icon size={16} strokeWidth={1.75} />
                  </span>
                  <span>
                    <p className="text-sm font-semibold text-cream">{p.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-cream/65">
                      {p.body}
                    </p>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-12 text-xs text-cream/45">
            Haulsy · Canada · Prices in CAD
          </p>
        </div>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="flex items-center justify-between px-5 py-4 lg:hidden">
          <Logo />
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
