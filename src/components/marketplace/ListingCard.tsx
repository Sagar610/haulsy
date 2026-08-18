import { Badge } from "@/components/ui/Badge";
import { SmartImage } from "@/components/ui/Media";
import { CATEGORIES } from "@/lib/constants";
import {
  formatDims,
  formatPrice,
  formatVolume,
  volumeM3,
} from "@/lib/format";
import type { Listing } from "@/lib/types";
import { MapPin } from "lucide-react";
import Link from "next/link";

export function ListingCard({ listing }: { listing: Listing }) {
  const vol = volumeM3(listing.lengthCm, listing.widthCm, listing.heightCm);
  const cat = CATEGORIES.find((c) => c.id === listing.category)?.label;
  const unavailable = listing.status !== "live";
  const stamp =
    listing.status === "withdrawn"
      ? "Taken down"
      : listing.status === "reserved"
        ? "Reserved"
        : listing.status === "sold"
          ? "Sold"
          : null;

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className={`group flex flex-col overflow-hidden rounded-[24px] border border-line bg-cream ${
        unavailable
          ? "opacity-95"
          : "transition-transform duration-200 hover:-translate-y-0.5"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sage">
        {listing.photos[0] ? (
          <SmartImage
            src={listing.photos[0]}
            alt={listing.title}
            className={
              unavailable
                ? "grayscale"
                : "transition-transform duration-500 group-hover:scale-[1.03]"
            }
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink-soft">
            No photo
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge tone="cream">{cat}</Badge>
        </div>
        {!unavailable ? (
          <div className="absolute right-3 bottom-3">
            <Badge tone="forest">{formatVolume(vol)}</Badge>
          </div>
        ) : null}
        {stamp ? (
          <div className="absolute inset-0 grid place-items-center bg-ink/40">
            <span className="rotate-[-8deg] rounded-md bg-tape px-4 py-1.5 text-sm font-bold tracking-[0.2em] uppercase text-ink">
              {stamp}
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-snug tracking-tight text-ink">
            {listing.title}
          </h3>
          <p
            className={`shrink-0 text-base font-semibold ${unavailable ? "text-ink-soft line-through" : "text-forest"}`}
          >
            {formatPrice(listing.price)}
          </p>
        </div>
        <p className="mt-2 flex items-center gap-1 text-sm text-ink-soft">
          <MapPin size={14} /> {listing.city}
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          {unavailable
            ? listing.status === "withdrawn"
              ? "Taken down by the seller"
              : listing.status === "reserved"
                ? "Requested — waiting on a mover"
                : "Booked — no longer available"
            : `${formatDims(listing.lengthCm, listing.widthCm, listing.heightCm)} · ${listing.weightKg} kg`}
        </p>
      </div>
    </Link>
  );
}
