import type { ListingCategory, LoadPreset, VehicleType } from "./types";

export const CITIES = [
  "Toronto",
  "Mississauga",
  "Brampton",
  "Vancouver",
  "Calgary",
  "Ottawa",
] as const;

export const CATEGORIES: { id: ListingCategory; label: string }[] = [
  { id: "sofa", label: "Sofas & seating" },
  { id: "table", label: "Tables & desks" },
  { id: "bed", label: "Beds" },
  { id: "storage", label: "Storage" },
  { id: "appliance", label: "Appliances" },
  { id: "gym", label: "Gym & outdoors" },
  { id: "other", label: "Other" },
];

export const VEHICLES: Record<
  VehicleType,
  { label: string; capacityM3: number; maxKg: number; blurb: string }
> = {
  car: {
    label: "Car",
    capacityM3: 0.4,
    maxKg: 50,
    blurb: "Small boxes, chairs, compact items",
  },
  estate: {
    label: "Wagon / SUV",
    capacityM3: 1.2,
    maxKg: 150,
    blurb: "Bikes, drawers, compact furniture",
  },
  van: {
    label: "Van",
    capacityM3: 6,
    maxKg: 800,
    blurb: "Sofas, fridges, a room’s worth",
  },
  large_van: {
    label: "Large van",
    capacityM3: 10,
    maxKg: 1200,
    blurb: "Corner sofas, multiple large pieces",
  },
  luton: {
    label: "Cube van",
    capacityM3: 16,
    maxKg: 1400,
    blurb: "House moves and oversized loads",
  },
};

export const LOAD_PRESETS: Record<
  LoadPreset,
  { label: string; volumeM3: number; weightKg: number; hours: number; hint: string }
> = {
  few_items: {
    label: "A few items",
    volumeM3: 1.5,
    weightKg: 80,
    hours: 1.5,
    hint: "Sofa, table, or a handful of boxes",
  },
  studio: {
    label: "Studio",
    volumeM3: 8,
    weightKg: 400,
    hours: 3,
    hint: "One room, compact furniture",
  },
  one_bed: {
    label: "1-bed",
    volumeM3: 14,
    weightKg: 700,
    hours: 4.5,
    hint: "Typical one-bedroom condo",
  },
  two_bed: {
    label: "2-bed",
    volumeM3: 22,
    weightKg: 1100,
    hours: 6,
    hint: "Needs a cube van or large van",
  },
  three_bed: {
    label: "3-bed",
    volumeM3: 32,
    weightKg: 1400,
    hours: 8,
    hint: "Full house — cube van recommended",
  },
};

export const TIME_SLOTS = [
  { start: "08:00", end: "10:00", label: "08:00–10:00" },
  { start: "10:00", end: "12:00", label: "10:00–12:00" },
  { start: "12:00", end: "14:00", label: "12:00–14:00" },
  { start: "14:00", end: "16:00", label: "14:00–16:00" },
  { start: "16:00", end: "18:00", label: "16:00–18:00" },
] as const;

export const SERVICE_FEE_RATE = 0.08;

export const STORE_KEY = "haulsy-v9-auth";

export const SIZE_FILTERS = [
  { id: "any", label: "Any size", min: 0, max: Infinity },
  { id: "small", label: "Small", min: 0, max: 0.5 },
  { id: "medium", label: "Medium", min: 0.5, max: 2 },
  { id: "large", label: "Large", min: 2, max: 6 },
  { id: "xl", label: "Extra large", min: 6, max: Infinity },
] as const;

export const DEMO_PASSWORD = "demo123";

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Toronto: { lat: 43.6532, lng: -79.3832 },
  Mississauga: { lat: 43.589, lng: -79.6441 },
  Brampton: { lat: 43.7315, lng: -79.7624 },
  Vancouver: { lat: 49.2827, lng: -123.1207 },
  Calgary: { lat: 51.0447, lng: -114.0719 },
  Ottawa: { lat: 45.4215, lng: -75.6972 },
};

export const VAN_KMH = 35;
export const FREE_KM = 6;
export const PER_KM_CAD = 1.1;

export const NOTE_CHIPS = [
  "Stairs at pickup",
  "Elevator available",
  "Parking booked",
  "Keys with neighbour",
  "Narrow hallway",
  "Item dismantles",
];
