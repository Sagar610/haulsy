"use client";

import { AvailableNow } from "@/components/movers/AvailableNow";
import { MoverCard } from "@/components/movers/MoverCard";
import { Button } from "@/components/ui/Button";
import {
  FilterClear,
  FilterPanel,
  FilterSelect,
} from "@/components/ui/Filters";
import { EmptyState, SectionHeading } from "@/components/ui/Media";
import { CITIES, VEHICLES } from "@/lib/constants";
import { dayName } from "@/lib/format";
import { jobsDone, moverRating } from "@/lib/stats";
import { useStore } from "@/lib/store";
import type { VehicleType } from "@/lib/types";
import { useMemo, useState } from "react";

export default function MoversPage() {
  const { movers, users, reviews, bookings } = useStore();
  const [city, setCity] = useState("all");
  const [vehicle, setVehicle] = useState("all");

  const filtered = useMemo(
    () =>
      movers.filter((m) => {
        if (city !== "all" && !m.cities.includes(city)) return false;
        if (vehicle !== "all" && m.vehicle !== vehicle) return false;
        return true;
      }),
    [movers, city, vehicle],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Movers"
          title="Vans, wagons and cube vans for hire"
          body="Each person sets their hours and rates. Book them on a marketplace item or for a house move."
        />
        <Button href="/movers/join" variant="outline">
          Drive with Haulsy
        </Button>
      </div>

      <div className="mt-6">
        <AvailableNow city={city === "all" ? undefined : city} />
      </div>

      <div className="mt-5">
        <FilterPanel>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <FilterSelect
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="all">All cities</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Vehicle"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            >
              <option value="all">Any</option>
              {(Object.keys(VEHICLES) as VehicleType[]).map((v) => (
                <option key={v} value={v}>
                  {VEHICLES[v].label}
                </option>
              ))}
            </FilterSelect>
            <div className="sm:ml-auto">
              <FilterClear
                visible={city !== "all" || vehicle !== "all"}
                onClick={() => {
                  setCity("all");
                  setVehicle("all");
                }}
              />
            </div>
          </div>
        </FilterPanel>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No movers in that filter"
            body="Try another city, or join as a mover if you have a vehicle going spare."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((m) => {
            const days = [...new Set(m.availability.map((a) => dayName(a.day)))].join(
              ", ",
            );
            return (
              <div key={m.id}>
                <MoverCard
                  mover={m}
                  user={users.find((u) => u.id === m.userId)}
                  rating={moverRating(reviews, m.userId).rating}
                  reviewCount={moverRating(reviews, m.userId).count}
                  jobs={jobsDone(bookings, m.userId)}
                />
                <p className="mt-2 px-1 text-xs text-ink-soft">Usually on {days}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
