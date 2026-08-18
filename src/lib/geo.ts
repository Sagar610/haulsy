import {
  CITY_COORDS,
  FREE_KM,
  PER_KM_CAD,
  SERVICE_FEE_RATE,
  VAN_KMH,
} from "./constants";
import type { GeoPoint, MoverProfile } from "./types";

export function cityPoint(city: string, label?: string): GeoPoint {
  const c = CITY_COORDS[city] ?? CITY_COORDS.Toronto;
  return { lat: c.lat, lng: c.lng, label: label ?? city };
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function driveHours(km: number): number {
  return km / VAN_KMH;
}

export function distanceQuote(
  mover: MoverProfile,
  volume: number,
  km: number,
  presetHours?: number,
): { hours: number; haulFee: number; serviceFee: number; totalHaul: number } {
  const base = presetHours ?? (volume < 2 ? 1.25 : volume < 6 ? 2 : 3);
  const hours = Math.round((base + driveHours(km)) * 4) / 4;
  const mileage = Math.max(0, km - FREE_KM) * PER_KM_CAD;
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

export function formatKm(km: number): string {
  if (km < 0.8) return "under 1 km";
  return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
}

export type PlaceSuggestion = {
  label: string;
  lat: number;
  lng: number;
  city?: string;
};

export async function searchPlaces(
  query: string,
  biasCity?: string,
): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const params = new URLSearchParams({ q });
    if (biasCity) params.set("city", biasCity);
    const res = await fetch(`/api/places?${params}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { places?: PlaceSuggestion[] };
    return data.places ?? [];
  } catch {
    return [];
  }
}

export type DriveRoute = {
  km: number;
  path: [number, number][];
};

export async function fetchDriveRoute(
  from: GeoPoint,
  to: GeoPoint,
): Promise<DriveRoute | null> {
  try {
    const res = await fetch(
      `/api/directions?from=${from.lat},${from.lng}&to=${to.lat},${to.lng}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { km?: number; path?: [number, number][] };
    if (typeof data.km !== "number" || !data.path?.length) return null;
    return { km: data.km, path: data.path };
  } catch {
    return null;
  }
}
