"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { PageLoader } from "@/components/ui/Media";
import { CITIES, VEHICLES } from "@/lib/constants";
import { dayNameLong } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { AvailabilityWindow, DayOfWeek, VehicleType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

const defaultAvailability: AvailabilityWindow[] = [
  { day: 1, start: "08:00", end: "18:00" },
  { day: 2, start: "08:00", end: "18:00" },
  { day: 3, start: "08:00", end: "18:00" },
  { day: 4, start: "08:00", end: "18:00" },
  { day: 5, start: "08:00", end: "18:00" },
  { day: 6, start: "08:00", end: "16:00" },
];

export default function JoinMoverPage() {
  const { currentUser, hydrated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace(`/login?next=${encodeURIComponent("/movers/join")}`);
    }
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) return <PageLoader />;
  return <JoinForm />;
}

function JoinForm() {
  const { currentUser, currentMover, upsertMover } = useStore();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<VehicleType>(
    currentMover?.vehicle ?? "van",
  );
  const [capacityM3, setCapacityM3] = useState(
    String(currentMover?.capacityM3 ?? VEHICLES.van.capacityM3),
  );
  const [maxKg, setMaxKg] = useState(
    String(currentMover?.maxKg ?? VEHICLES.van.maxKg),
  );
  const [hourlyRate, setHourlyRate] = useState(
    String(currentMover?.hourlyRate ?? 35),
  );
  const [jobRate, setJobRate] = useState(String(currentMover?.jobRate ?? 45));
  const [cities, setCities] = useState<string[]>(
    currentMover?.cities ?? [currentUser?.city ?? "Toronto"],
  );
  const [bio, setBio] = useState(currentMover?.bio ?? "");
  const [availability, setAvailability] = useState<AvailabilityWindow[]>(
    currentMover?.availability ?? defaultAvailability,
  );

  function toggleCity(c: string) {
    setCities((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function toggleDay(day: DayOfWeek) {
    setAvailability((prev) => {
      const exists = prev.find((w) => w.day === day);
      if (exists) return prev.filter((w) => w.day !== day);
      return [...prev, { day, start: "08:00", end: "18:00" }];
    });
  }

  function patchDay(
    day: DayOfWeek,
    key: "start" | "end",
    value: string,
  ) {
    setAvailability((prev) =>
      prev.map((w) => (w.day === day ? { ...w, [key]: value } : w)),
    );
  }

  function onVehicle(v: VehicleType) {
    setVehicle(v);
    setCapacityM3(String(VEHICLES[v].capacityM3));
    setMaxKg(String(VEHICLES[v].maxKg));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    upsertMover({
      vehicle,
      capacityM3: Number(capacityM3),
      maxKg: Number(maxKg),
      hourlyRate: Number(hourlyRate),
      jobRate: Number(jobRate),
      cities: cities.length ? cities : [currentUser?.city ?? "Toronto"],
      availability,
      bio: bio.trim() || "Independent mover on Haulsy.",
    });
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
        Drive
      </p>
      <h1 className="font-display mt-2 text-4xl tracking-tight">
        {currentMover ? "Your mover profile" : "Register your vehicle"}
      </h1>
      <p className="mt-2 text-ink-soft">
        Set the size you can take, the hours you work, and what you charge.
        Buyers only see you when you fit the job.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <Field label="Vehicle">
          <Select
            value={vehicle}
            onChange={(e) => onVehicle(e.target.value as VehicleType)}
          >
            {(Object.keys(VEHICLES) as VehicleType[]).map((v) => (
              <option key={v} value={v}>
                {VEHICLES[v].label} — {VEHICLES[v].blurb}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Capacity (m³)" hint="Override if your van is smaller.">
            <Input
              type="number"
              min={0.2}
              step={0.1}
              value={capacityM3}
              onChange={(e) => setCapacityM3(e.target.value)}
            />
          </Field>
          <Field label="Max weight (kg)">
            <Input
              type="number"
              min={20}
              value={maxKg}
              onChange={(e) => setMaxKg(e.target.value)}
            />
          </Field>
          <Field label="Hourly rate (CAD)">
            <Input
              type="number"
              min={10}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </Field>
          <Field label="Minimum job rate (CAD)">
            <Input
              type="number"
              min={10}
              value={jobRate}
              onChange={(e) => setJobRate(e.target.value)}
            />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Cities you cover</p>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => {
              const on = cities.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCity(c)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    on ? "bg-forest text-cream" : "bg-cream text-ink border border-line"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Weekly availability</p>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const window = availability.find((w) => w.day === day);
              return (
                <div
                  key={day}
                  className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-3 sm:flex-row sm:items-center"
                >
                  <label className="flex min-w-36 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(window)}
                      onChange={() => toggleDay(day)}
                      className="accent-forest"
                    />
                    {dayNameLong(day)}
                  </label>
                  {window ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        type="time"
                        value={window.start}
                        onChange={(e) => patchDay(day, "start", e.target.value)}
                      />
                      <span className="text-ink-soft">to</span>
                      <Input
                        type="time"
                        value={window.end}
                        onChange={(e) => patchDay(day, "end", e.target.value)}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-ink-soft">Off</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Field label="Short bio">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Trolley, blankets, stairs, two-person jobs…"
          />
        </Field>

        <Button type="submit" size="lg" className="w-full">
          {currentMover ? "Save profile" : "Go live as a mover"}
        </Button>
      </form>
    </div>
  );
}
