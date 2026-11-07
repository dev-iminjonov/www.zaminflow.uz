"use client";

import React from "react";

interface QrDispatchCardProps {
  batchId?: string;
  volumeLiters?: number;
  temperatureC?: number;
  geofenceMeters?: number;
  validUntil?: string;
  destination?: string;
  className?: string;
}

export default function QrDispatchCard({
  batchId = "PICKUP / 261106 / 014",
  volumeLiters = 850,
  temperatureC = 3.2,
  geofenceMeters = 500,
  validUntil = "11:30 AM (Valid 45 min)",
  destination = "Toshkent Dairy Processing Plant #2",
  className = "",
}: QrDispatchCardProps) {
  return (
    <div className={`rounded-2xl bg-[#0F172A] border border-slate-800 text-white p-5 shadow-float space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
            01 / FIELD DISPATCH TOKEN
          </span>
          <h3 className="font-mono text-sm font-bold text-white tracking-tight">{batchId}</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
          READY FOR PICKUP
        </span>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center py-2">
        <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-200">
          {/* Simulated 2D Matrix QR with high contrast */}
          <div className="w-44 h-44 bg-white flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className="w-12 h-12 border-4 border-slate-950 flex items-center justify-center">
                <div className="w-6 h-6 bg-slate-950" />
              </div>
              <div className="w-12 h-12 border-4 border-slate-950 flex items-center justify-center">
                <div className="w-6 h-6 bg-slate-950" />
              </div>
            </div>
            <div className="flex justify-around items-center">
              <div className="w-4 h-4 bg-slate-950" />
              <div className="w-8 h-8 bg-slate-950 rounded-sm" />
              <div className="w-5 h-5 bg-slate-950" />
            </div>
            <div className="flex justify-between">
              <div className="w-12 h-12 border-4 border-slate-950 flex items-center justify-center">
                <div className="w-6 h-6 bg-slate-950" />
              </div>
              <div className="w-12 h-12 bg-slate-950" />
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 mt-2">
          HMAC-SHA256 Signed • Geofence {geofenceMeters}m
        </span>
      </div>

      {/* Dispatch Meta */}
      <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs font-mono">
        <div className="flex justify-between text-slate-400">
          <span>Declared Volume:</span>
          <span className="text-white font-bold">{volumeLiters.toLocaleString()} L</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Inflow Temperature:</span>
          <span className="text-emerald-400 font-bold">{temperatureC.toFixed(1)} °C</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Destination Plant:</span>
          <span className="text-slate-200 truncate max-w-[180px]">{destination}</span>
        </div>
        <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1.5">
          <span>Validity Window:</span>
          <span className="text-amber-400 font-bold">{validUntil}</span>
        </div>
      </div>
    </div>
  );
}
