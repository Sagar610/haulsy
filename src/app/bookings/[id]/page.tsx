"use client";

import { JobChat } from "@/components/chat/JobChat";
import { JobMap } from "@/components/map/JobMap";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Media";
import { LOAD_PRESETS } from "@/lib/constants";
import { formatPrice, formatSlot } from "@/lib/format";
import { formatMiles } from "@/lib/geo";
import { useStore } from "@/lib/store";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    bookings,
    listings,
    moveRequests,
    users,
    reviews,
    currentUser,
    hydrated,
    acceptJob,
    declineJob,
    updateBookingStatus,
    addReview,
  } = useStore();

  const booking = bookings.find((b) => b.id === id);

  useEffect(() => {
    if (hydrated && !currentUser) router.replace(`/login?next=/bookings/${id}`);
  }, [hydrated, currentUser, router, id]);

  if (!hydrated || !currentUser) return <PageLoader />;
  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Job not found</h1>
        <Button href="/bookings" className="mt-6">
          Bookings
        </Button>
      </div>
    );
  }

  const listing = listings.find((l) => l.id === booking.listingId);
  const move = moveRequests.find((m) => m.id === booking.moveRequestId);
  const mover = users.find((u) => u.id === booking.moverId);
  const customer = users.find((u) => u.id === booking.customerId);
  const seller = listing
    ? users.find((u) => u.id === listing.sellerId)
    : undefined;
  const title =
    listing?.title ??
    (move ? `${LOAD_PRESETS[move.loadPreset].label} move` : "Job");
  const isMover = currentUser.id === booking.moverId;
  const isCustomer = currentUser.id === booking.customerId;
  const existingReview = reviews.find(
    (r) => r.bookingId === booking.id && r.fromUserId === currentUser.id,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Job
      </p>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl tracking-tight">{title}</h1>
          <p className="mt-1 text-ink-soft">{formatSlot(booking.slot)}</p>
        </div>
        <Badge>
          {booking.status.replace("_", " ")}
          {booking.paid ? " · paid" : ""}
        </Badge>
      </div>

      <JobMap
        pickup={booking.pickup}
        dropoff={booking.dropoff}
        miles={booking.distanceMiles}
      />

      <div className="rounded-[24px] border border-line bg-cream p-5 text-sm">
        <p>
          <strong>Pickup</strong> {booking.pickupAddress}
        </p>
        <p className="mt-2">
          <strong>Drop</strong> {booking.deliveryAddress}
        </p>
        <p className="mt-2 text-ink-soft">
          {formatMiles(booking.distanceMiles)} · haul {formatPrice(booking.haulFee)}{" "}
          + fee {formatPrice(booking.serviceFee)}
          {booking.itemPrice ? ` · item ${formatPrice(booking.itemPrice)}` : ""}
        </p>
        <p className="mt-2 text-ink-soft">
          Buyer {customer?.name}
          {seller ? ` · Seller ${seller.name}` : ""} · Mover {mover?.name}
        </p>
        <p className="mt-3 text-lg font-semibold text-forest">
          {formatPrice(booking.total)}
        </p>
      </div>

      {isMover && booking.status === "pending" ? (
        <div className="flex gap-2">
          <Button onClick={() => acceptJob(booking.id)}>Accept job</Button>
          <Button variant="danger" onClick={() => declineJob(booking.id)}>
            Decline
          </Button>
        </div>
      ) : null}

      {isCustomer && booking.status === "accepted" && !booking.paid ? (
        <Button href={`/bookings/${booking.id}/pay`} size="lg" className="w-full">
          Pay {formatPrice(booking.total)}
        </Button>
      ) : null}

      {isMover && booking.paid && booking.status === "assigned" ? (
        <Button onClick={() => updateBookingStatus(booking.id, "en_route")}>
          Mark on the way
        </Button>
      ) : null}
      {isMover && booking.status === "en_route" ? (
        <Button onClick={() => updateBookingStatus(booking.id, "delivered")}>
          Mark delivered
        </Button>
      ) : null}

      <JobChat booking={booking} />

      {isCustomer && booking.status === "delivered" && !existingReview && mover ? (
        <ReviewForm
          name={mover.name}
          onSubmit={(rating, comment) =>
            addReview({
              bookingId: booking.id,
              toUserId: mover.id,
              rating,
              comment,
            })
          }
        />
      ) : null}

      {existingReview ? (
        <p className="rounded-2xl bg-sage px-4 py-3 text-sm text-forest">
          You rated this job {existingReview.rating}/5.
          {existingReview.comment ? ` “${existingReview.comment}”` : ""}
        </p>
      ) : null}
    </div>
  );
}
