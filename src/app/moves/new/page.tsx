"use client";

import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { PageLoader } from "@/components/ui/Media";
import { CITIES, LOAD_PRESETS, TIME_SLOTS } from "@/lib/constants";
import { nextDates, todayIso } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { LoadPreset } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function MoveForm() {
  const { currentUser, hydrated, createMoveRequest } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const presetParam = (params.get("preset") as LoadPreset) || "few_items";

  const [form, setForm] = useState({
    fromAddress: "",
    fromCity: currentUser?.city ?? "Toronto",
    toAddress: "",
    toCity: currentUser?.city ?? "Toronto",
    loadPreset: presetParam in LOAD_PRESETS ? presetParam : "few_items",
    notes: "",
    date: todayIso(),
    slot: "10:00",
  });

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace(
        `/login?next=${encodeURIComponent(`/moves/new?preset=${presetParam}`)}`,
      );
    }
  }, [hydrated, currentUser, router, presetParam]);

  if (!hydrated || !currentUser) return <PageLoader />;

  const set =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const slot = TIME_SLOTS.find((s) => s.start === form.slot) ?? TIME_SLOTS[1];
    const req = createMoveRequest({
      fromAddress: form.fromAddress.trim(),
      fromCity: form.fromCity,
      toAddress: form.toAddress.trim(),
      toCity: form.toCity,
      loadPreset: form.loadPreset as LoadPreset,
      notes: form.notes.trim(),
      when: { date: form.date, start: slot.start, end: slot.end },
    });
    router.push(`/checkout?moveId=${req.id}`);
  }

  const load = LOAD_PRESETS[form.loadPreset as LoadPreset];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Moves
      </p>
      <h1 className="font-display mt-1 text-3xl tracking-tight">
        Where are we taking it?
      </h1>
      <p className="mt-2 text-ink-soft">
        Same city or across town. We match a mover who covers both ends.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field
          label="Pickup address"
          hint="Start typing — pick an address from the list."
        >
          <AddressAutocomplete
            required
            value={form.fromAddress}
            cityBias={form.fromCity}
            placeholder="Unit, street, postal code"
            onChange={(fromAddress) => setForm((f) => ({ ...f, fromAddress }))}
            onSelect={(place) =>
              setForm((f) => ({
                ...f,
                fromAddress: place.label,
                fromCity: place.city ?? f.fromCity,
              }))
            }
          />
        </Field>
        <Field label="Pickup city">
          <Select value={form.fromCity} onChange={set("fromCity")}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field
          label="Drop-off address"
          hint="Start typing — pick an address from the list."
        >
          <AddressAutocomplete
            required
            value={form.toAddress}
            cityBias={form.toCity}
            placeholder="Where should it land?"
            onChange={(toAddress) => setForm((f) => ({ ...f, toAddress }))}
            onSelect={(place) =>
              setForm((f) => ({
                ...f,
                toAddress: place.label,
                toCity: place.city ?? f.toCity,
              }))
            }
          />
        </Field>
        <Field label="Drop-off city">
          <Select value={form.toCity} onChange={set("toCity")}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Load size">
          <Select value={form.loadPreset} onChange={set("loadPreset")}>
            {(Object.keys(LOAD_PRESETS) as LoadPreset[]).map((k) => (
              <option key={k} value={k}>
                {LOAD_PRESETS[k].label} — {LOAD_PRESETS[k].hint}
              </option>
            ))}
          </Select>
        </Field>
        <p className="rounded-xl bg-sage px-3 py-2 text-sm text-forest">
          About {load.volumeM3} m³ and {load.weightKg} kg. Plan on roughly{" "}
          {load.hours} hours.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date">
            <Select value={form.date} onChange={set("date")}>
              {nextDates(14).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Time">
            <Select value={form.slot} onChange={set("slot")}>
              {TIME_SLOTS.map((s) => (
                <option key={s.start} value={s.start}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Notes for the mover">
          <Textarea
            value={form.notes}
            onChange={set("notes")}
            placeholder="Stairs, parking, fragile pieces, extra pair of hands…"
          />
        </Field>
        <Button type="submit" size="lg" className="w-full">
          See available movers
        </Button>
      </form>
    </div>
  );
}

export default function NewMovePage() {
  return (
    <Suspense>
      <MoveForm />
    </Suspense>
  );
}
