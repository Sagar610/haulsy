import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ca");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Haulsy/1.0 (demo marketplace)",
      Accept: "application/json",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Geocode failed" }, { status: 502 });
  }

  const rows = (await res.json()) as { lat: string; lon: string }[];
  const hit = rows[0];
  if (!hit) return NextResponse.json({});
  return NextResponse.json({
    lat: Number(hit.lat),
    lng: Number(hit.lon),
  });
}
