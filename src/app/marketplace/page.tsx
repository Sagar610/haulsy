"use client";

import { ListingCard } from "@/components/marketplace/ListingCard";
import { Button } from "@/components/ui/Button";
import { EmptyState, SectionHeading } from "@/components/ui/Media";
import { Input, Select } from "@/components/ui/Field";
import { CATEGORIES, CITIES, SIZE_FILTERS } from "@/lib/constants";
import { volumeM3 } from "@/lib/format";
import { useStore } from "@/lib/store";
import { SlidersHorizontal } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Marketplace"
          title="Bulky finds, with a van attached"
          body="Filter by city and size so you only see what will actually fit on the way home."
        />
        <Button href="/marketplace/new">Sell an item</Button>
      </div>

      <div className="mt-8 rounded-[24px] border border-line bg-cream p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-soft">
          <SlidersHorizontal size={16} /> Filters
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Search sofas, fridges…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="all">All cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select value={size} onChange={(e) => setSize(e.target.value)}>
            {SIZE_FILTERS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={includeSold}
            onChange={(e) => setIncludeSold(e.target.checked)}
            className="accent-forest"
          />
          Show sold items
        </label>
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        {filtered.length} listing{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing in that size"
            body="Try a wider size filter, or another city. Sellers list real dimensions so empty results usually mean a genuine gap."
            action={
              <Button variant="outline" onClick={() => {
                setQ("");
                setCity("all");
                setCategory("all");
                setSize("any");
              }}>
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
