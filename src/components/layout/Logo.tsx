import Link from "next/link";
import { cn } from "@/lib/format";

export function Logo({
  className,
  markClassName,
  light = false,
}: {
  className?: string;
  markClassName?: string;
  light?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl",
          light ? "bg-cream text-forest" : "bg-forest text-tape",
          markClassName,
        )}
        aria-hidden
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect
            x="3"
            y="7"
            width="14"
            height="9"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M6 7V5.5A2.5 2.5 0 0 1 8.5 3h3A2.5 2.5 0 0 1 14 5.5V7"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M7.5 11.5h5"
            stroke={light ? "#1F4D3A" : "#F7F3EC"}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-[1.35rem] leading-none tracking-tight",
          light ? "text-cream" : "text-ink",
        )}
      >
        Haulsy
      </span>
    </Link>
  );
}
