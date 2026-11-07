"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function DriverGateHandoverPage() {
  const [tokenRefreshed, setTokenRefreshed] = useState(false);

  const handleRefresh = () => {
    setTokenRefreshed(true);
    setTimeout(() => setTokenRefreshed(false), 2000);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Factory Gate Handover</h1>
          <p className="text-xs text-slate-500">Toshkent Dairy JSC • Plant Gate 02</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>Live location on</span>
        </div>
      </div>

      {/* 1. Cold-Chain Telemetry Card (Section 10.7) */}
      <div className="rounded-[20px] bg-white border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
              TANKER SENSOR TELEMETRY
            </span>
            <span className="font-mono text-2xl font-black text-slate-900">4.1 °C</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Collected Volume</span>
            <span className="text-base font-black text-slate-900">1,950 L</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-50">
            <span className="text-[10px] text-slate-400 uppercase block">Tank Seal #</span>
            <span className="font-bold text-slate-900">SL-99482-B</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50">
            <span className="text-[10px] text-slate-400 uppercase block">Gate Arrival ETA</span>
            <span className="font-bold text-emerald-700">12:45 UZT</span>
          </div>
        </div>

        {/* Three-row reading log per Section 10.7 */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
            Recent In-Transit Readings Log
          </span>
          {[
            { time: "11:45", temp: "4.1 °C", loc: "Tashkent Ring Rd km 14", status: "NORMAL" },
            { time: "11:15", temp: "4.0 °C", loc: "Oqdaryo Junction", status: "NORMAL" },
            { time: "10:45", temp: "3.9 °C", loc: "Zarafshon Route #2", status: "NORMAL" },
          ].map((log) => (
            <div
              key={log.time}
              className="flex justify-between items-center p-2 rounded-lg bg-slate-50 text-[11px] font-mono text-slate-700"
            >
              <span>{log.time}</span>
              <span className="font-bold text-slate-900">{log.temp}</span>
              <span className="text-slate-500 truncate max-w-[120px]">{log.loc}</span>
              <span className="text-emerald-700 font-bold text-[10px]">{log.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Tanker Gate Handover QR Card (Dark QR card with 3 vial codes) */}
      <div className="rounded-[20px] bg-[#0F172A] border border-slate-800 text-white p-5 shadow-float space-y-4 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
          <span className="font-mono text-teal-400 font-bold">DISPATCH-HANDOVER-2026-R1106</span>
          <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold">
            GATE CONSOLE TOKEN
          </span>
        </div>

        {/* QR Tile */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-md border-2 border-slate-100">
          <div className="w-40 h-40 bg-white flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className="w-10 h-10 border-4 border-slate-950 flex items-center justify-center">
                <div className="w-5 h-5 bg-slate-950" />
              </div>
              <div className="w-10 h-10 border-4 border-slate-950 flex items-center justify-center">
                <div className="w-5 h-5 bg-slate-950" />
              </div>
            </div>
            <div className="flex justify-around items-center">
              <div className="w-4 h-4 bg-slate-950" />
              <div className="w-7 h-7 bg-slate-950 rounded-sm" />
              <div className="w-4 h-4 bg-slate-950" />
            </div>
            <div className="flex justify-between">
              <div className="w-10 h-10 border-4 border-slate-950 flex items-center justify-center">
                <div className="w-5 h-5 bg-slate-950" />
              </div>
              <div className="w-10 h-10 bg-slate-950" />
            </div>
          </div>
        </div>

        {/* Three Linked Reference Vial Codes */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-xs font-mono space-y-1.5 text-left">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Linked Physical Reference Sample Vials:
          </span>
          <div className="flex justify-between text-slate-300">
            <span>Stop 1 (Baraka Farm):</span>
            <span className="text-emerald-400 font-bold">RV-261106-014</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Stop 2 (Zarafshon):</span>
            <span className="text-emerald-400 font-bold">RV-261106-015</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Stop 3 (Navoiy Farm):</span>
            <span className="text-emerald-400 font-bold">RV-261106-016</span>
          </div>
        </div>

        <Button
          variant="glass"
          size="sm"
          onClick={handleRefresh}
          className="w-full"
        >
          {tokenRefreshed ? "✓ Handover Token Refreshed" : "Refresh handover token"}
        </Button>
      </div>
    </div>
  );
}
