import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json({ error: "Missing points" }, { status: 400 });
  }
  const [fromLat, fromLng] = from.split(",").map(Number);
  const [toLat, toLng] = to.split(",").map(Number);
  if (![fromLat, fromLng, toLat, toLng].every((n) => Number.isFinite(n))) {
    return NextResponse.json({ error: "Invalid points" }, { status: 400 });
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Haulsy/1.0 (demo marketplace)",
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Route failed" }, { status: 502 });
  }

  const data = (await res.json()) as {
    code?: string;
    routes?: {
      distance: number;
      geometry: { coordinates: [number, number][] };
    }[];
  };
  const route = data.routes?.[0];
  if (!route) return NextResponse.json({});

  return NextResponse.json({
    km: route.distance / 1000,
    path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
  });
}
