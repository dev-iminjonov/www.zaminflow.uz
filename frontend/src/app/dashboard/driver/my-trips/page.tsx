"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getDriverManifest, DriverStop } from "@/lib/driverStore";

export default function DriverTripsPage() {
  const [stops, setStops] = useState<DriverStop[]>([]);

  useEffect(() => {
    setStops(getDriverManifest());
  }, []);

  const totalLitresScheduled = stops.reduce((acc, curr) => acc + curr.volumeLiters, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            LOGISTIKA REYSI VA MARSHRUT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Bugungi Reys Manifesi &{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Bekatlar
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Sovuq zanjir tanker marshruti, fermalardan sut yuklash va zavodga yetkazish
          </p>
        </div>

        <Link
          href="/dashboard/driver/start-trip"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 text-[#070B14] font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,211,224,0.35)] transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <span>Reysni Boshlash →</span>
        </Link>
      </header>

      {/* 2. TELEMETRY SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Rejalashtirilgan Bekatlar</span>
            <span className="text-xs">📍</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-white">{stops.length}</span>
            <span className="text-xs text-white/50">bekat</span>
            <span className="ml-auto text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2.5 py-0.5">
              2 Ta Ferma Yuklash
            </span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Jami Yuklanadigan Sut</span>
            <span className="text-xs">🥛</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-white">
              {totalLitresScheduled.toLocaleString()}
            </span>
            <span className="text-xs text-[#00d3e0] font-mono">L</span>
            <span className="ml-auto text-[10px] font-bold bg-[#00d3e0]/15 border border-[#00d3e0]/30 text-[#00d3e0] rounded-full px-2.5 py-0.5">
              72% Tank Sig'imi
            </span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Tanker IoT Harorati</span>
            <span className="text-xs">❄️</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-[#00ffc8]">3.2°C</span>
            <span className="ml-auto text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2.5 py-0.5">
              ✓ Optimal (2°–4°C)
            </span>
          </div>
        </div>
      </section>

      {/* 3. MANIFEST STOPS TIMELINE */}
      <section className="flex flex-col gap-4">
        {stops.map((stop, index) => {
          const isNext = stop.status === "next";

          return (
            <div
              key={stop.id}
              className={`rounded-[28px] p-6 border shadow-lg flex flex-wrap items-center justify-between gap-6 transition-all ${
                isNext
                  ? "bg-white/[0.05] border-[#00ffc8]/40 shadow-[0_10px_35px_rgba(0,255,200,0.12)]"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono text-base font-black shadow-md ${
                    isNext
                      ? "bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#070B14]"
                      : "bg-white/5 text-white/60 border border-white/10"
                  }`}
                >
                  0{index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-base text-white">
                      {stop.time}
                    </span>
                    <span
                      className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 border ${
                        isNext
                          ? "bg-[#00ffc8]/15 border-[#00ffc8]/30 text-[#00ffc8]"
                          : "bg-white/5 border-white/10 text-white/50"
                      }`}
                    >
                      {isNext ? "● Keyingi Bekat" : "Rejalashtirilgan"}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{stop.locationName}</h3>
                  <div className="text-xs text-white/50">{stop.address}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div>
                  <div className="text-[11px] text-white/40 uppercase font-semibold">Partiya Kodi</div>
                  <div className="font-mono font-bold text-sm text-[#00d3e0]">
                    {stop.batchNumber}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-white/40 uppercase font-semibold">Yuklanadigan Hajm</div>
                  <div className="font-mono font-bold text-base text-[#00ffc8]">
                    {stop.volumeLiters.toLocaleString()} L
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-white/40 uppercase font-semibold">Mas'ul Shaxs</div>
                  <div className="text-xs font-semibold text-white">{stop.contactName}</div>
                  <div className="text-xs font-mono text-white/50">{stop.contactPhone}</div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href="/dashboard/driver/route"
                    className="px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:border-[#00d3e0] text-xs font-bold text-white hover:text-[#00ffc8] transition"
                  >
                    Xarita →
                  </Link>
                  {isNext && (
                    <Link
                      href="/dashboard/driver/confirm-pickup"
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition"
                    >
                      Yuklashni Tasdiqlash
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
