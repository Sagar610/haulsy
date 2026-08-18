"use client";

import { AdminHeader, AdminTable, Panel, Td } from "@/components/admin/AdminUi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function AdminReviewsPage() {
  const { reviews, users, bookings, listings, adminRemoveReview } = useStore();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return reviews.filter((r) => {
      const from = users.find((u) => u.id === r.fromUserId);
      const to = users.find((u) => u.id === r.toUserId);
      const hay = `${from?.name ?? ""} ${to?.name ?? ""} ${r.comment}`.toLowerCase();
      return !query || hay.includes(query);
    });
  }, [reviews, users, q]);

  return (
    <div>
      <AdminHeader
        eyebrow="Trust"
        title="Reviews"
        body="Remove ratings that should not stay on a profile."
      />
      <Panel
        title={`${rows.length} reviews`}
        action={
          <Input
            compact
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-44"
          />
        }
        >
          {rows.length === 0 ? (
            <p className="text-sm text-ink-soft">
              No reviews yet. They appear after a customer rates a delivered
              job.
            </p>
          ) : (
            <AdminTable columns={["From → to", "Rating", "Comment", "Job", ""]}>
              {rows.map((r) => {
                const from = users.find((u) => u.id === r.fromUserId);
                const to = users.find((u) => u.id === r.toUserId);
                const booking = bookings.find((b) => b.id === r.bookingId);
                const listing = listings.find(
                  (l) => l.id === booking?.listingId,
                );
                return (
                  <tr
                    key={r.id}
                    className="border-b border-line/70 last:border-0"
                  >
                    <Td>
                      <p className="font-medium">
                        {from?.name ?? "Someone"} → {to?.name ?? "Someone"}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {new Date(r.createdAt).toLocaleString("en-CA")}
                      </p>
                    </Td>
                    <Td>{r.rating} / 5</Td>
                    <Td>
                      <p className="max-w-sm text-sm">{r.comment || "—"}</p>
                    </Td>
                    <Td>
                      {booking ? (
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="text-sm text-forest"
                        >
                          {listing?.title ?? "Job"}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => adminRemoveReview(r.id)}
                      >
                        Remove
                      </Button>
                    </Td>
                  </tr>
                );
              })}
            </AdminTable>
          )}
        </Panel>
    </div>
  );
}
