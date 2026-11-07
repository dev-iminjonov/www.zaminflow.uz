"use client";

import React, { useEffect, useRef, useState } from "react";

interface MapPinPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export default function MapPinPicker({
  lat = 41.2995,
  lng = 69.2401,
  onChange,
  disabled = false,
}: MapPinPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [currentLat, setCurrentLat] = useState<number>(lat || 41.2995);
  const [currentLng, setCurrentLng] = useState<number>(lng || 69.2401);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isInsideUzbekistan = (latitude: number, longitude: number) => {
    return latitude >= 36.5 && latitude <= 46.0 && longitude >= 55.0 && longitude <= 74.0;
  };

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;

      // Fix default marker icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current && mapContainerRef.current && isMounted) {
        const initialLat = currentLat;
        const initialLng = currentLng;

        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 11);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], {
          draggable: !disabled,
        }).addTo(map);
        markerRef.current = marker;

        marker.on("dragend", () => {
          const position = marker.getLatLng();
          if (isInsideUzbekistan(position.lat, position.lng)) {
            setCurrentLat(position.lat);
            setCurrentLng(position.lng);
            setErrorMsg(null);
            onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
          } else {
            setErrorMsg("Selected pin is outside Uzbekistan territory bounds (36.5° - 46.0° N, 55.0° - 74.0° E)");
          }
        });

        map.on("click", (e: any) => {
          if (disabled) return;
          const { lat: clickedLat, lng: clickedLng } = e.latlng;
          if (isInsideUzbekistan(clickedLat, clickedLng)) {
            marker.setLatLng([clickedLat, clickedLng]);
            setCurrentLat(clickedLat);
            setCurrentLng(clickedLng);
            setErrorMsg(null);
            onChange(Number(clickedLat.toFixed(6)), Number(clickedLng.toFixed(6)));
          } else {
            setErrorMsg("Selected pin is outside Uzbekistan territory bounds.");
          }
        });
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [disabled]);

  const handleUseCurrentLocation = () => {
    if (disabled || typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (isInsideUzbekistan(latitude, longitude)) {
          setCurrentLat(latitude);
          setCurrentLng(longitude);
          setErrorMsg(null);
          onChange(Number(latitude.toFixed(6)), Number(longitude.toFixed(6)));
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 14);
            markerRef.current.setLatLng([latitude, longitude]);
          }
        } else {
          setErrorMsg("Your browser location is outside Uzbekistan bounds.");
        }
      },
      (err) => {
        setErrorMsg(`Failed to retrieve GPS location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-xs text-slate-500">
          Selected coordinates:{" "}
          <span className="font-mono font-bold text-slate-800">
            {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
          </span>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition active:scale-95"
          >
            <span>📍</span> Use my current location
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          ⚠️ {errorMsg}
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="w-full h-64 sm:h-72 rounded-2xl border border-slate-200 overflow-hidden shadow-inner z-0"
      />
      <div className="text-[11px] text-slate-400">
        Click or drag the pin directly on the map to mark your dairy facility gate.
      </div>
    </div>
  );
}
