import { cn } from "@/lib/format";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full border border-line bg-cream text-ink placeholder:text-ink-soft/70 transition-colors hover:border-forest/25 focus:border-forest focus:outline-none";

const roomy = "rounded-xl px-3.5 py-2.5 text-sm";
const compact = "h-9 rounded-lg px-2.5 py-1.5 text-sm";

export const fieldClass = cn(base, roomy);
export const compactFieldClass = cn(base, compact);

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink">
      {children}
    </label>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

type Compact = { compact?: boolean };

export function Input({
  className,
  compact: isCompact,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & Compact) {
  return (
    <input
      className={cn(isCompact ? compactFieldClass : fieldClass, className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClass, "min-h-24 resize-y", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  compact: isCompact,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & Compact) {
  return (
    <select
      className={cn(
        isCompact ? compactFieldClass : fieldClass,
        "appearance-none bg-[length:12px] pr-8",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
