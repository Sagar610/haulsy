import { LOAD_PRESETS, VEHICLES } from "./constants";
import { overlaps, timeToMinutes, volumeM3, weekdayFromIso } from "./format";
import { cityPoint, distanceQuote, haversineKm } from "./geo";
import type {
  Booking,
  GeoPoint,
  Listing,
  LoadPreset,
  MoverProfile,
  TimeSlot,
} from "./types";

const PACK_FACTOR = 1.12;
const BUSY: Booking["status"][] = [
  "pending",
  "accepted",
  "assigned",
  "en_route",
];

export function listingVolume(listing: Listing): number {
  return volumeM3(listing.lengthCm, listing.widthCm, listing.heightCm);
}

export function isMoverFree(
  bookings: Booking[],
  moverUserId: string,
  slot: TimeSlot,
): boolean {
  return !bookings.some(
    (b) =>
      b.moverId === moverUserId &&
      BUSY.includes(b.status) &&
      b.slot.date === slot.date &&
      overlaps(b.slot.start, b.slot.end, slot.start, slot.end),
  );
}

export function isWithinAvailability(
  mover: MoverProfile,
  slot: TimeSlot,
): boolean {
  const day = weekdayFromIso(slot.date) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  return mover.availability.some(
    (w) =>
      w.day === day && overlaps(slot.start, slot.end, w.start, w.end),
  );
}

export function servesCity(mover: MoverProfile, city: string): boolean {
  return mover.cities.includes(city);
}

export type Clock = { date: string; day: number; time: string };

export function currentClock(at = new Date()): Clock {
  const y = at.getFullYear();
  const mo = String(at.getMonth() + 1).padStart(2, "0");
  const d = String(at.getDate()).padStart(2, "0");
  const time = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
  return { date: `${y}-${mo}-${d}`, day: at.getDay(), time };
}

function plusHour(time: string): string {
  const mins = Math.min(timeToMinutes(time) + 60, 24 * 60 - 1);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function isOnShiftNow(mover: MoverProfile, clock = currentClock()): boolean {
  const now = timeToMinutes(clock.time);
  return mover.availability.some(
    (w) =>
      w.day === clock.day &&
      timeToMinutes(w.start) <= now &&
      now < timeToMinutes(w.end),
  );
}

export function moversAvailableNow(
  movers: MoverProfile[],
  bookings: Booking[],
  opts?: { city?: string; at?: Date },
): { now: number; today: number; total: number } {
  const clock = currentClock(opts?.at);
  const pool = opts?.city
    ? movers.filter((m) => m.cities.includes(opts.city as string))
    : movers;
  const today = pool.filter((m) =>
    m.availability.some((w) => w.day === clock.day),
  ).length;
  const now = pool.filter(
    (m) =>
      isOnShiftNow(m, clock) &&
      isMoverFree(bookings, m.userId, {
        date: clock.date,
        start: clock.time,
        end: plusHour(clock.time),
      }),
  ).length;
  return { now, today, total: pool.length };
}

export function moversForListing(
  listing: Listing,
  movers: MoverProfile[],
  bookings: Booking[],
): { now: number; total: number } {
  const clock = currentClock();
  const needed = listingVolume(listing) * PACK_FACTOR;
  const fit = movers.filter(
    (m) =>
      servesCity(m, listing.city) &&
      m.capacityM3 >= needed &&
      m.maxKg >= listing.weightKg,
  );
  const now = fit.filter(
    (m) =>
      isOnShiftNow(m, clock) &&
      isMoverFree(bookings, m.userId, {
        date: clock.date,
        start: clock.time,
        end: plusHour(clock.time),
      }),
  ).length;
  return { now, total: fit.length };
}

export type MatchedMover = {
  mover: MoverProfile;
  haulFee: number;
  serviceFee: number;
  totalHaul: number;
  hours: number;
  km: number;
  fit: number;
  vehicleLabel: string;
};

export function matchMovers(opts: {
  movers: MoverProfile[];
  bookings: Booking[];
  volume: number;
  weightKg: number;
  pickupCity: string;
  dropCity: string;
  pickup?: GeoPoint;
  dropoff?: GeoPoint;
  km?: number;
  slot: TimeSlot;
  presetHours?: number;
}): MatchedMover[] {
  const needed = opts.volume * PACK_FACTOR;
  const pickup = opts.pickup ?? cityPoint(opts.pickupCity);
  const dropoff = opts.dropoff ?? cityPoint(opts.dropCity);
  const km = opts.km ?? haversineKm(pickup, dropoff);

  return opts.movers
    .filter((m) => m.capacityM3 >= needed && m.maxKg >= opts.weightKg)
    .filter((m) => servesCity(m, opts.pickupCity) && servesCity(m, opts.dropCity))
    .filter((m) => isWithinAvailability(m, opts.slot))
    .filter((m) => isMoverFree(opts.bookings, m.userId, opts.slot))
    .map((m) => {
      const quote = distanceQuote(m, opts.volume, km, opts.presetHours);
      return {
        mover: m,
        ...quote,
        km,
        fit: m.capacityM3 / Math.max(needed, 0.01),
        vehicleLabel: VEHICLES[m.vehicle].label,
      };
    })
    .sort(
      (a, b) =>
        a.fit - b.fit || a.haulFee - b.haulFee || a.km - b.km,
    );
}

export function presetLoad(preset: LoadPreset) {
  return LOAD_PRESETS[preset];
}
