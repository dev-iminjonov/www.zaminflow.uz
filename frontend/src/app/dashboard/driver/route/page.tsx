"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface RouteWaypoint {
  name: string;
  distance: string;
  time: string;
  passed: boolean;
  active: boolean;
  desc: string;
}

export default function DriverRoutePage() {
  // Live driving simulation state
  const [isDriving, setIsDriving] = useState(true);
  const [speedKmH, setSpeedKmH] = useState(68);
  const [routeProgress, setRouteProgress] = useState(72); // percentage along route
  const [tempProbe1, setTempProbe1] = useState(3.2);
  const [tempProbe2, setTempProbe2] = useState(3.1);
  const [tempProbe3, setTempProbe3] = useState(3.3);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState(34);
  const [etaMinutes, setEtaMinutes] = useState(28);

  // Fluctuating telematic telemetry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDriving) {
      interval = setInterval(() => {
        setSpeedKmH(Math.floor(64 + Math.random() * 8));
        setTempProbe1(Number((3.15 + Math.random() * 0.2).toFixed(1)));
        setTempProbe2(Number((3.05 + Math.random() * 0.2).toFixed(1)));
        setTempProbe3(Number((3.25 + Math.random() * 0.2).toFixed(1)));
        
        setRouteProgress((prev) => {
          if (prev >= 98) return 98;
          return prev + 0.3;
        });

        setDistanceRemainingKm((prev) => Math.max(1, Number((prev - 0.2).toFixed(1))));
        setEtaMinutes((prev) => Math.max(2, Math.round((distanceRemainingKm / 68) * 60)));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isDriving, distanceRemainingKm]);

  const waypoints: RouteWaypoint[] = [
    {
      name: "Sayxunobod Agro Ferma",
      desc: "5,000 L Oliy A+ xom sut yuklandi. e-TTN QR yaratildi",
      distance: "0 km",
      time: "11:20",
      passed: true,
      active: false,
    },
    {
      name: "M39 Sirdaryo Nazorat Bepul Yölagi",
      desc: "Avtomatik tarozi nazorati: 38.4 tonna yalpi vazn",
      distance: "42 km",
      time: "12:05",
      passed: true,
      active: false,
    },
    {
      name: "Çinoz Köprigi / Toşkent Kiriş",
      desc: "Magistral oqimida harakat. Harorat +3.2°C me'yorda",
      distance: "78 km",
      time: "12:45",
      passed: false,
      active: true,
    },
    {
      name: "Toşkent Halqa Yöli (THAY Sergeli)",
      desc: "Zavod qabul bölimiga buriliş yönalişi",
      distance: "112 km",
      time: "13:15",
      passed: false,
      active: false,
    },
    {
      name: "Bektemir / Samarqand Sut Zavodi #4",
      desc: "3-Boks qabul bunkeri va ekspress gate-lab tahlili",
      distance: "124 km",
      time: "13:30 (ETA)",
      passed: false,
      active: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full select-none font-sans">
      
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ffc8] animate-ping" />
            <span className="text-[11px] font-mono font-black tracking-widest text-[#00d3e0] uppercase">
              RTK 0.5M GPS TELEMETRIYA & SOVUQ ZANJIR HUD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Jonli Reys Telematikasi:{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Sayxunobod ➔ Bektemir
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            MAN TGX 18.440 (01 | 777 ZAM) • 20,000L AISI 304 sisterna • PT100 4x datchiklar zanjiri
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDriving(!isDriving)}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all border flex items-center gap-2 ${
              isDriving
                ? "bg-[#00ffc8] text-[#070B14] border-[#00ffc8] shadow-[0_0_15px_rgba(0,255,200,0.4)]"
                : "bg-white/10 text-white border-white/15"
            }`}
          >
            <span>{isDriving ? "⏸ Pauza" : "▶ Jonli Telemetriya"}</span>
          </button>

          <a
            href="https://yandex.com/maps"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#14181d] border border-white/15 hover:border-[#00d3e0] text-white hover:text-[#00ffc8] font-bold text-xs shadow-md transition-all"
          >
            <span>Yandex Navigator ↗</span>
          </a>
        </div>
      </header>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#14181d]/90 border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hozirgi Tezlik</div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            {speedKmH} <span className="text-xs text-[#00ffc8] font-bold">km/soat</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">✓ M39 Magistrali (Tezlik normada)</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14181d]/90 border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Qolgan Masofa</div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#00d3e0] mt-1">
            {distanceRemainingKm} <span className="text-xs text-gray-400 font-bold">km</span>
          </div>
          <div className="text-[10px] text-gray-400 font-semibold mt-1">Jami reys: 124 km</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14181d]/90 border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Taxminiy Yetib Borish (ETA)</div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#00ffc8] mt-1">
            {etaMinutes} <span className="text-xs text-gray-400 font-bold">daqiqa</span>
          </div>
          <div className="text-[10px] text-[#00ffc8] font-semibold mt-1">Jadvalga muvofiq: 13:30</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14181d]/90 border border-[#00ffc8]/30 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sovuq Zanjir Holati</div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#00ffc8] mt-1 flex items-center gap-1.5">
            <span>+{tempProbe1}°C</span>
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
          </div>
          <div className="text-[10px] text-gray-300 font-semibold mt-1">AISI-304 Termo-germetik</div>
        </div>
      </div>

      {/* 3. INTERACTIVE SIMULATED GIS ROUTE MAP & THERMAL MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Visual Highway Route & Thermal Graph */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Animated Route HUD Box */}
          <div className="relative rounded-[32px] p-6 sm:p-8 bg-gradient-to-br from-[#131920]/95 via-[#0e141a]/95 to-[#090d10]/95 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
            
            {/* Ambient Back Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ffc8]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8]">
                  Jonli Trassirovka
                </span>
                <span className="text-xs font-bold text-gray-300">
                  M39 Xalqaro Magistral Yoʻlagi
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#00d3e0] bg-black/40 px-3 py-1 rounded-full border border-white/10">
                GPS: 40.8241° N, 68.9112° E
              </span>
            </div>

            {/* Interactive Vector GIS Road Corridor */}
            <div className="relative w-full h-48 sm:h-56 rounded-2xl bg-[#090d11] border border-white/10 p-4 overflow-hidden shadow-inner flex flex-col justify-between">
              
              {/* Road Grid Lines */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#00d3e0 1.2px, transparent 1.2px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Waypoint Endpoint Badges */}
              <div className="relative z-10 flex justify-between items-center text-xs font-bold">
                <div className="px-3 py-1.5 rounded-xl bg-[#14181d]/90 border border-white/15 text-white flex items-center gap-1.5 shadow-md">
                  <span>🌾</span> Sayxunobod Ferma (5,000 L)
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black flex items-center gap-1.5 shadow-md">
                  <span>🏭</span> Samarqand Zavod #4
                </div>
              </div>

              {/* Curving SVG Road with Animated Traveling Tanker */}
              <div className="relative z-10 w-full my-auto">
                <svg className="w-full h-16 overflow-visible" viewBox="0 0 600 60" preserveAspectRatio="none">
                  {/* Road Shadow */}
                  <path
                    d="M 10 30 Q 150 55, 300 25 T 590 30"
                    fill="none"
                    stroke="#1a222d"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Road Center Dashes */}
                  <path
                    d="M 10 30 Q 150 55, 300 25 T 590 30"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />
                  {/* Completed Green Progress Track */}
                  <path
                    d="M 10 30 Q 150 55, 300 25 T 590 30"
                    fill="none"
                    stroke="url(#tankerRouteGrad)"
                    strokeWidth="6"
                    strokeDasharray="600"
                    strokeDashoffset={600 - (600 * (routeProgress / 100))}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="tankerRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00ffc8" />
                      <stop offset="50%" stopColor="#00d3e0" />
                      <stop offset="100%" stopColor="#0099ff" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Animated Tanker Pulse Pin */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -mt-1 transform -translate-x-1/2 transition-all duration-500 z-20 cursor-pointer"
                  style={{ left: `${routeProgress}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-[#00ffc8]/40 animate-ping" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-sm flex items-center justify-center shadow-[0_0_20px_#00ffc8]">
                      🚛
                    </div>
                  </div>
                  <div className="absolute top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-[#00ffc8]/50 text-[9px] font-black text-[#00ffc8] whitespace-nowrap shadow-md">
                    +{tempProbe1}°C
                  </div>
                </div>
              </div>

              {/* Bottom Road Stats */}
              <div className="relative z-10 flex justify-between items-center text-[11px] font-bold text-gray-400">
                <span>Trassa: M39 Magistral</span>
                <span className="text-[#00ffc8] font-mono">
                  {routeProgress.toFixed(0)}% Marshrut Bajarildi
                </span>
                <span>Yöl Qoplamasi: Quruq • Oçiq</span>
              </div>
            </div>

            {/* Multi-Section PT100 Thermal Sensor Matrix */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>❄</span> 4x PT100 Boʻlimli Termo-Monitoring
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Kafolatlangan Sovuq Zanjir
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Section 1 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                    <span>1-Bölim (Oldi)</span>
                    <span className="text-[#00ffc8] font-bold">8,000 L</span>
                  </div>
                  <div className="text-xl font-black font-mono text-white">
                    +{tempProbe1}°C
                  </div>
                  <div className="text-[9px] text-[#00ffc8] font-bold mt-1">Norma: +3.0°C – +3.5°C</div>
                </div>

                {/* Section 2 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                    <span>2-Bölim (Örta)</span>
                    <span className="text-[#00d3e0] font-bold">6,000 L</span>
                  </div>
                  <div className="text-xl font-black font-mono text-white">
                    +{tempProbe2}°C
                  </div>
                  <div className="text-[9px] text-[#00d3e0] font-bold mt-1">Norma: +3.0°C – +3.5°C</div>
                </div>

                {/* Section 3 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                    <span>3-Bölim (Orqa)</span>
                    <span className="text-[#0099ff] font-bold">6,000 L</span>
                  </div>
                  <div className="text-xl font-black font-mono text-white">
                    +{tempProbe3}°C
                  </div>
                  <div className="text-[9px] text-[#0099ff] font-bold mt-1">Norma: +3.0°C – +3.5°C</div>
                </div>
              </div>
            </div>

          </div>

          {/* Electronic Seals & e-TTN Verification */}
          <div className="rounded-[28px] p-6 bg-[#14181d]/80 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00ffc8]/20 to-[#0099ff]/20 text-[#00ffc8] border border-[#00ffc8]/30 flex items-center justify-center text-xl">
                🔒
              </div>
              <div>
                <div className="text-xs font-black text-white">Elektron Klapan Plombalari Faol</div>
                <div className="text-[10px] text-gray-400 font-mono">
                  SEAL-UZ-4401 (Germetik) • SEAL-UZ-4402 (Tranzit qulflangan)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/driver/scan"
                className="px-4 py-2 rounded-full bg-[#00ffc8] text-[#070B14] font-black text-xs hover:opacity-90 transition shadow-md shadow-[#00ffc8]/20"
              >
                e-TTN QR Skanerlash ➔
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Turn-by-Turn Waypoints & Emergency Dispatch */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="rounded-[32px] p-6 bg-[#14181d]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-[#00d3e0]">
                  Nazorat Nuqtalari
                </span>
                <span className="text-[10px] font-mono text-gray-400">5 ta Waypoint</span>
              </div>

              <div className="space-y-3">
                {waypoints.map((wp, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border text-xs flex gap-3 transition-all ${
                      wp.active
                        ? "bg-[#00ffc8]/10 border-[#00ffc8]/40 shadow-sm"
                        : wp.passed
                        ? "bg-white/[0.02] border-white/5 opacity-70"
                        : "bg-white/[0.01] border-white/5 opacity-50"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-[10px] shrink-0 ${
                        wp.active
                          ? "bg-[#00ffc8] text-[#070B14] shadow-[0_0_10px_#00ffc8]"
                          : wp.passed
                          ? "bg-emerald-500/30 text-emerald-300"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {wp.passed ? "✓" : i + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-xs">{wp.name}</span>
                        <span className="font-mono text-[10px] text-[#00d3e0]">{wp.time}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        {wp.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link
                href="/dashboard/driver/report-issue"
                className="w-full py-3 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>⚠ Nosozlik / Keçikiş haqida xabar beriş</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
