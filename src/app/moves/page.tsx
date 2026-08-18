"use client";

import { AvailableNow } from "@/components/movers/AvailableNow";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Media";
import { LOAD_PRESETS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MovesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Moves"
        title="Hire a van, not a whole company"
        body="Tell us the size of the load and when you need it. We match people whose vehicle and hours fit — they set the rate."
      />

      <div className="mt-6">
        <AvailableNow />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(LOAD_PRESETS) as Array<keyof typeof LOAD_PRESETS>).map(
          (key) => {
            const p = LOAD_PRESETS[key];
            return (
              <Link
                key={key}
                href={`/moves/new?preset=${key}`}
                className="rounded-[24px] border border-line bg-cream p-6 transition-transform hover:-translate-y-0.5"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-forest">
                  {p.volumeM3} m³ · {p.weightKg} kg
                </p>
                <h2 className="font-display mt-2 text-2xl">{p.label}</h2>
                <p className="mt-2 text-sm text-ink-soft">{p.hint}</p>
                <p className="mt-4 text-sm font-medium text-ink">
                  Typically {p.hours} hours on the clock
                </p>
              </Link>
            );
          },
        )}
      </div>

      <div className="mt-10 rounded-[32px] bg-forest p-8 text-cream sm:p-10">
        <h2 className="font-display text-3xl">How a Haulsy move works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          <li>
            <p className="text-tape text-xs font-semibold uppercase tracking-wider">
              1. Size it
            </p>
            <p className="mt-2 text-cream/85">
              Pick a preset or describe a few items. We convert that into volume
              and weight so the wrong van never shows up.
            </p>
          </li>
          <li>
            <p className="text-tape text-xs font-semibold uppercase tracking-wider">
              2. Match
            </p>
            <p className="mt-2 text-cream/85">
              Only movers covering both addresses, free in that slot, with
              enough capacity, appear — tightest vehicle fit first, then price.
            </p>
          </li>
          <li>
            <p className="text-tape text-xs font-semibold uppercase tracking-wider">
              3. Pay
            </p>
            <p className="mt-2 text-cream/85">
              Their haul fee plus a small Haulsy service fee. No cash on the
              doorstep.
            </p>
          </li>
        </ol>
        <Button href="/moves/new" variant="tape" size="lg" className="mt-8">
          Start a move <ArrowRight size={18} />
        </Button>
      </div>

      <p className="mt-8 text-sm text-ink-soft">
        Buying a specific sofa or fridge instead?{" "}
        <Link href="/marketplace" className="font-medium text-forest">
          Use the marketplace
        </Link>{" "}
        so the mover collects from the seller.
      </p>
      <p className="mt-2 text-xs text-ink-soft">
        Typical haul for a studio in the same city starts around {formatPrice(105)}{" "}
        before the Haulsy fee, depending on the mover.
      </p>
    </div>
  );
}
