"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LOAD_PRESETS } from "@/lib/constants";
import { formatPrice, formatSlot } from "@/lib/format";
import { formatMiles } from "@/lib/geo";
import type { Booking, BookingStatus, Listing, MoveRequest, User } from "@/lib/types";

const statusCopy: Record<
  BookingStatus,
  { label: string; tone: "sage" | "tape" | "forest" | "line" }
> = {
  pending: { label: "Awaiting mover", tone: "tape" },
  accepted: { label: "Accepted — pay now", tone: "sage" },
  assigned: { label: "Booked", tone: "sage" },
  en_route: { label: "On the way", tone: "tape" },
  delivered: { label: "Delivered", tone: "forest" },
  declined: { label: "Declined", tone: "line" },
  cancelled: { label: "Cancelled", tone: "line" },
};

export function BookingCard({
  booking,
  listing,
  move,
  customer,
  mover,
  viewer,
  onStatus,
  onAccept,
  onDecline,
}: {
  booking: Booking;
  listing?: Listing;
  move?: MoveRequest;
  customer?: User;
  mover?: User;
  viewer: "customer" | "mover";
  onStatus?: (status: BookingStatus) => void;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const title =
    listing?.title ??
    (move ? `${LOAD_PRESETS[move.loadPreset].label} move` : "Haulsy job");
  const meta = statusCopy[booking.status];

  return (
    <article className="rounded-[24px] border border-line bg-cream p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge tone={meta.tone}>{meta.label}</Badge>
          <h3 className="font-display mt-2 text-2xl">{title}</h3>
          <p className="mt-1 text-sm text-ink-soft">{formatSlot(booking.slot)}</p>
        </div>
        <p className="text-lg font-semibold text-forest">
          {formatPrice(booking.total)}
          {!booking.paid && booking.status !== "declined" ? (
            <span className="block text-right text-xs font-normal text-ink-soft">
              unpaid
            </span>
          ) : null}
        </p>
      </div>
      <dl className="mt-4 grid gap-1 text-sm text-ink-soft">
        <div>
          {booking.pickupAddress} → {booking.deliveryAddress}
        </div>
        <div>{formatMiles(booking.distanceMiles)}</div>
        {viewer === "customer" && mover ? <div>Mover {mover.name}</div> : null}
        {viewer === "mover" && customer ? <div>Customer {customer.name}</div> : null}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button href={`/bookings/${booking.id}`} size="sm" variant="outline">
          Open job
        </Button>
        {viewer === "customer" && booking.status === "accepted" && !booking.paid ? (
          <Button href={`/bookings/${booking.id}/pay`} size="sm">
            Pay now
          </Button>
        ) : null}
        {viewer === "mover" && booking.status === "pending" ? (
          <>
            <Button size="sm" onClick={onAccept}>
              Accept
            </Button>
            <Button size="sm" variant="danger" onClick={onDecline}>
              Decline
            </Button>
          </>
        ) : null}
        {viewer === "mover" && onStatus && booking.paid ? (
          <>
            {booking.status === "assigned" ? (
              <Button size="sm" onClick={() => onStatus("en_route")}>
                Mark on the way
              </Button>
            ) : null}
            {booking.status === "en_route" ? (
              <Button size="sm" onClick={() => onStatus("delivered")}>
                Mark delivered
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}
