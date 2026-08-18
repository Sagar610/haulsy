"use client";

import { Button } from "@/components/ui/Button";
import { NOTE_CHIPS } from "@/lib/constants";
import { initials } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Booking } from "@/lib/types";
import { useMemo, useState } from "react";

export function JobChat({ booking }: { booking: Booking }) {
  const { messages, users, currentUser, sendMessage, listings } = useStore();
  const [body, setBody] = useState("");
  const listing = listings.find((l) => l.id === booking.listingId);
  const thread = useMemo(
    () =>
      messages
        .filter((m) => m.bookingId === booking.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages, booking.id],
  );

  const allowed = new Set(
    [booking.customerId, booking.moverId, listing?.sellerId].filter(
      Boolean,
    ) as string[],
  );
  const canChat = currentUser && allowed.has(currentUser.id);

  function send(text: string) {
    sendMessage(booking.id, text);
    setBody("");
  }

  return (
    <div className="rounded-[24px] border border-line bg-cream">
      <div className="border-b border-line px-4 py-3">
        <p className="text-sm font-semibold">Job notes</p>
        <p className="text-xs text-ink-soft">
          Stairs, parking, keys — buyer, seller and mover can all see this.
        </p>
      </div>
      <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-4">
        {booking.notes ? (
          <p className="rounded-2xl bg-sage px-3 py-2 text-sm text-forest">
            Posted with the request: {booking.notes}
          </p>
        ) : null}
        {thread.length === 0 && !booking.notes ? (
          <p className="text-sm text-ink-soft">No messages yet.</p>
        ) : null}
        {thread.map((m) => {
          const from = users.find((u) => u.id === m.fromUserId);
          const mine = m.fromUserId === currentUser?.id;
          return (
            <div
              key={m.id}
              className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-forest text-[10px] font-semibold text-cream">
                {initials(from?.name ?? "?")}
              </span>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-forest text-cream" : "bg-sage text-ink"
                }`}
              >
                <p className="text-[11px] opacity-70">{from?.name}</p>
                <p className="mt-0.5">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      {canChat &&
      booking.status !== "cancelled" &&
      booking.status !== "declined" ? (
        <form
          className="border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(body);
          }}
        >
          <div className="mb-2 flex flex-wrap gap-1.5">
            {NOTE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => send(chip)}
                className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] hover:border-forest/40"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Message the job…"
              className="h-11 flex-1 rounded-2xl border border-line bg-canvas px-3 text-sm"
            />
            <Button type="submit" size="sm">
              Send
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
