import {
  CITY_COORDS,
  FREE_MILES,
  PER_MILE_CAD,
  SERVICE_FEE_RATE,
  VAN_MPH,
} from "./constants";
import type { GeoPoint, MoverProfile } from "./types";

export function cityPoint(city: string, label?: string): GeoPoint {
  const c = CITY_COORDS[city] ?? CITY_COORDS.Toronto;
  return { lat: c.lat, lng: c.lng, label: label ?? city };
}

export function haversineMiles(a: GeoPoint, b: GeoPoint): number {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function driveHours(miles: number): number {
  return miles / VAN_MPH;
}

export function distanceQuote(
  mover: MoverProfile,
  volume: number,
  miles: number,
  presetHours?: number,
): { hours: number; haulFee: number; serviceFee: number; totalHaul: number } {
  const base = presetHours ?? (volume < 2 ? 1.25 : volume < 6 ? 2 : 3);
  const hours = Math.round((base + driveHours(miles)) * 4) / 4;
  const mileage = Math.max(0, miles - FREE_MILES) * PER_MILE_CAD;
  const haulFee = Math.max(
    mover.jobRate,
    Math.round(mover.hourlyRate * hours + mileage),
  );
  const serviceFee = Math.round(haulFee * SERVICE_FEE_RATE);
  return { hours, haulFee, serviceFee, totalHaul: haulFee + serviceFee };
}

export async function geocode(
  query: string,
  fallbackCity: string,
): Promise<GeoPoint> {
  const fallback = cityPoint(fallbackCity, query || fallbackCity);
  if (!query.trim()) return fallback;
  try {
    const res = await fetch(
      `/api/geocode?q=${encodeURIComponent(`${query}, ${fallbackCity}, Canada`)}`,
    );
    if (!res.ok) return fallback;
    const data = (await res.json()) as { lat?: number; lng?: number };
    if (typeof data.lat === "number" && typeof data.lng === "number") {
      return { lat: data.lat, lng: data.lng, label: query };
    }
  } catch {
    /* city centre is fine */
  }
  return fallback;
}

export function formatMiles(miles: number): string {
  if (miles < 0.5) return "under ½ mile";
  return `${miles.toFixed(miles >= 10 ? 0 : 1)} miles`;
}
