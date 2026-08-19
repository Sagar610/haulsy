"use client";

import { ListingCard } from "@/components/marketplace/ListingCard";
import { Button } from "@/components/ui/Button";
import {
  FilterChip,
  FilterChips,
  FilterClear,
  FilterPanel,
  FilterSearch,
  FilterSelect,
  FilterSwitch,
} from "@/components/ui/Filters";
import { EmptyState, SectionHeading } from "@/components/ui/Media";
import { CATEGORIES, CITIES, SIZE_FILTERS } from "@/lib/constants";
import { volumeM3 } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useMemo, useState } from "react";

export default function MarketplacePage() {
  const { listings } = useStore();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [size, setSize] = useState("any");
  const [includeSold, setIncludeSold] = useState(false);

  const filtered = useMemo(() => {
    const sizeRule = SIZE_FILTERS.find((s) => s.id === size) ?? SIZE_FILTERS[0];
    return listings.filter((l) => {
      if (!includeSold && l.status !== "live") return false;
      if (city !== "all" && l.city !== city) return false;
      if (category !== "all" && l.category !== category) return false;
      const vol = volumeM3(l.lengthCm, l.widthCm, l.heightCm);
      if (vol < sizeRule.min || vol >= sizeRule.max) return false;
      if (q.trim()) {
        const hay = `${l.title} ${l.description} ${l.city}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [listings, q, city, category, size, includeSold]);

  const dirty =
    q.trim() !== "" ||
    city !== "all" ||
    category !== "all" ||
    size !== "any" ||
    includeSold;

  function clearFilters() {
    setQ("");
    setCity("all");
    setCategory("all");
    setSize("any");
    setIncludeSold(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Marketplace"
          title="Bulky finds, with a van attached"
          body="Filter by city and size so you only see what will actually fit."
        />
        <Button href="/marketplace/new">Sell an item</Button>
      </div>

      <div className="mt-6">
        <FilterPanel>
          <FilterSearch
            placeholder="Search sofas, fridges, desks…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search listings"
          />

          <div className="mt-3">
            <FilterChips label="Category">
              <FilterChip
                active={category === "all"}
                onClick={() => setCategory("all")}
              >
                All
              </FilterChip>
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </FilterChip>
              ))}
            </FilterChips>
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:flex-wrap sm:items-center">
            <FilterSelect
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="all">All cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {SIZE_FILTERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id === "any" ? "Any" : s.label}
                </option>
              ))}
            </FilterSelect>
            <div className="sm:ml-auto">
              <FilterSwitch
                checked={includeSold}
                onChange={setIncludeSold}
                label="Show reserved & sold"
              />
            </div>
          </div>
        </FilterPanel>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {filtered.length} listing{filtered.length === 1 ? "" : "s"}
          {includeSold ? "" : " available"}
        </p>
        <FilterClear visible={dirty} onClick={clearFilters} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing in that size"
            body="Try a wider size filter, or another city. Sellers list real dimensions so empty results usually mean a genuine gap."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
