import { LOAD_PRESETS, VEHICLES } from "./constants";
import { overlaps, volumeM3, weekdayFromIso } from "./format";
import { cityPoint, distanceQuote, haversineMiles } from "./geo";
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

export type MatchedMover = {
  mover: MoverProfile;
  haulFee: number;
  serviceFee: number;
  totalHaul: number;
  hours: number;
  miles: number;
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
  slot: TimeSlot;
  presetHours?: number;
}): MatchedMover[] {
  const needed = opts.volume * PACK_FACTOR;
  const pickup = opts.pickup ?? cityPoint(opts.pickupCity);
  const dropoff = opts.dropoff ?? cityPoint(opts.dropCity);
  const miles = haversineMiles(pickup, dropoff);

  return opts.movers
    .filter((m) => m.capacityM3 >= needed && m.maxKg >= opts.weightKg)
    .filter((m) => servesCity(m, opts.pickupCity) && servesCity(m, opts.dropCity))
    .filter((m) => isWithinAvailability(m, opts.slot))
    .filter((m) => isMoverFree(opts.bookings, m.userId, opts.slot))
    .map((m) => {
      const quote = distanceQuote(m, opts.volume, miles, opts.presetHours);
      return {
        mover: m,
        ...quote,
        miles,
        fit: m.capacityM3 / Math.max(needed, 0.01),
        vehicleLabel: VEHICLES[m.vehicle].label,
      };
    })
    .sort(
      (a, b) =>
        a.fit - b.fit || a.haulFee - b.haulFee || a.miles - b.miles,
    );
}

export function presetLoad(preset: LoadPreset) {
  return LOAD_PRESETS[preset];
}
