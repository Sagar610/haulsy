"use client";

import type { GeoPoint } from "@/lib/types";
import { fetchDriveRoute, formatKm } from "@/lib/geo";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function pin(color: string, letter: string) {
  return L.divIcon({
    className: "haulsy-pin",
    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px)">
      <div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #FFFBF4;box-shadow:0 4px 10px rgba(26,26,26,.28);transform:rotate(-45deg);display:grid;place-items:center">
        <span style="transform:rotate(45deg);color:#FFFBF4;font:700 11px/1 ui-sans-serif,system-ui;letter-spacing:.02em">${letter}</span>
      </div>
    </div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -28],
  });
}

const pickupIcon = pin("#1F4D3A", "A");
const dropIcon = pin("#E8A317", "B");

function Fit({
  pickup,
  dropoff,
  path,
}: {
  pickup: GeoPoint;
  dropoff: GeoPoint;
  path: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    if (path.length > 1) {
      map.fitBounds(L.latLngBounds(path), { padding: [28, 28] });
      return;
    }
    if (
      Math.abs(pickup.lat - dropoff.lat) < 0.0001 &&
      Math.abs(pickup.lng - dropoff.lng) < 0.0001
    ) {
      map.setView([pickup.lat, pickup.lng], 14);
      return;
    }
    map.fitBounds(
      L.latLngBounds(
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng],
      ),
      { padding: [28, 28] },
    );
  }, [map, pickup, dropoff, path]);
  return null;
}

export default function JobMapInner({
  pickup,
  dropoff,
  km,
  onRoute,
}: {
  pickup: GeoPoint;
  dropoff: GeoPoint;
  km: number;
  onRoute?: (info: { km: number }) => void;
}) {
  const [path, setPath] = useState<[number, number][]>([]);
  const [driveKm, setDriveKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const onRouteRef = useRef(onRoute);
  onRouteRef.current = onRoute;

  useEffect(() => {
    let live = true;
    setLoading(true);
    void fetchDriveRoute(
      { lat: pickup.lat, lng: pickup.lng, label: pickup.label },
      { lat: dropoff.lat, lng: dropoff.lng, label: dropoff.label },
    ).then((route) => {
      if (!live) return;
      if (route) {
        setPath(route.path);
        setDriveKm(route.km);
        onRouteRef.current?.({ km: route.km });
      } else {
        setPath([]);
        setDriveKm(null);
      }
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [pickup.lat, pickup.lng, dropoff.lat, dropoff.lng]);

  const center: [number, number] = [
    (pickup.lat + dropoff.lat) / 2,
    (pickup.lng + dropoff.lng) / 2,
  ];
  const shownKm = driveKm ?? km;
  const line =
    path.length > 1
      ? path
      : ([
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ] as [number, number][]);

  return (
    <div className="overflow-hidden rounded-[24px] border border-line">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="z-0 h-80 w-full sm:h-96"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Fit pickup={pickup} dropoff={dropoff} path={path} />
        <Polyline
          positions={line}
          pathOptions={{
            color: "#1F4D3A",
            weight: 5,
            opacity: 0.92,
            lineJoin: "round",
            lineCap: "round",
          }}
        />
        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
          <Popup>
            <strong>Pickup</strong>
            <br />
            {pickup.label}
          </Popup>
        </Marker>
        <Marker position={[dropoff.lat, dropoff.lng]} icon={dropIcon}>
          <Popup>
            <strong>Drop-off</strong>
            <br />
            {dropoff.label}
          </Popup>
        </Marker>
      </MapContainer>
      <p className="bg-cream px-4 py-2 text-xs text-ink-soft">
        {loading
          ? "Drawing the driving route…"
          : path.length > 1
            ? `Driving route ${formatKm(shownKm)} · haul fee uses this distance plus loading time.`
            : `Route ${formatKm(shownKm)} · roads unavailable, showing a direct line.`}
      </p>
    </div>
  );
}
