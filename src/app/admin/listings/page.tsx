"use client";

import { AdminHeader, AdminTable, Panel, Td } from "@/components/admin/AdminUi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { LISTING_STATUSES } from "@/lib/admin";
import { CITIES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ListingStatus } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const tone: Record<ListingStatus, "sage" | "tape" | "forest" | "line"> = {
  live: "sage",
  reserved: "tape",
  sold: "forest",
  withdrawn: "line",
};

export default function AdminListingsPage() {
  const { listings, users, adminUpdateListing, adminSetListingStatus } =
    useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ListingStatus>("all");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return listings.filter((l) => {
      const seller = users.find((u) => u.id === l.sellerId);
      const hay = `${l.title} ${l.city} ${seller?.name ?? ""}`.toLowerCase();
      if (query && !hay.includes(query)) return false;
      if (status !== "all" && l.status !== status) return false;
      return true;
    });
  }, [listings, users, q, status]);

  return (
    <div>
      <AdminHeader
        eyebrow="Catalogue"
        title="Listings"
        body="Take down, restore, or correct title, price, and city."
      />
      <Panel
        title={`${rows.length} listings`}
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
                setStatus(e.target.value as "all" | ListingStatus)
              }
              className="w-28"
            >
              <option value="all">All</option>
              {LISTING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        <AdminTable columns={["Item", "Seller", "Price", "City", "Status", ""]}>
          {rows.map((l) => {
            const seller = users.find((u) => u.id === l.sellerId);
            return (
              <tr key={l.id} className="border-b border-line/70 last:border-0">
                <Td>
                  <Input
                    key={`${l.id}-title`}
                    compact
                    defaultValue={l.title}
                    onBlur={(e) => {
                      const title = e.target.value.trim();
                      if (title && title !== l.title) {
                        adminUpdateListing(l.id, { title });
                      }
                    }}
                  />
                  <Link
                    href={`/marketplace/${l.id}`}
                    className="mt-1 inline-block text-xs text-forest"
                  >
                    View
                  </Link>
                </Td>
                <Td>
                  <p className="font-medium">{seller?.name ?? "—"}</p>
                  <p className="text-xs text-ink-soft">{seller?.email}</p>
                </Td>
                <Td>
                  <Input
                    key={`${l.id}-price`}
                    compact
                    type="number"
                    min={0}
                    className="w-24"
                    defaultValue={l.price}
                    onBlur={(e) => {
                      const price = Number(e.target.value);
                      if (Number.isFinite(price) && price !== l.price) {
                        adminUpdateListing(l.id, { price });
                      }
                    }}
                  />
                </Td>
                <Td>
                  <Select
                    compact
                    value={l.city}
                    onChange={(e) =>
                      adminUpdateListing(l.id, { city: e.target.value })
                    }
                    className="w-32"
                  >
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Badge tone={tone[l.status]}>{l.status}</Badge>
                </Td>
                <Td>
                  {l.status === "live" ? (
                    <Button
                      size="sm"
                      variant="danger"
                      className="h-8"
                      onClick={() => adminSetListingStatus(l.id, "withdrawn")}
                    >
                      Take down
                    </Button>
                  ) : l.status === "withdrawn" || l.status === "reserved" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => adminSetListingStatus(l.id, "live")}
                    >
                      Make live
                    </Button>
                  ) : (
                    <span className="text-xs text-ink-soft">{formatPrice(l.price)}</span>
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
