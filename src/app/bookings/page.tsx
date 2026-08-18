"use client";

import { BookingCard } from "@/components/bookings/BookingCard";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageLoader, SectionHeading } from "@/components/ui/Media";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BookingsPage() {
  const {
    currentUser,
    hydrated,
    bookings,
    listings,
    moveRequests,
    users,
  } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.replace("/login?next=/bookings");
    }
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) return <PageLoader />;

  const mine = bookings.filter((b) => b.customerId === currentUser.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Your jobs"
        title="Bookings"
        body="Requests, accepted jobs waiting on payment, and paid hauls."
      />
      {mine.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No bookings yet"
            body="Buy something bulky or hire a van — it will land here."
            action={
              <div className="flex gap-2">
                <Button href="/marketplace">Marketplace</Button>
                <Button href="/moves" variant="outline">
                  Book a move
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {mine.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              listing={listings.find((l) => l.id === b.listingId)}
              move={moveRequests.find((m) => m.id === b.moveRequestId)}
              mover={users.find((u) => u.id === b.moverId)}
              viewer="customer"
            />
          ))}
        </div>
      )}
    </div>
  );
}
