"use client";

import { AdminHeader, AdminTable, Panel, Td } from "@/components/admin/AdminUi";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { JOB_STATUSES, OPEN_JOB } from "@/lib/admin";
import { formatPrice, formatSlot } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { BookingStatus } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function AdminJobsPage() {
  const { bookings, users, listings, adminForceBookingStatus, adminRefundJob } =
    useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "open" | BookingStatus>("all");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return bookings.filter((b) => {
      const customer = users.find((u) => u.id === b.customerId);
      const mover = users.find((u) => u.id === b.moverId);
      const listing = listings.find((l) => l.id === b.listingId);
      const hay =
        `${customer?.name ?? ""} ${mover?.name ?? ""} ${listing?.title ?? ""} ${b.pickupCity} ${b.deliveryCity} ${b.id}`.toLowerCase();
      if (query && !hay.includes(query)) return false;
      if (status === "open") return OPEN_JOB.includes(b.status);
      if (status !== "all" && b.status !== status) return false;
      return true;
    });
  }, [bookings, users, listings, q, status]);

  return (
    <div>
      <AdminHeader
        eyebrow="Dispatch"
        title="Jobs"
        body="Force a status when something is stuck, or refund a paid haul."
      />
      <Panel
        title={`${rows.length} jobs`}
        action={
          <div className="flex gap-2">
            <Input
              compact
              placeholder="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-44"
            />
            <Select
              compact
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "all" | "open" | BookingStatus)
              }
              className="w-32"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        <AdminTable
          columns={["Job", "People", "When", "Total", "Status", ""]}
        >
          {rows.map((b) => {
            const customer = users.find((u) => u.id === b.customerId);
            const mover = users.find((u) => u.id === b.moverId);
            const listing = listings.find((l) => l.id === b.listingId);
            return (
              <tr key={b.id} className="border-b border-line/70 last:border-0">
                <Td>
                  <p className="font-medium">
                    {listing?.title ??
                      (b.type === "move" ? "House move" : "Haul")}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {b.pickupCity} → {b.deliveryCity}
                  </p>
                  <Link href={`/bookings/${b.id}`} className="text-xs text-forest">
                    Open
                  </Link>
                </Td>
                <Td>
                  <p>{customer?.name ?? "Customer"}</p>
                  <p className="text-xs text-ink-soft">{mover?.name ?? "—"}</p>
                </Td>
                <Td>
                  <p className="whitespace-nowrap">{formatSlot(b.slot)}</p>
                  <p className="text-xs text-ink-soft">
                    {b.paid ? "Paid" : "Unpaid"}
                  </p>
                </Td>
                <Td>
                  <p className="font-semibold">{formatPrice(b.total)}</p>
                </Td>
                <Td>
                  <Select
                    compact
                    className="w-32"
                    value={b.status}
                    onChange={(e) =>
                      adminForceBookingStatus(
                        b.id,
                        e.target.value as BookingStatus,
                      )
                    }
                  >
                    {JOB_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  {b.paid && b.status !== "cancelled" ? (
                    <Button
                      size="sm"
                      variant="danger"
                      className="h-8"
                      onClick={() => adminRefundJob(b.id)}
                    >
                      Refund
                    </Button>
                  ) : b.status !== "cancelled" && b.status !== "declined" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => adminForceBookingStatus(b.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <span className="text-xs text-ink-soft">Closed</span>
                  )}
                </Td>
              </tr>
            );
          })}
        </AdminTable>
      </Panel>
    </div>
  );
}
