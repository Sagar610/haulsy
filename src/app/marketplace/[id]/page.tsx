"use client";

import { ListingCard } from "@/components/marketplace/ListingCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SmartImage } from "@/components/ui/Media";
import { CATEGORIES, VEHICLES } from "@/lib/constants";
import {
  formatDims,
  formatPrice,
  formatVolume,
  volumeM3,
} from "@/lib/format";
import { useStore } from "@/lib/store";
import { MapPin, Ruler, Scale, Truck } from "lucide-react";
import Link from "next/link";
import { use, useMemo, useState } from "react";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { listings, users, currentUser, updateListingStatus } = useStore();
  const listing = listings.find((l) => l.id === id);
  const [photo, setPhoto] = useState(0);

  const similar = useMemo(() => {
    if (!listing) return [];
    return listings
      .filter(
        (l) =>
          l.id !== listing.id &&
          l.status === "live" &&
          (l.category === listing.category || l.city === listing.city),
      )
      .slice(0, 3);
  }, [listings, listing]);

  if (!listing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">That listing has gone</h1>
        <Button href="/marketplace" className="mt-6">
          Back to marketplace
        </Button>
      </div>
    );
  }

  const seller = users.find((u) => u.id === listing.sellerId);
  const vol = volumeM3(listing.lengthCm, listing.widthCm, listing.heightCm);
  const cat = CATEGORIES.find((c) => c.id === listing.category)?.label;
  const sold = listing.status === "sold";
  const reserved = listing.status === "reserved";
  const withdrawn = listing.status === "withdrawn";
  const live = listing.status === "live";
  const own = listing.sellerId === currentUser?.id;
  const minVehicle =
    vol <= 0.4
      ? "car"
      : vol <= 1.2
        ? "estate"
        : vol <= 6
          ? "van"
          : vol <= 10
            ? "large_van"
            : "luton";

  const checkoutHref = currentUser
    ? `/checkout?listingId=${listing.id}`
    : `/login?next=${encodeURIComponent(`/checkout?listingId=${listing.id}`)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="relative overflow-hidden rounded-[28px] bg-sage">
            <div className="aspect-[4/3]">
              {listing.photos[photo] ? (
                <SmartImage
                  src={listing.photos[photo]}
                  alt={listing.title}
                  className={sold || reserved || withdrawn ? "grayscale" : undefined}
                />
              ) : (
                <div className="grid h-full place-items-center text-ink-soft">
                  No photo
                </div>
              )}
            </div>
            {sold || reserved || withdrawn ? (
              <div className="absolute inset-0 grid place-items-center bg-ink/35">
                <span className="rotate-[-8deg] rounded-md bg-tape px-5 py-1.5 text-base font-bold tracking-[0.22em] uppercase text-ink">
                  {withdrawn ? "Taken down" : reserved ? "Reserved" : "Sold"}
                </span>
              </div>
            ) : null}
          </div>
          {listing.photos.length > 1 ? (
            <div className="mt-3 flex gap-2">
              {listing.photos.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setPhoto(i)}
                  className={`h-16 w-20 overflow-hidden rounded-2xl border ${
                    photo === i ? "border-forest" : "border-line"
                  }`}
                >
                  <SmartImage
                    src={src}
                    alt=""
                    className={sold || reserved || withdrawn ? "grayscale" : undefined}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{cat}</Badge>
            <Badge tone="line">{listing.city}</Badge>
            {sold ? <Badge tone="tape">Sold</Badge> : null}
            {reserved ? <Badge tone="tape">Reserved</Badge> : null}
            {withdrawn ? <Badge tone="tape">Taken down</Badge> : null}
          </div>
          <h1 className="font-display mt-4 text-4xl tracking-tight">
            {listing.title}
          </h1>
          <p
            className={`mt-3 text-3xl font-semibold ${!live ? "text-ink-soft line-through" : "text-forest"}`}
          >
            {formatPrice(listing.price)}
          </p>

          {reserved ? (
            <div className="mt-4 rounded-2xl border border-tape/40 bg-tape/15 px-4 py-3 text-sm text-ink">
              A buyer has requested a mover. It is held until they accept or
              decline.
            </div>
          ) : null}
          {sold ? (
            <div className="mt-4 rounded-2xl border border-tape/40 bg-tape/15 px-4 py-3 text-sm text-ink">
              This item is booked and no longer for sale. The mover is collecting
              it for the buyer.
            </div>
          ) : null}
          {withdrawn ? (
            <div className="mt-4 rounded-2xl border border-line bg-canvas-2 px-4 py-3 text-sm text-ink">
              The seller took this listing down.
            </div>
          ) : null}

          <p className="mt-4 leading-relaxed text-ink-soft">
            {listing.description}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-sage p-4">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest">
                <Ruler size={14} /> Size
              </dt>
              <dd className="mt-1 text-sm">
                {formatDims(listing.lengthCm, listing.widthCm, listing.heightCm)}
              </dd>
              <dd className="text-xs text-ink-soft">{formatVolume(vol)}</dd>
            </div>
            <div className="rounded-2xl bg-sage p-4">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest">
                <Scale size={14} /> Weight
              </dt>
              <dd className="mt-1 text-sm">{listing.weightKg} kg</dd>
            </div>
            <div className="col-span-2 rounded-2xl bg-sage p-4">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest">
                <MapPin size={14} /> Pickup
              </dt>
              <dd className="mt-1 text-sm">{listing.pickupAddress}</dd>
            </div>
            <div className="col-span-2 rounded-2xl border border-line bg-cream p-4">
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                <Truck size={14} /> Suggested vehicle
              </dt>
              <dd className="mt-1 text-sm">
                {VEHICLES[minVehicle].label} or larger · {VEHICLES[minVehicle].blurb}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-ink-soft">
            Seller {seller?.name ?? "a Haulsy seller"} · {listing.city}
          </p>

          {live && !own ? (
            <Button href={checkoutHref} size="lg" className="mt-6 w-full">
              Buy & book a mover
            </Button>
          ) : live && own ? (
            <div className="mt-6 space-y-2">
              <Button variant="outline" size="lg" className="w-full" disabled>
                This is your listing
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => updateListingStatus(listing.id, "withdrawn")}
              >
                Take listing down
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="lg" className="mt-6 w-full" disabled>
              {withdrawn
                ? "Listing taken down"
                : reserved
                  ? "Reserved — awaiting mover"
                  : "Sold — already booked"}
            </Button>
          )}
          <p className="mt-3 text-center text-xs text-ink-soft">
            {sold
              ? "Browse similar live items below."
              : withdrawn
                ? "This listing is no longer on the marketplace."
                : "You pay the item and the haul together. The mover collects from the seller."}
          </p>
          <p className="mt-4 text-center text-sm">
            <Link
              href="/marketplace"
              className="text-forest underline-offset-2 hover:underline"
            >
              Back to marketplace
            </Link>
          </p>
        </div>
      </div>

      {similar.length ? (
        <section className="mt-14">
          <h2 className="font-display text-2xl">
            {sold ? "Still looking? These are live" : "You might also haul"}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
