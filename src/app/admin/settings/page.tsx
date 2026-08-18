"use client";

import { AdminHeader, Panel } from "@/components/admin/AdminUi";
import { Button } from "@/components/ui/Button";
import { STORE_KEY } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSettingsPage() {
  const { resetDemo, adminLog, users } = useStore();
  const router = useRouter();
  const [done, setDone] = useState(false);

  return (
    <div>
      <AdminHeader
        eyebrow="Workspace"
        title="Settings"
        body="Demo data lives in this browser. There is no server database yet."
      />

      <div className="grid gap-4 xl:grid-cols-2">
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
