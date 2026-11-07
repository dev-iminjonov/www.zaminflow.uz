"use client";

import React, { useEffect, useRef } from "react";

export interface MapMarker {
  id: string;
  title: string;
  subtitle?: string;
  lat: number;
  lng: number;
  role?: "FARMER" | "INDUSTRY" | "BATCH";
}

interface LeafletMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  radiusKm?: number;
  markers?: MapMarker[];
}

export default function LeafletMap({
  centerLat = 41.2995,
  centerLng = 69.2401,
  zoom = 9,
  radiusKm,
  markers = [],
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      const L = (await import("leaflet")).default;

      if (!isMounted) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current).setView(
        [centerLat, centerLng],
        zoom
      );
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors (Zero-Cost GIS)",
      }).addTo(map);

      if (radiusKm && radiusKm > 0) {
        L.circle([centerLat, centerLng], {
          radius: radiusKm * 1000,
          color: "#0284c7",
          fillColor: "#38bdf8",
          fillOpacity: 0.15,
        }).addTo(map);
      }

      markers.forEach((m) => {
        const circleMarker = L.circleMarker([m.lat, m.lng], {
          radius: 8,
          color:
            m.role === "FARMER"
              ? "#16a34a"
              : m.role === "BATCH"
              ? "#ea580c"
              : "#2563eb",
          fillOpacity: 0.85,
        }).addTo(map);
        circleMarker.bindPopup(
          `<strong>${m.title}</strong><br/>${m.subtitle || ""}`
        );
      });
    }

    initMap();
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng, zoom, radiusKm, markers]);

  return (
    <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
