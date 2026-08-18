"use client";

import { AdminHeader, AdminTable, Panel, Td } from "@/components/admin/AdminUi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { VEHICLES } from "@/lib/constants";
import { isOnShiftNow } from "@/lib/matching";
import { jobsDone, moverRating } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { useMemo, useState } from "react";

export default function AdminMoversPage() {
  const {
    movers,
    users,
    bookings,
    reviews,
    adminRemoveMover,
    adminUpdateMoverRates,
  } = useStore();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return movers.filter((m) => {
      const user = users.find((u) => u.id === m.userId);
      const hay = `${user?.name ?? ""} ${m.cities.join(" ")} ${m.vehicle}`.toLowerCase();
      return !query || hay.includes(query);
    });
  }, [movers, users, q]);

  return (
    <div>
      <AdminHeader
        eyebrow="Fleet"
        title="Movers"
        body="Edit rates or remove someone from the roster."
      />
      <Panel
        title={`${rows.length} on the roster`}
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
        <AdminTable columns={["Mover", "Vehicle", "$/hr", "Job from", "Cities", ""]}>
          {rows.map((m) => {
            const user = users.find((u) => u.id === m.userId);
            const rating = moverRating(reviews, m.userId);
            return (
              <tr key={m.id} className="border-b border-line/70 last:border-0">
                <Td>
                  <p className="font-medium">{user?.name ?? "Mover"}</p>
                  <p className="text-xs text-ink-soft">
                    {jobsDone(bookings, m.userId)} jobs
                    {rating.count ? ` · ${rating.rating}★` : ""}
                    {isOnShiftNow(m) ? " · on now" : ""}
                  </p>
                </Td>
                <Td>
                  <p>{VEHICLES[m.vehicle].label}</p>
                  <p className="text-xs text-ink-soft">
                    {m.capacityM3} m³ · {m.maxKg} kg
                  </p>
                </Td>
                <Td>
                  <Input
                    key={`${m.id}-hourly`}
                    compact
                    type="number"
                    min={0}
                    className="w-20"
                    defaultValue={m.hourlyRate}
                    onBlur={(e) => {
                      const hourlyRate = Number(e.target.value);
                      if (
                        Number.isFinite(hourlyRate) &&
                        hourlyRate !== m.hourlyRate
                      ) {
                        adminUpdateMoverRates(m.userId, { hourlyRate });
                      }
                    }}
                  />
                </Td>
                <Td>
                  <Input
                    key={`${m.id}-job`}
                    compact
                    type="number"
                    min={0}
                    className="w-20"
                    defaultValue={m.jobRate}
                    onBlur={(e) => {
                      const jobRate = Number(e.target.value);
                      if (Number.isFinite(jobRate) && jobRate !== m.jobRate) {
                        adminUpdateMoverRates(m.userId, { jobRate });
                      }
                    }}
                  />
                </Td>
                <Td>
                  <p className="max-w-[180px] text-xs leading-5">
                    {m.cities.join(", ")}
                  </p>
                  {isOnShiftNow(m) ? (
                    <Badge tone="tape" className="mt-1">
                      On now
                    </Badge>
                  ) : null}
                </Td>
                <Td>
                  <Button
                    size="sm"
                    variant="danger"
                    className="h-8"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove ${user?.name ?? "this mover"} from the roster?`,
                        )
                      ) {
                        adminRemoveMover(m.userId);
                      }
                    }}
                  >
                    Remove
                  </Button>
                </Td>
              </tr>
            );
          })}
        </AdminTable>
      </Panel>
    </div>
  );
}
