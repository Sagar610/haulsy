"use client";

import type { GeoPoint } from "@/lib/types";
import dynamic from "next/dynamic";

const Inner = dynamic(() => import("./JobMapInner"), {
  ssr: false,
  loading: () => (
    <div className="grid h-64 place-items-center rounded-[24px] border border-line bg-sage text-sm text-forest">
      Loading map…
    </div>
  ),
});

export function JobMap(props: {
  pickup: GeoPoint;
  dropoff: GeoPoint;
  km: number;
  onRoute?: (info: { km: number }) => void;
}) {
  return <Inner {...props} />;
}
