"use client";

import { BookingCard } from "@/components/bookings/BookingCard";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageLoader, SectionHeading } from "@/components/ui/Media";
import { useStore } from "@/lib/store";
import { Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InboxPage() {
  const {
    currentUser,
    currentMover,
    hydrated,
    bookings,
    listings,
    moveRequests,
    users,
    acceptJob,
    declineJob,
    updateBookingStatus,
  } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) router.replace("/login?next=/inbox");
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) return <PageLoader />;

  if (!currentMover) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="This inbox is for movers"
          body="Register a vehicle to receive job requests you can accept or decline."
          action={<Button href="/movers/join">Drive with Haulsy</Button>}
        />
      </div>
    );
  }

  const mine = bookings.filter((b) => b.moverId === currentUser.id);
  const pending = mine.filter((b) => b.status === "pending");
  const active = mine.filter((b) =>
    ["accepted", "assigned", "en_route"].includes(b.status),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Inbox"
        title="Jobs to accept"
        body="Nothing is assigned until you say yes. Buyers pay after you accept."
      />

      {pending.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Inbox is clear"
            body="New requests land here when a buyer picks your vehicle and slot."
            action={
              <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
                <Inbox size={16} /> Waiting
              </span>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {pending.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              listing={listings.find((l) => l.id === b.listingId)}
              move={moveRequests.find((m) => m.id === b.moveRequestId)}
              customer={users.find((u) => u.id === b.customerId)}
              viewer="mover"
              onAccept={() => acceptJob(b.id)}
              onDecline={() => declineJob(b.id)}
            />
          ))}
        </div>
      )}

      {active.length ? (
        <div className="mt-12">
          <h2 className="font-display text-2xl">On your plate</h2>
          <div className="mt-4 space-y-4">
            {active.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                listing={listings.find((l) => l.id === b.listingId)}
                move={moveRequests.find((m) => m.id === b.moveRequestId)}
                customer={users.find((u) => u.id === b.customerId)}
                viewer="mover"
                onStatus={(s) => updateBookingStatus(b.id, s)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
