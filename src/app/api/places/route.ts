import { NextRequest, NextResponse } from "next/server";
import { CITIES, CITY_COORDS } from "@/lib/constants";

const UA = { "User-Agent": "Haulsy/1.0 (demo marketplace)", Accept: "application/json" };

type Place = { label: string; lat: number; lng: number; city?: string };

function matchCity(...names: Array<string | undefined>): string | undefined {
  const aliases: Record<string, string> = {
    "north york": "Toronto",
    scarborough: "Toronto",
    etobicoke: "Toronto",
    "east york": "Toronto",
    york: "Toronto",
    "old toronto": "Toronto",
    vaughan: "Toronto",
    markham: "Toronto",
    oakville: "Mississauga",
    brampton: "Brampton",
    mississauga: "Mississauga",
    burnaby: "Vancouver",
    richmond: "Vancouver",
    surrey: "Vancouver",
    "north vancouver": "Vancouver",
    kanata: "Ottawa",
    nepean: "Ottawa",
    orleans: "Ottawa",
  };
  for (const raw of names) {
    if (!raw) continue;
    const n = raw.toLowerCase().trim();
    const exact = CITIES.find((c) => c.toLowerCase() === n);
    if (exact) return exact;
    if (aliases[n]) return aliases[n];
    const contains = CITIES.find((c) => n.includes(c.toLowerCase()));
    if (contains) return contains;
  }
  return undefined;
}

type PhotonHit = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    district?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countrycode?: string;
  };
};

function photonLabel(p: PhotonHit["properties"]): string {
  const line = [p.housenumber, p.street || p.name].filter(Boolean).join(" ");
  const parts = [line, p.city || p.district, p.state, p.postcode].filter(
    (x, i, arr) => Boolean(x) && arr.indexOf(x) === i,
  );
  return parts.join(", ");
}

async function fromPhoton(q: string, bias?: { lat: number; lng: number }): Promise<Place[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", "en");
  if (bias) {
    url.searchParams.set("lat", String(bias.lat));
    url.searchParams.set("lon", String(bias.lng));
  }
  const res = await fetch(url, { headers: UA, cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: PhotonHit[] };
  return (data.features ?? [])
    .filter((f) => {
      const code = (f.properties.countrycode ?? "").toUpperCase();
      const country = (f.properties.country ?? "").toLowerCase();
      return code === "CA" || country === "canada" || !code;
    })
    .map((f) => ({
      label: photonLabel(f.properties),
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      city: matchCity(f.properties.city, f.properties.district, f.properties.name),
    }))
    .filter((p) => p.label.length > 2)
    .slice(0, 6);
}

type NominatimHit = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  };
};

async function fromNominatim(q: string): Promise<Place[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "ca");
  url.searchParams.set("dedupe", "1");
  const res = await fetch(url, { headers: UA, cache: "no-store" });
  if (!res.ok) return [];
  const rows = (await res.json()) as NominatimHit[];
  return rows.map((r) => {
    const a = r.address ?? {};
    const line = [a.house_number, a.road].filter(Boolean).join(" ");
    const cityName = a.city || a.town || a.village || a.suburb;
    const label =
      [line || r.display_name.split(",")[0], cityName, a.state, a.postcode]
        .filter(Boolean)
        .join(", ") || r.display_name;
    return {
      label,
      lat: Number(r.lat),
      lng: Number(r.lon),
      city: matchCity(cityName, a.suburb, a.state),
    };
  });
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ places: [] });
  }
  const city = req.nextUrl.searchParams.get("city") ?? "";
  const bias = CITY_COORDS[city];

  try {
    let places = await fromPhoton(q, bias);
    if (!places.length) places = await fromNominatim(`${q}, Canada`);
    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ places: [] }, { status: 502 });
  }
}
