import { Badge } from "@/components/ui/Badge";
import { SmartImage } from "@/components/ui/Media";
import { VEHICLES } from "@/lib/constants";
import { formatPrice, initials } from "@/lib/format";
import { formatMiles } from "@/lib/geo";
import type { MoverProfile, User } from "@/lib/types";
import { Star } from "lucide-react";

export function MoverCard({
  mover,
  user,
  fee,
  miles,
  hours,
  rating = 0,
  reviewCount = 0,
  jobs = 0,
  selected,
  onSelect,
  compact,
}: {
  mover: MoverProfile;
  user?: User;
  fee?: number;
  miles?: number;
  hours?: number;
  rating?: number;
  reviewCount?: number;
  jobs?: number;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}) {
  const vehicle = VEHICLES[mover.vehicle];
  const name = user?.name ?? "Haulsy mover";
  const inner = (
    <>
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-sage">
          {mover.photo || user?.avatar ? (
            <SmartImage src={mover.photo || user?.avatar || ""} alt={name} />
          ) : (
            <div className="grid h-full place-items-center text-sm font-semibold text-forest">
              {initials(name)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-ink">{name}</p>
            <span className="inline-flex items-center gap-1 text-sm text-ink">
              <Star size={14} className="fill-tape text-tape" />
              {reviewCount ? rating.toFixed(1) : "New"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">
            {vehicle.label} · {vehicle.capacityM3} m³ · {vehicle.maxKg} kg
          </p>
        </div>
      </div>
      {!compact ? (
        <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{mover.bio}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone="sage">{formatPrice(mover.hourlyRate)}/hr</Badge>
        <Badge tone="line">from {formatPrice(mover.jobRate)} / job</Badge>
        {miles != null ? <Badge tone="line">{formatMiles(miles)}</Badge> : null}
        {hours != null ? <Badge tone="line">{hours}h</Badge> : null}
        {fee != null ? (
          <Badge tone="forest">Haul {formatPrice(fee)}</Badge>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        {mover.cities.join(" · ")} · {jobs} delivered · {reviewCount} review
        {reviewCount === 1 ? "" : "s"}
      </p>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`w-full rounded-[24px] border p-4 text-left transition-colors ${
          selected
            ? "border-forest bg-sage"
            : "border-line bg-cream hover:border-forest/30"
        }`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="rounded-[24px] border border-line bg-cream p-4">{inner}</div>
  );
}
