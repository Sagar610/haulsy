"use client";

import { fieldClass } from "@/components/ui/Field";
import { cn } from "@/lib/format";
import { searchPlaces, type PlaceSuggestion } from "@/lib/geo";
import { MapPin } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  cityBias,
  placeholder,
  required,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: PlaceSuggestion) => void;
  cityBias?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<PlaceSuggestion[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setHits([]);
      setBusy(false);
      return;
    }
    let live = true;
    setBusy(true);
    const t = window.setTimeout(() => {
      void searchPlaces(q, cityBias).then((places) => {
        if (!live) return;
        setHits(places);
        setActive(0);
        setBusy(false);
        setOpen(places.length > 0);
      });
    }, 280);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [value, cityBias]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(place: PlaceSuggestion) {
    onChange(place.label);
    onSelect?.(place);
    setOpen(false);
    setHits([]);
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(fieldClass, className)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (hits.length) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open || !hits.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % hits.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + hits.length) % hits.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            pick(hits[active] ?? hits[0]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && (hits.length > 0 || busy) ? (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-line bg-cream py-1 shadow-[0_12px_40px_rgba(26,26,26,0.12)]"
        >
          {busy && hits.length === 0 ? (
            <li className="px-4 py-3 text-sm text-ink-soft">Searching addresses…</li>
          ) : (
            hits.map((hit, i) => (
              <li key={`${hit.lat}-${hit.lng}-${hit.label}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className={`flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm ${
                    i === active ? "bg-sage text-ink" : "text-ink hover:bg-sage/70"
                  }`}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(hit)}
                >
                  <MapPin size={15} className="mt-0.5 shrink-0 text-forest" />
                  <span>{hit.label}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
