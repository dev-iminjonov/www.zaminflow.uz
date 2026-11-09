"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getDriverHistory, DriverHistoryRecord } from "@/lib/driverStore";

export default function DriverHistoryPage() {
  const [history, setHistory] = useState<DriverHistoryRecord[]>([]);

  useEffect(() => {
    setHistory(getDriverHistory());
  }, []);

  const totalKm = history.reduce((acc, curr) => acc + curr.distanceKm, 0);
  const totalLiters = history.reduce((acc, curr) => acc + curr.volumeLiters, 0);
  const totalEarnings = history.reduce((acc, curr) => acc + curr.driverEarningsUZS, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HEADER ROW */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00ffc8]">
              Bajarilgan Reyslar va Ish Haqi Hisoboti
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Haydovchi Reyslar <span className="bg-gradient-to-r from-[#00ffc8] to-[#0099ff] bg-clip-text text-transparent">Tarixi</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Tashilgan xom sut hajmi, bosib oʻtilgan masofa va toʻlangan logistika daromadi reestri
          </p>
        </div>

        <Link
          href="/dashboard/driver"
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          ← Boshqaruv Paneliga Qaytish
        </Link>
      </div>

      {/* 2. SUMMARY TELEMETRY BENCH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[24px] bg-white/[0.03] border border-white/10 p-5">
          <div className="text-[11px] font-mono uppercase text-white/50">Jami Bosib Ötilgan Masofa</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-white">{totalKm.toLocaleString()}</span>
            <span className="text-xs font-mono text-[#00ffc8]">km</span>
          </div>
        </div>

        <div className="rounded-[24px] bg-white/[0.03] border border-white/10 p-5">
          <div className="text-[11px] font-mono uppercase text-white/50">Tashilgan Xom Sut</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-[#00ffc8]">{totalLiters.toLocaleString()}</span>
            <span className="text-xs font-mono text-white/50">LITR</span>
          </div>
        </div>

        <div className="rounded-[24px] bg-white/[0.03] border border-white/10 p-5">
          <div className="text-[11px] font-mono uppercase text-white/50">Jami Hisoblangan Daromad</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-[#00d3e0]">{totalEarnings.toLocaleString()}</span>
            <span className="text-xs font-mono text-white/50">UZS</span>
          </div>
        </div>
      </div>

      {/* 3. HISTORY TABLE */}
      <section className="rounded-[28px] bg-white/[0.03] border border-white/10 p-6 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase font-mono text-[10px]">
                <th className="py-3 px-3">Reys ID / Sana</th>
                <th className="py-3 px-3">Marşrut (Qabul → Yetkaziş)</th>
                <th className="py-3 px-3">Hajm</th>
                <th className="py-3 px-3">Masofa</th>
                <th className="py-3 px-3">Sovuq Zanjir</th>
                <th className="py-3 px-3">Daromad</th>
                <th className="py-3 px-3 text-right">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((h) => (
                <tr key={h.tripId} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-3">
                    <div className="font-mono font-bold text-white text-xs">{h.tripId}</div>
                    <div className="text-[10px] text-white/40">{h.completedDate}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white text-xs">{h.fromLocation}</div>
                    <div className="text-[10px] text-white/50">→ {h.toLocation}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    {h.volumeLiters.toLocaleString()} L
                  </td>
                  <td className="py-3.5 px-3 font-mono text-white/80">
                    {h.distanceKm} km
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="text-[10px] font-bold text-[#00ffc8] bg-[#00ffc8]/10 border border-[#00ffc8]/20 px-2 py-0.5 rounded-full">
                      {h.avgTemperatureC}°C (Buzilmagan)
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#00d3e0]">
                    {h.driverEarningsUZS.toLocaleString()} UZS
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00ffc8] bg-[#00ffc8]/10 border border-[#00ffc8]/20 px-2.5 py-0.5 rounded-full">
                      Yetkazildi ✓
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
