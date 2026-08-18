import { cn } from "@/lib/format";

export function Badge({
  children,
  tone = "sage",
  className,
}: {
  children: React.ReactNode;
  tone?: "sage" | "tape" | "forest" | "cream" | "line";
  className?: string;
}) {
  const tones = {
    sage: "bg-sage text-forest",
    tape: "bg-tape/90 text-ink",
    forest: "bg-forest text-cream",
    cream: "bg-cream text-ink-soft border border-line",
    line: "bg-canvas-2 text-ink-soft",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
