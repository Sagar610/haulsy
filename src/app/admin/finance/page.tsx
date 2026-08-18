"use client";

import { AdminHeader, AdminTable, Kpi, Panel, Td } from "@/components/admin/AdminUi";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AdminFinancePage() {
  const { bookings } = useStore();
  const paid = bookings.filter((b) => b.paid);
  const outstanding = bookings.filter(
    (b) => !b.paid && (b.status === "accepted" || b.status === "pending"),
  );
  const gmv = paid.reduce((s, b) => s + b.total, 0);
  const items = paid.reduce((s, b) => s + b.itemPrice, 0);
  const haul = paid.reduce((s, b) => s + b.haulFee, 0);
  const fees = paid.reduce((s, b) => s + b.serviceFee, 0);
  const due = outstanding.reduce((s, b) => s + b.total, 0);
  const marketplace = paid.filter((b) => b.type === "marketplace");
  const moves = paid.filter((b) => b.type === "move");

  const byCity = new Map<string, number>();
  for (const b of paid) {
    byCity.set(b.pickupCity, (byCity.get(b.pickupCity) ?? 0) + b.total);
  }

  return (
    <div>
      <AdminHeader
        eyebrow="Ledger"
        title="Finance"
        body="Paid volume in CAD, plus outstanding pending or accepted jobs."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Paid volume" value={formatPrice(gmv)} hint={`${paid.length} charges`} />
        <Kpi label="Item sales" value={formatPrice(items)} />
        <Kpi label="Haul fees" value={formatPrice(haul)} />
        <Kpi
          label="Haulsy take"
          value={formatPrice(fees)}
          hint="Service fee on paid jobs"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Outstanding">
          <p className="font-display text-3xl text-forest">{formatPrice(due)}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {outstanding.length} unpaid job
            {outstanding.length === 1 ? "" : "s"} in pending or accepted.
          </p>
          <AdminTable columns={["Job", "Status", "Amount"]}>
            {outstanding.map((b) => (
              <tr key={b.id} className="border-b border-line/70 last:border-0">
                <Td>
                  {b.pickupCity} → {b.deliveryCity}
                </Td>
                <Td>{b.status}</Td>
                <Td>{formatPrice(b.total)}</Td>
              </tr>
            ))}
          </AdminTable>
        </Panel>

        <Panel title="Paid mix">
          <AdminTable columns={["Type", "Jobs", "Volume"]}>
            <tr className="border-b border-line/70">
              <Td>Marketplace hauls</Td>
              <Td>{marketplace.length}</Td>
              <Td>
                {formatPrice(marketplace.reduce((s, b) => s + b.total, 0))}
              </Td>
            </tr>
            <tr>
              <Td>House moves</Td>
              <Td>{moves.length}</Td>
              <Td>{formatPrice(moves.reduce((s, b) => s + b.total, 0))}</Td>
            </tr>
          </AdminTable>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            By pickup city
          </p>
          <AdminTable columns={["City", "Paid volume"]}>
            {[...byCity.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([city, amount]) => (
                <tr
                  key={city}
                  className="border-b border-line/70 last:border-0"
                >
                  <Td>{city}</Td>
                  <Td>{formatPrice(amount)}</Td>
                </tr>
              ))}
          </AdminTable>
        </Panel>
      </div>
    </div>
  );
}
