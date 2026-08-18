"use client";

import { BookingCard } from "@/components/bookings/BookingCard";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageLoader, SectionHeading } from "@/components/ui/Media";
import { VEHICLES } from "@/lib/constants";
import { dayName, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = "jobs" | "listings" | "moves";

export default function DashboardPage() {
  const {
    currentUser,
    currentMover,
    hydrated,
    bookings,
    listings,
    moveRequests,
    users,
    updateBookingStatus,
    acceptJob,
    declineJob,
    resetDemo,
    logout,
    cancelJob,
  } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("jobs");

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.replace("/login?next=/dashboard");
    }
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) return <PageLoader />;

  const myListings = listings.filter((l) => l.sellerId === currentUser.id);
  const asCustomer = bookings.filter((b) => b.customerId === currentUser.id);
  const asMover = bookings.filter((b) => b.moverId === currentUser.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Account"
          title={`Hello, ${currentUser.name.split(" ")[0]}`}
          body={`${currentUser.city} · ${currentUser.roles.join(" · ")}`}
        />
        <div className="flex flex-wrap gap-2">
          <Button href="/marketplace/new" variant="outline" size="sm">
            Sell an item
          </Button>
          <Button href="/movers/join" variant="outline" size="sm">
            {currentMover ? "Edit mover profile" : "Become a mover"}
          </Button>
          {currentMover ? (
            <Button href="/inbox" variant="outline" size="sm">
              Job inbox
            </Button>
          ) : null}
          <Button href="/account" variant="outline" size="sm">
            Account
          </Button>
          {currentUser.roles.includes("admin") ? (
            <Button href="/admin" size="sm">
              Admin console
            </Button>
          ) : null}
        </div>
      </div>

      {currentMover ? (
        <div className="mt-8 rounded-[24px] border border-line bg-cream p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest">
            Your vehicle
          </p>
          <p className="font-display mt-1 text-2xl">
            {VEHICLES[currentMover.vehicle].label} · {currentMover.capacityM3} m³
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {formatPrice(currentMover.hourlyRate)}/hr · from{" "}
            {formatPrice(currentMover.jobRate)} per job · {currentMover.cities.join(", ")}
          </p>
          <p className="mt-2 text-xs text-ink-soft">
            Hours:{" "}
            {currentMover.availability
              .map((w) => `${dayName(w.day)} ${w.start}–${w.end}`)
              .join(" · ")}
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex gap-2 overflow-x-auto">
        {(
          [
            ["jobs", currentMover ? "Jobs to haul" : "Your bookings"],
            ["listings", "Your listings"],
            ["moves", "Move requests"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
              tab === id ? "bg-forest text-cream" : "bg-cream text-ink border border-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "jobs" ? (
          <div className="space-y-8">
            {currentMover ? (
              asMover.length ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-forest">Jobs to haul</h3>
                  {asMover.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      listing={listings.find((l) => l.id === b.listingId)}
                      move={moveRequests.find((m) => m.id === b.moveRequestId)}
                      customer={users.find((u) => u.id === b.customerId)}
                      viewer="mover"
                      onStatus={(s) => updateBookingStatus(b.id, s)}
                      onAccept={() => acceptJob(b.id)}
                      onDecline={() => declineJob(b.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No haul jobs yet"
                  body="When someone books you from the marketplace or a move, it appears here so you can mark on the way and delivered."
                />
              )
            ) : null}
            {asCustomer.length ? (
              <div className="space-y-4">
                {currentMover ? (
                  <h3 className="text-sm font-semibold text-forest">You booked</h3>
                ) : null}
                {asCustomer.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    listing={listings.find((l) => l.id === b.listingId)}
                    move={moveRequests.find((m) => m.id === b.moveRequestId)}
                    mover={users.find((u) => u.id === b.moverId)}
                    viewer="customer"
                    onCancel={() => cancelJob(b.id)}
                  />
                ))}
              </div>
            ) : !currentMover ? (
              <EmptyState
                title="Nothing booked"
                body="Shop the marketplace or hire a van. Your jobs will sit here."
                action={<Button href="/marketplace">Browse listings</Button>}
              />
            ) : null}
          </div>
        ) : null}

        {tab === "listings" ? (
          myListings.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {myListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="You have not listed anything"
              body="Measure a sofa, add the size, and someone else’s mover can collect it."
              action={<Button href="/marketplace/new">Sell an item</Button>}
            />
          )
        ) : null}

        {tab === "moves" ? (
          moveRequests.filter((m) => m.customerId === currentUser.id).length ? (
            <div className="space-y-3">
              {moveRequests
                .filter((m) => m.customerId === currentUser.id)
                .map((m) => (
                  <div
                    key={m.id}
                    className="rounded-[24px] border border-line bg-cream p-5"
                  >
                    <p className="font-medium">
                      {m.fromCity} → {m.toCity}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {m.fromAddress} to {m.toAddress}
                    </p>
                    <p className="mt-2 text-xs text-ink-soft">
                      {m.when.date} {m.when.start}–{m.when.end}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              title="No move requests"
              body="Post a load size and we will match a vehicle."
              action={<Button href="/moves/new">Book a move</Button>}
            />
          )
        ) : null}
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button variant="ghost" size="sm" onClick={logout}>
          Log out
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetDemo();
            router.push("/");
          }}
        >
          Reset demo data
        </Button>
      </div>
    </div>
  );
}
