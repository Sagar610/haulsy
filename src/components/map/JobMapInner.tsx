"use client";

import type { GeoPoint } from "@/lib/types";
import { formatMiles } from "@/lib/geo";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const pickupIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:999px;background:#1F4D3A;border:2px solid #FFFBF4"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const dropIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:999px;background:#E8A317;border:2px solid #FFFBF4"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function Fit({ pickup, dropoff }: { pickup: GeoPoint; dropoff: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(
      [pickup.lat, pickup.lng],
      [dropoff.lat, dropoff.lng],
    );
    map.fitBounds(bounds.pad(0.35));
  }, [map, pickup, dropoff]);
  return null;
}

export default function JobMapInner({
  pickup,
  dropoff,
  miles,
}: {
  pickup: GeoPoint;
  dropoff: GeoPoint;
  miles: number;
}) {
  const center: [number, number] = [
    (pickup.lat + dropoff.lat) / 2,
    (pickup.lng + dropoff.lng) / 2,
  ];

  return (
    <div className="overflow-hidden rounded-[24px] border border-line">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="z-0 h-64 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Fit pickup={pickup} dropoff={dropoff} />
        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
          <Popup>Pickup: {pickup.label}</Popup>
        </Marker>
        <Marker position={[dropoff.lat, dropoff.lng]} icon={dropIcon}>
          <Popup>Drop: {dropoff.label}</Popup>
        </Marker>
        <Polyline
          positions={[
            [pickup.lat, pickup.lng],
            [dropoff.lat, dropoff.lng],
          ]}
          pathOptions={{ color: "#1F4D3A", weight: 3 }}
        />
      </MapContainer>
      <p className="bg-cream px-4 py-2 text-xs text-ink-soft">
        Straight-line {formatMiles(miles)} · haul fee uses this distance plus
        loading time.
      </p>
    </div>
  );
}
