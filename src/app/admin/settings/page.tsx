"use client";

import { AdminHeader, Panel } from "@/components/admin/AdminUi";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { STORE_KEY } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSettingsPage() {
  const { resetDemo, adminLog, users, settings, adminSetSettings } = useStore();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [percent, setPercent] = useState(
    String(Math.round(settings.serviceFeeRate * 1000) / 10),
  );
  const [saved, setSaved] = useState("");

  return (
    <div>
      <AdminHeader
        eyebrow="Workspace"
        title="Settings"
        body="Margin, demo reset, and how this console works."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Haulsy margin">
          <p className="text-sm text-ink-soft">
            Percent added on top of the haul fee (not the item price). New
            quotes use this rate right away. Jobs already booked keep their old
            fee.
          </p>
          <form
            className="mt-3 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(percent);
              if (!Number.isFinite(n) || n < 0 || n > 50) {
                setSaved("Use a number from 0 to 50.");
                return;
              }
              adminSetSettings({ serviceFeeRate: n / 100 });
              setSaved(`Saved at ${n}%.`);
            }}
          >
            <Field label="Margin %">
              <Input
                compact
                type="number"
                min={0}
                max={50}
                step={0.5}
                className="w-28"
                value={percent}
                onChange={(e) => {
                  setPercent(e.target.value);
                  setSaved("");
                }}
              />
            </Field>
            <Button type="submit" size="sm" className="mb-0.5">
              Save
            </Button>
          </form>
          {saved ? <p className="mt-2 text-sm text-forest">{saved}</p> : null}
          <p className="mt-2 text-xs text-ink-soft">
            Example: $100 haul × {percent || "8"}% = Haulsy take.
          </p>
        </Panel>

        <Panel title="Demo data">
          <p className="text-sm text-ink-soft">
            Storage key <code className="rounded bg-sage px-1.5 py-0.5">{STORE_KEY}</code>
            . Resetting reloads the Canada seed, including the admin login.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="danger"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset this browser’s Haulsy demo? Listings, jobs, and messages go back to seed.",
                  )
                ) {
                  resetDemo();
                  setDone(true);
                  router.replace("/admin");
                }
              }}
            >
              Reset demo
            </Button>
            {done ? (
              <p className="self-center text-sm text-forest">Reloaded seed.</p>
            ) : null}
          </div>
        </Panel>

        <Panel title="How this console works">
          <ul className="list-disc space-y-2 pl-5 text-sm text-ink-soft">
            <li>Only accounts with the admin role can open /admin.</li>
            <li>Public signup cannot create an admin.</li>
            <li>Suspended people cannot log in.</li>
            <li>Refunds mark the job unpaid and cancelled.</li>
            <li>Removing a mover declines unpaid pending jobs.</li>
          </ul>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Action log">
          <ul className="space-y-3">
            {adminLog.map((e) => {
              const who = users.find((u) => u.id === e.actorId);
              return (
                <li key={e.id} className="border-b border-line/70 py-2 last:border-0">
                  <p className="text-sm font-medium">{e.detail}</p>
                  <p className="text-xs text-ink-soft">
                    {e.action.replaceAll("_", " ")} · {who?.name ?? "Admin"} ·{" "}
                    {new Date(e.at).toLocaleString("en-CA")}
                  </p>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
