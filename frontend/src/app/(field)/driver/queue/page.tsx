"use client";

import React, { useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/ui/StatusPill";

interface PickupStop {
  id: string;
  order: number;
  status: "EN_ROUTE" | "UP_NEXT" | "SCHEDULED" | "COMPLETED";
  farmName: string;
  volumeL: number;
  distance: string;
  eta: string;
  phone: string;
  address: string;
}

export default function DriverQueuePage() {
  const [stops, setStops] = useState<PickupStop[]>([
    {
      id: "STOP-01",
      order: 1,
      status: "EN_ROUTE",
      farmName: "Baraka Dairy Farm",
      volumeL: 850,
      distance: "4.2 km",
      eta: "09:05 (23 min)",
      phone: "+998901234567",
      address: "Pastdarg'om district, Samarkand",
    },
    {
      id: "STOP-02",
      order: 2,
      status: "UP_NEXT",
      farmName: "Zarafshon Agro Sut",
      volumeL: 600,
      distance: "18.1 km",
      eta: "10:15",
      phone: "+998939876543",
      address: "Jomboy district, Samarkand",
    },
    {
      id: "STOP-03",
      order: 3,
      status: "SCHEDULED",
      farmName: "Navoiy Baraka Fermasi",
      volumeL: 500,
      distance: "32.0 km",
      eta: "11:30",
      phone: "+998915554433",
      address: "Oqdaryo, Samarkand",
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* Top Header & Offline chip per Section 10.5 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Collection Run</h1>
          <p className="text-xs text-slate-500">Route R-1106-A • Samarkand North Cluster</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Offline, last updated 08:42</span>
        </div>
      </div>

      {/* 1. Dark Route Summary Card (Section 10.5) */}
      <div className="rounded-[20px] bg-[#0F172A] border border-slate-800 text-white p-5 shadow-float space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-teal-400 block">
              R-1106-A • Tanker 01 A 734 BC
            </span>
            <span className="text-[11px] text-slate-400">Capacity: 5,000 L • Current: 4.2 °C</span>
          </div>
          <StatusPill status="IN_TRANSIT" label="ON ROUTE" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-black text-sm block">3 Stops</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Pickups</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-white font-black text-sm block">1,950 L</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Planned</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-teal-300 font-black text-sm block">46 km</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Dist</span>
          </div>
        </div>
      </div>

      {/* 2. Softened Leaflet/Route Graphic Placeholder (Section 10.5) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Route Progression</span>
          <span className="font-mono text-teal-700 font-bold">Factory Arrival ETA: 12:45</span>
        </div>
        <div className="h-28 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden p-3">
          {/* Simulated Route Polyline */}
          <div className="flex items-center justify-between w-full max-w-xs relative z-10 font-mono text-xs">
            <div className="flex flex-col items-center">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs">1</span>
              <span className="text-[9px] text-slate-600 mt-1">Baraka</span>
            </div>
            <div className="flex-1 h-0.5 bg-teal-600 mx-2" />
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">2</span>
              <span className="text-[9px] text-slate-500 mt-1">Zarafshon</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-300 mx-2" />
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-slate-400 text-white font-bold flex items-center justify-center text-[10px]">3</span>
              <span className="text-[9px] text-slate-400 mt-1">Navoiy</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-300 mx-2" />
            <div className="flex flex-col items-center">
              <span className="w-7 h-7 rounded-full bg-slate-950 text-white font-bold flex items-center justify-center text-xs">🏭</span>
              <span className="text-[9px] text-slate-900 font-bold mt-1">Plant</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stop Cards per Section 10.5 */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Pickup Stops & Factory Gate
        </h2>

        {stops.map((stop) => (
          <div
            key={stop.id}
            className={`rounded-2xl border p-4 shadow-xs transition space-y-3 ${
              stop.status === "EN_ROUTE"
                ? "bg-white border-emerald-500 ring-2 ring-emerald-500/10"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                    stop.status === "EN_ROUTE"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {stop.order}
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{stop.farmName}</h3>
                  <p className="text-[11px] text-slate-500">{stop.address}</p>
                </div>
              </div>
              <StatusPill status={stop.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Volume</span>
                <span className="font-bold text-slate-900">{stop.volumeL} L</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Distance</span>
                <span className="font-bold text-slate-900">{stop.distance}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">ETA</span>
                <span className="font-bold text-emerald-700">{stop.eta}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Link
                href={`/driver/scan?stopId=${stop.id}`}
                className="flex-1 h-10 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <span>📷</span>
                <span>Scan pickup</span>
              </Link>
              <a
                href={`https://yandex.com/maps/?text=${encodeURIComponent(stop.address)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-50"
              >
                <span>🧭</span>
                <span>Navigate</span>
              </a>
              <a
                href={`tel:${stop.phone}`}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center text-sm hover:bg-slate-50"
              >
                📞
              </a>
            </div>
          </div>
        ))}

        {/* Final Card for Factory Gate (Section 10.5) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏭</span>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Toshkent Dairy JSC Plant #2</h3>
                <p className="text-[11px] text-slate-500">Intake Reception Bay 02 • Gate weighbridge</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
              FINAL STOP
            </span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono pt-1 text-slate-600">
            <span>Scheduled Reception: 12:45 – 13:15</span>
            <Link href="/driver/gate-handover" className="text-teal-700 font-bold hover:underline">
              Handover token &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
