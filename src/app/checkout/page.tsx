"use client";

import { JobMap } from "@/components/map/JobMap";
import { MoverCard } from "@/components/movers/MoverCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { EmptyState, PageLoader } from "@/components/ui/Media";
import { CITIES, LOAD_PRESETS, NOTE_CHIPS, TIME_SLOTS } from "@/lib/constants";
import {
  formatPrice,
  formatSlot,
  formatVolume,
  nextDates,
  todayIso,
} from "@/lib/format";
import { cityPoint, formatMiles, geocode, haversineMiles } from "@/lib/geo";
import { listingVolume, matchMovers, presetLoad } from "@/lib/matching";
import { jobsDone, moverRating } from "@/lib/stats";
import { useStore } from "@/lib/store";
import type { GeoPoint, TimeSlot } from "@/lib/types";
import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const steps = ["Route", "Mover", "Request", "Sent"];

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const listingId = params.get("listingId");
  const moveId = params.get("moveId");
  const {
    listings,
    movers,
    users,
    bookings,
    moveRequests,
    reviews,
    currentUser,
    hydrated,
    createBooking,
    sendMessage,
  } = useStore();

  const listing = listings.find((l) => l.id === listingId);
  const move = moveRequests.find((m) => m.id === moveId);

  const [step, setStep] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [date, setDate] = useState(move?.when.date ?? todayIso());
  const [slotStart, setSlotStart] = useState(move?.when.start ?? "10:00");
  const [selectedMoverId, setSelectedMoverId] = useState<string | null>(null);
  const [notes, setNotes] = useState(move?.notes ?? "");
  const [pickup, setPickup] = useState<GeoPoint | null>(null);
  const [dropoff, setDropoff] = useState<GeoPoint | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const addressValue =
    deliveryAddress ||
    (currentUser ? `Somewhere in ${currentUser.city}` : "");
  const cityValue = deliveryCity || currentUser?.city || "Toronto";

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      const next = listingId
        ? `/checkout?listingId=${listingId}`
        : `/checkout?moveId=${moveId}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [hydrated, currentUser, router, listingId, moveId]);

  const pickupAddress = listing?.pickupAddress ?? move?.fromAddress ?? "";
  const pickupCity = listing?.city ?? move?.fromCity ?? "Toronto";
  const dropAddress = listing ? addressValue : move?.toAddress ?? addressValue;
  const dropCity = listing ? cityValue : move?.toCity ?? cityValue;

  useEffect(() => {
    let live = true;
    const t = window.setTimeout(() => {
      void geocode(pickupAddress, pickupCity).then((p) => {
        if (live) setPickup(p);
      });
      void geocode(dropAddress, dropCity).then((d) => {
        if (live) setDropoff(d);
      });
    }, 400);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [pickupAddress, pickupCity, dropAddress, dropCity]);

  const slot: TimeSlot = useMemo(() => {
    const t = TIME_SLOTS.find((s) => s.start === slotStart) ?? TIME_SLOTS[1];
    return { date, start: t.start, end: t.end };
  }, [date, slotStart]);

  const from = pickup ?? cityPoint(pickupCity, pickupAddress);
  const to = dropoff ?? cityPoint(dropCity, dropAddress);
  const miles = haversineMiles(from, to);

  const load = useMemo(() => {
    if (listing) {
      return {
        volume: listingVolume(listing),
        weightKg: listing.weightKg,
        pickupCity: listing.city,
        dropCity: cityValue,
        hours: undefined as number | undefined,
        itemPrice: listing.price,
        title: listing.title,
      };
    }
    if (move) {
      const p = presetLoad(move.loadPreset);
      return {
        volume: p.volumeM3,
        weightKg: p.weightKg,
        pickupCity: move.fromCity,
        dropCity: move.toCity,
        hours: p.hours,
        itemPrice: 0,
        title: `${LOAD_PRESETS[move.loadPreset].label} move`,
      };
    }
    return null;
  }, [listing, move, cityValue]);

  const matches = useMemo(() => {
    if (!load) return [];
    return matchMovers({
      movers,
      bookings,
      volume: load.volume,
      weightKg: load.weightKg,
      pickupCity: load.pickupCity,
      dropCity: load.dropCity,
      pickup: from,
      dropoff: to,
      slot,
      presetHours: load.hours,
    });
  }, [load, movers, bookings, slot, from, to]);

  const chosen = matches.find((m) => m.mover.userId === selectedMoverId);

  if (!hydrated || !currentUser) return <PageLoader />;

  if (!listing && !move) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="Nothing to check out"
          body="Pick a listing or start a move first."
          action={<Button href="/marketplace">Marketplace</Button>}
        />
      </div>
    );
  }

  if (listing && listing.sellerId === currentUser.id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="This is your listing"
          body="You cannot buy your own item."
          action={<Button href="/marketplace">Back to marketplace</Button>}
        />
      </div>
    );
  }

  if (listing && listing.status !== "live") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="This item is sold"
          body="Someone already requested a mover for it."
          action={<Button href="/marketplace">Browse listings</Button>}
        />
      </div>
    );
  }

  const itemPrice = load?.itemPrice ?? 0;
  const haulFee = chosen?.haulFee ?? 0;
  const serviceFee = chosen?.serviceFee ?? 0;
  const total = itemPrice + haulFee + serviceFee;

  function requestMover() {
    if (!chosen || !load) return;
    const booking = createBooking({
      type: listing ? "marketplace" : "move",
      moverId: chosen.mover.userId,
      listingId: listing?.id,
      moveRequestId: move?.id,
      slot,
      pickupAddress,
      pickupCity,
      deliveryAddress: dropAddress,
      deliveryCity: dropCity,
      pickup: from,
      dropoff: to,
      distanceMiles: miles,
      itemPrice,
      haulFee: chosen.haulFee,
      serviceFee: chosen.serviceFee,
      total,
      notes: notes.trim(),
    });
    if (notes.trim()) sendMessage(booking.id, notes.trim());
    setBookingId(booking.id);
    setStep(3);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Request a mover
      </p>
      <h1 className="font-display mt-2 text-4xl tracking-tight">
        {load?.title}
      </h1>
      <ol className="mt-6 flex gap-2">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded-full px-2 py-1.5 text-center text-xs font-medium ${
              i === step
                ? "bg-forest text-cream"
                : i < step
                  ? "bg-sage text-forest"
                  : "bg-canvas-2 text-ink-soft"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="mt-8 space-y-4">
          {listing ? (
            <>
              <Field label="Deliver to">
                <Input
                  value={addressValue}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Your address"
                  required
                />
              </Field>
              <Field label="City">
                <Select
                  value={cityValue}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                >
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date">
                  <Select value={date} onChange={(e) => setDate(e.target.value)}>
                    {nextDates(14).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Window">
                  <Select
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s.start} value={s.start}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </>
          ) : move ? (
            <div className="rounded-[24px] border border-line bg-cream p-5 text-sm">
              <p>
                <strong>From</strong> {move.fromAddress}
              </p>
              <p className="mt-2">
                <strong>To</strong> {move.toAddress}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Change date">
                  <Select value={date} onChange={(e) => setDate(e.target.value)}>
                    {nextDates(14).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Window">
                  <Select
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s.start} value={s.start}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          ) : null}

          <JobMap pickup={from} dropoff={to} miles={miles} />
          <p className="text-sm text-ink-soft">
            {formatMiles(miles)} from {pickupCity} to {dropCity}. Haul fee is
            hours plus mileage after 4 miles.
          </p>
          <Button onClick={() => setStep(1)} size="lg" className="w-full">
            Find movers for {formatSlot(slot)}
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-8">
          <p className="text-sm text-ink-soft">
            {formatMiles(miles)} · {formatVolume(load?.volume ?? 0)} ·{" "}
            {load?.weightKg} kg · {formatSlot(slot)}
          </p>
          {matches.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Nobody free in that window"
                body="Try another date or time."
                action={
                  <Button variant="outline" onClick={() => setStep(0)}>
                    Change slot
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {matches.map((m) => {
                const stats = moverRating(reviews, m.mover.userId);
                return (
                  <MoverCard
                    key={m.mover.id}
                    mover={m.mover}
                    user={users.find((u) => u.id === m.mover.userId)}
                    fee={m.totalHaul}
                    miles={m.miles}
                    hours={m.hours}
                    rating={stats.rating}
                    reviewCount={stats.count}
                    jobs={jobsDone(bookings, m.mover.userId)}
                    selected={selectedMoverId === m.mover.userId}
                    onSelect={() => setSelectedMoverId(m.mover.userId)}
                  />
                );
              })}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              className="flex-1"
              disabled={!chosen}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 && chosen ? (
        <div className="mt-8 space-y-5">
          <div className="rounded-[24px] border border-line bg-cream p-5">
            <h2 className="font-medium">Quote</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {itemPrice > 0 ? (
                <li className="flex justify-between">
                  <span>Item</span>
                  <span>{formatPrice(itemPrice)}</span>
                </li>
              ) : null}
              <li className="flex justify-between">
                <span>
                  Haul · {chosen.vehicleLabel} · {formatMiles(chosen.miles)} ·{" "}
                  {chosen.hours}h
                </span>
                <span>{formatPrice(haulFee)}</span>
              </li>
              <li className="flex justify-between text-ink-soft">
                <span>Haulsy fee (8%)</span>
                <span>{formatPrice(serviceFee)}</span>
              </li>
              <li className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <span>Due after they accept</span>
                <span>{formatPrice(total)}</span>
              </li>
            </ul>
          </div>
          <Field label="Notes for the job">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Stairs, parking, keys…"
            />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {NOTE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() =>
                  setNotes((n) => (n.includes(chip) ? n : n ? `${n} ${chip}.` : `${chip}.`))
                }
                className="rounded-full border border-line bg-cream px-2.5 py-1 text-[11px]"
              >
                {chip}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink-soft">
            The mover can accept or decline. You only pay if they accept.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" onClick={requestMover}>
              Send request
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-10 rounded-[28px] border border-line bg-cream px-6 py-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sage text-forest">
            <Check size={22} />
          </div>
          <h2 className="font-display mt-4 text-3xl">Request sent</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">
            {chosen
              ? `${users.find((u) => u.id === chosen.mover.userId)?.name} has this in their inbox.`
              : "Mover notified."}{" "}
            Pay after they accept. Chat is open now for stairs, parking and keys.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Badge>Awaiting accept</Badge>
            <Badge tone="line">{formatPrice(total)} quoted</Badge>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={bookingId ? `/bookings/${bookingId}` : "/bookings"}>
              Open job chat
            </Button>
            <Button href="/marketplace" variant="outline">
              Keep browsing
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CheckoutInner />
    </Suspense>
  );
}
