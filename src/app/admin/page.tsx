"use client";

import { AdminHeader, AdminTable, Kpi, Panel, Td } from "@/components/admin/AdminUi";
import { Badge } from "@/components/ui/Badge";
import { OPEN_JOB } from "@/lib/admin";
import { formatPrice, formatSlot } from "@/lib/format";
import { moversAvailableNow } from "@/lib/matching";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function AdminOverviewPage() {
  const {
    users,
    listings,
    bookings,
    movers,
    reviews,
    adminLog,
    settings,
  } = useStore();

  const activePeople = users.filter((u) => !u.suspended).length;
  const live = listings.filter((l) => l.status === "live").length;
  const reserved = listings.filter((l) => l.status === "reserved").length;
  const open = bookings.filter((b) => OPEN_JOB.includes(b.status));
  const pending = bookings.filter((b) => b.status === "pending");
  const unpaid = bookings.filter((b) => b.status === "accepted" && !b.paid);
  const paid = bookings.filter((b) => b.paid);
  const gmv = paid.reduce((s, b) => s + b.total, 0);
  const fees = paid.reduce((s, b) => s + b.serviceFee, 0);
  const shift = moversAvailableNow(movers, bookings);

  return (
    <div>
      <AdminHeader
        eyebrow="Today"
        title="Marketplace ops"
        body="People, listings, jobs, movers, and money on this device."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi label="People" value={activePeople} hint={`${users.length} accounts`} />
        <Kpi label="Live listings" value={live} hint={`${reserved} reserved`} />
        <Kpi label="Open jobs" value={open.length} hint={`${pending.length} awaiting mover`} />
        <Kpi label="Paid volume" value={formatPrice(gmv)} hint="Completed card charges" />
        <Kpi
          label="Haulsy fees"
          value={formatPrice(fees)}
          hint={`${Math.round(settings.serviceFeeRate * 100)}% service fee on paid jobs`}
        />
        <Kpi
          label="Movers on shift"
          value={shift.now}
          hint={`${shift.today} scheduled today · ${shift.total} on the roster`}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel
          title="Needs attention"
          action={
            <Link href="/admin/jobs" className="text-sm font-medium text-forest">
              All jobs
            </Link>
          }
        >
          {pending.length + unpaid.length + reserved === 0 ? (
            <p className="text-sm text-ink-soft">Nothing waiting on you.</p>
          ) : (
            <ul className="space-y-3">
              {pending.slice(0, 4).map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-3">
                  <div>
                    <Badge tone="tape">Pending</Badge>
                    <p className="mt-1 text-sm font-medium">
                      {b.pickupCity} → {b.deliveryCity}
                    </p>
                    <p className="text-xs text-ink-soft">{formatSlot(b.slot)}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(b.total)}</p>
                </li>
              ))}
              {unpaid.map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-3">
                  <div>
                    <Badge tone="sage">Unpaid</Badge>
                    <p className="mt-1 text-sm font-medium">
                      Accepted · {b.pickupCity}
                    </p>
                    <p className="text-xs text-ink-soft">{formatSlot(b.slot)}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(b.total)}</p>
                </li>
              ))}
              {reserved ? (
                <li className="text-sm text-ink-soft">
                  {reserved} listing{reserved === 1 ? "" : "s"} reserved while a
                  job is in flight.
                </li>
              ) : null}
            </ul>
          )}
        </Panel>

        <Panel title="Recent admin actions">
          {adminLog.length === 0 ? (
            <p className="text-sm text-ink-soft">No actions logged yet.</p>
          ) : (
            <ul className="space-y-3">
              {adminLog.slice(0, 8).map((e) => {
                const who = users.find((u) => u.id === e.actorId);
                return (
                  <li key={e.id}>
                    <p className="text-sm font-medium">{e.detail}</p>
                    <p className="text-xs text-ink-soft">
                      {e.action.replaceAll("_", " ")} · {who?.name ?? "Admin"} ·{" "}
                      {new Date(e.at).toLocaleString("en-CA")}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Trust snapshot">
          <AdminTable columns={["Metric", "Count"]}>
            <tr className="border-b border-line/70">
              <Td>Reviews on file</Td>
              <Td>{reviews.length}</Td>
            </tr>
            <tr className="border-b border-line/70">
              <Td>Suspended accounts</Td>
              <Td>{users.filter((u) => u.suspended).length}</Td>
            </tr>
            <tr>
              <Td>Delivered jobs</Td>
              <Td>
                {bookings.filter((b) => b.status === "delivered").length}
              </Td>
            </tr>
          </AdminTable>
        </Panel>
      </div>
    </div>
  );
}
