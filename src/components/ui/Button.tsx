"use client";

import { cn } from "@/lib/format";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "tape" | "outline" | "ghost" | "cream" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest text-cream hover:bg-forest-deep shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]",
  tape: "bg-tape text-ink hover:bg-tape-deep",
  outline: "border border-line bg-cream text-ink hover:border-forest/30 hover:bg-sage",
  ghost: "text-ink-soft hover:bg-sage hover:text-ink",
  cream: "bg-cream text-forest border border-line hover:bg-white",
  danger: "bg-danger/10 text-danger hover:bg-danger/15",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-4 text-[15px] rounded-2xl",
  lg: "h-12 px-5 text-base rounded-2xl",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: Props) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
