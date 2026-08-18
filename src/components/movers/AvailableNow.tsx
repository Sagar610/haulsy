"use client";

import { moversAvailableNow } from "@/lib/matching";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/format";
import { Radio } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function AvailableNow({
  city,
  compact,
  className,
}: {
  city?: string;
  compact?: boolean;
  className?: string;
}) {
  const { movers, bookings, hydrated } = useStore();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setPulse((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const stats = useMemo(
    () => moversAvailableNow(movers, bookings, { city }),
    [movers, bookings, city, pulse],
  );

  if (!hydrated) return null;

  const where = city ? ` in ${city}` : "";
  const live = stats.now > 0;

  if (compact) {
    return (
      <p className={cn("text-sm text-ink-soft", className)}>
        <span
          className={`mr-1.5 inline-block h-2 w-2 rounded-full ${live ? "bg-forest" : "bg-tape"}`}
        />
        {live
          ? `${stats.now} mover${stats.now === 1 ? "" : "s"} available now${where}`
          : stats.today
            ? `None on shift this minute${where} · ${stats.today} working today`
            : `No movers on the clock today${where}`}
      </p>
    );
  }

  return (
    <Link
      href="/movers"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors",
        live
          ? "border-forest/20 bg-sage hover:border-forest/40"
          : "border-line bg-cream hover:border-forest/25",
        className,
      )}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${live ? "bg-forest text-cream" : "bg-tape/30 text-ink"}`}
      >
        <Radio size={16} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">
          {live
            ? `${stats.now} mover${stats.now === 1 ? "" : "s"} available now`
            : stats.today
              ? "No one on shift this minute"
              : "Quiet on the clock today"}
        </span>
        <span className="mt-0.5 block text-xs text-ink-soft">
          {live
            ? `On shift and free to take a job${where}. ${stats.today} working today.`
            : stats.today
              ? `${stats.today} still working later today${where} — book a later slot.`
              : `Browse movers and pick a day they work${where || ""}.`}
        </span>
      </span>
    </Link>
  );
}
