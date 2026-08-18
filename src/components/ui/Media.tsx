"use client";

import { cn } from "@/lib/format";
import { ImageOff } from "lucide-react";
import { useState } from "react";

export function SmartImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 bg-sage text-forest",
          className,
        )}
      >
        <ImageOff size={22} />
        <span className="text-xs font-medium">No photo</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-forest" />
      <p className="font-display text-lg text-forest">Haulsy</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-line bg-cream px-8 py-16 text-center">
      <p className="font-display text-2xl text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-ink-soft">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display mt-2 text-3xl tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {body ? <p className="mt-3 text-ink-soft">{body}</p> : null}
    </div>
  );
}
