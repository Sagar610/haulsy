import { cn } from "@/lib/format";
import { ChevronDown, Search, X } from "lucide-react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

export function FilterPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-3 shadow-[0_1px_0_rgba(26,26,26,0.03)] sm:p-4">
      {children}
    </div>
  );
}

export function FilterSearch({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="relative block">
      <span className="sr-only">{props["aria-label"] ?? "Search"}</span>
      <Search
        size={18}
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-soft"
        aria-hidden
      />
      <input
        className={cn(
          "h-12 w-full rounded-xl border border-line bg-canvas pl-11 pr-4 text-sm text-ink placeholder:text-ink-soft/70 transition-colors hover:border-forest/25 focus:border-forest focus:outline-none",
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function FilterChips({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="min-w-0">
      <p className="sr-only">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-forest text-cream"
          : "bg-canvas-2 text-ink-soft hover:bg-sage hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function FilterSelect({
  label,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-line bg-canvas py-2 pr-2.5 pl-3 sm:w-auto sm:min-w-[13.5rem] sm:flex-1 sm:max-w-[18rem]">
      <span className="shrink-0 text-[11px] font-semibold tracking-[0.12em] text-ink-soft uppercase">
        {label}
      </span>
      <span className="relative min-w-0 flex-1">
        <select
          className={cn(
            "h-6 w-full min-w-[5.5rem] appearance-none bg-transparent pr-6 text-sm font-medium text-ink focus:outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-ink-soft"
          aria-hidden
        />
      </span>
    </label>
  );
}

export function FilterSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 rounded-xl py-1 text-left text-sm text-ink-soft hover:text-ink"
    >
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-forest" : "bg-sage-2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-cream shadow-sm transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function FilterClear({
  onClick,
  visible,
}: {
  onClick: () => void;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-forest hover:text-forest-deep"
    >
      <X size={14} />
      Clear
    </button>
  );
}
