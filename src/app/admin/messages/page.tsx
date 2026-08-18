"use client";

import { AdminHeader, Panel } from "@/components/admin/AdminUi";
import { Input } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function AdminMessagesPage() {
  const { messages, bookings, users, listings } = useStore();
  const [q, setQ] = useState("");

  const threads = useMemo(() => {
    const query = q.trim().toLowerCase();
    const byJob = new Map<string, typeof messages>();
    for (const msg of messages) {
      const list = byJob.get(msg.bookingId) ?? [];
      list.push(msg);
      byJob.set(msg.bookingId, list);
    }
    return [...byJob.entries()]
      .map(([bookingId, msgs]) => {
        const booking = bookings.find((b) => b.id === bookingId);
        const listing = listings.find((l) => l.id === booking?.listingId);
        const customer = users.find((u) => u.id === booking?.customerId);
        const mover = users.find((u) => u.id === booking?.moverId);
        const sorted = [...msgs].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        return { bookingId, booking, listing, customer, mover, msgs: sorted };
      })
      .filter((t) => {
        if (!query) return true;
        const hay =
          `${t.listing?.title ?? ""} ${t.customer?.name ?? ""} ${t.mover?.name ?? ""} ${t.msgs.map((m) => m.body).join(" ")}`.toLowerCase();
        return hay.includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.msgs.at(-1)?.createdAt ?? 0).getTime() -
          new Date(a.msgs.at(-1)?.createdAt ?? 0).getTime(),
      );
  }, [messages, bookings, users, listings, q]);

  return (
    <div>
      <AdminHeader
        eyebrow="Support"
        title="Messages"
        body="Read-only job threads. Reply from the job page if you need to step in."
      />
      <Panel
        title={`${threads.length} threads`}
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
        {threads.length === 0 ? (
          <p className="text-sm text-ink-soft">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {threads.map((t) => (
              <article
                key={t.bookingId}
                className="rounded-xl border border-line bg-canvas px-3 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {t.listing?.title ??
                        (t.booking?.type === "move"
                          ? "House move"
                          : "Haulsy job")}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {t.customer?.name ?? "Customer"} · {t.mover?.name ?? "Mover"}
                    </p>
                  </div>
                  <Link
                    href={`/bookings/${t.bookingId}`}
                    className="text-sm font-medium text-forest"
                  >
                    Open job
                  </Link>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {t.msgs.map((m) => {
                    const from = users.find((u) => u.id === m.fromUserId);
                    return (
                      <li key={m.id} className="text-sm">
                        <span className="font-medium">
                          {from?.name ?? "Someone"}:
                        </span>{" "}
                        {m.body}
                        <span className="ml-2 text-xs text-ink-soft">
                          {new Date(m.createdAt).toLocaleString("en-CA")}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
