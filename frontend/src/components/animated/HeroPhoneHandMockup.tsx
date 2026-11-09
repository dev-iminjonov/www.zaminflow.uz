"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroPhoneHandMockup({ isDark = true }: { isDark?: boolean }) {
  const { locale } = useLanguage();
  // Live fluctuating telemetry simulation
  const [liters, setLiters] = useState(28450);
  const [temp, setTemp] = useState(3.4);
  const [chartIndex, setChartIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiters((prev) => prev + Math.floor(Math.random() * 9 - 4));
      setTemp((prev) => Number((3.2 + Math.random() * 0.3).toFixed(1)));
      setChartIndex((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[620px] lg:max-w-[680px] flex items-center justify-center select-none py-4 sm:py-6">
      {/* Harmonic Float Keyframes & Glow Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes harmonicFloatLaptop {
          0%, 100% {
            transform: translateY(0px) rotate(-1deg);
          }
          50% {
            transform: translateY(-11px) rotate(0.8deg);
          }
        }
        @keyframes harmonicFloatPhone {
          0%, 100% {
            transform: translateY(0px) rotate(3deg);
          }
          50% {
            transform: translateY(-15px) rotate(0.5deg);
          }
        }
        @keyframes glowPulseHarmonic {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.04);
          }
        }
        .anim-laptop-harmonic {
          animation: harmonicFloatLaptop 6.5s ease-in-out infinite;
        }
        .anim-phone-harmonic {
          animation: harmonicFloatPhone 6.5s ease-in-out infinite;
          animation-delay: -1.2s;
        }
        .anim-glow-harmonic {
          animation: glowPulseHarmonic 7s ease-in-out infinite;
        }
      `}} />

      {/* 1. SOFT GLOWING TURQUOISE DREAMLAND BACKDROP AURA */}
      <div className="absolute inset-0 -m-8 pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[120px] anim-glow-harmonic"
          style={{
            background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 35%, #0099ff 75%, transparent 100%)",
          }}
        />
      </div>

      {/* 2. HARMONIC DUO DEVICE SHOWCASE: OPEN LAPTOP + COMPANION PHONE */}
      <div className="relative z-10 w-full flex items-center justify-center">

        {/* ─── A. OPEN LAPTOP MOCKUP (ZaminFlow Web Platform) ─── */}
        <div className="relative z-10 w-[380px] sm:w-[460px] md:w-[500px] lg:w-[540px] anim-laptop-harmonic transition-transform duration-500">
          
          {/* Laptop Screen Lid */}
          <div className="relative rounded-t-[22px] sm:rounded-t-[26px] p-2.5 sm:p-3 bg-gradient-to-b from-[#2a343d] via-[#1a2027] to-[#0f1418] shadow-[0_30px_90px_rgba(0,153,255,0.22)] border-t border-x border-[#00d3e0]/40">
            
            {/* Webcam & Sensor Pinhole */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30">
              <div className="w-1.5 h-1.5 rounded-full bg-[#05080b] border border-white/20" />
              <div className="w-1 h-1 rounded-full bg-[#00ffc8] animate-pulse" />
            </div>

            {/* Laptop Display Bezel & Screen Surface */}
            <div className="relative rounded-t-[14px] sm:rounded-t-[18px] overflow-hidden bg-[#0a0d11] text-white flex flex-col font-sans border border-white/10 shadow-inner">
              
              {/* Browser Window Title Bar */}
              <div className="h-6 sm:h-7 bg-[#12171e] border-b border-white/10 px-2.5 sm:px-3 flex items-center justify-between">
                {/* Window Dots (macOS style) */}
                <div className="flex items-center gap-1.5">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#ff5f56]/90" />
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#ffbd2e]/90" />
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#27c93f]/90" />
                </div>

                {/* Browser URL Pill */}
                <div className="px-3 py-0.5 rounded-md bg-[#0a0d11] border border-white/10 text-[9px] sm:text-[10px] text-gray-300 font-mono flex items-center gap-1.5 shadow-xs">
                  <span className="text-[#00ffc8]">🔒</span>
                  <span>zaminflow.uz/terminal</span>
                  <span className="text-[8px] text-emerald-400 font-bold">✓ CBU Escrow</span>
                </div>

                {/* Right Status Indicator */}
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                  <span className="inline-flex items-center gap-1 text-[#00ffc8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] animate-ping" />
                    LIVE
                  </span>
                </div>
              </div>

              {/* ZaminFlow Desktop Platform Interface Content */}
              <div className="p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5 bg-gradient-to-b from-[#0e1319] to-[#090c0f]">
                
                {/* Platform Header Ribbon */}
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] flex items-center justify-center text-[10px] sm:text-xs font-black text-[#070B14] shadow-md">
                      Z
                    </div>
                    <span className="text-xs sm:text-sm font-black tracking-tight text-white">
                      Zamin<span className="text-[#00d3e0]">Flow</span>
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[8px] font-extrabold text-[#00ffc8] uppercase">
                      AgriTech B2B Terminal
                    </span>
                  </div>

                  {/* Role Tabs */}
                  <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-gray-400">
                    <span className="px-2 py-0.5 rounded-md bg-[#00ffc8] text-[#070B14] font-black">
                      {locale === "ru" ? "Фермер" : locale === "en" ? "Farmer" : "Fermer"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md hover:text-white transition-colors">
                      {locale === "ru" ? "Завод" : locale === "en" ? "Dairy" : "Zavod"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md hover:text-white transition-colors">
                      {locale === "ru" ? "Транспорт" : locale === "en" ? "Logistics" : "Tanker"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md hover:text-white transition-colors">
                      {locale === "ru" ? "Банк" : locale === "en" ? "Bank" : "Bank"}
                    </span>
                  </div>
                </div>

                {/* Dashboard Metrics Bento Row */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {/* Metric 1 */}
                  <div className="p-1.5 sm:p-2 rounded-xl bg-[#141a22] border border-white/10 flex flex-col justify-between">
                    <div className="text-[8px] text-gray-400 font-semibold uppercase truncate">
                      {locale === "ru" ? "Эскроу Резерв" : locale === "en" ? "Escrow Vault" : "Eskrou Zaxirasi"}
                    </div>
                    <div className="text-[11px] sm:text-xs font-black text-white mt-0.5">
                      142.8M <span className="text-[8px] text-[#00ffc8]">UZS</span>
                    </div>
                    <div className="text-[7px] sm:text-[8px] text-[#00ffc8] font-bold mt-0.5 flex items-center gap-0.5">
                      <span>{locale === "ru" ? "🔒 100% Заблокировано" : locale === "en" ? "🔒 100% Locked" : "🔒 100% Muzlatilgan"}</span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-1.5 sm:p-2 rounded-xl bg-[#141a22] border border-white/10 flex flex-col justify-between">
                    <div className="text-[8px] text-gray-400 font-semibold uppercase truncate">
                      {locale === "ru" ? "Суточные торги" : locale === "en" ? "Daily Volume" : "Kunlik Savdo"}
                    </div>
                    <div className="text-[11px] sm:text-xs font-black text-white mt-0.5">
                      {(liters + 19800).toLocaleString()} <span className="text-[8px] text-gray-400">L</span>
                    </div>
                    <div className="text-[7px] sm:text-[8px] text-[#00c5e7] font-bold mt-0.5">
                      ↑ +14.2% {locale === "ru" ? "активный объем" : locale === "en" ? "active volume" : "faol hajm"}
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-1.5 sm:p-2 rounded-xl bg-[#141a22] border border-[#00d3e0]/30 flex flex-col justify-between">
                    <div className="text-[8px] text-gray-400 font-semibold uppercase truncate">
                      {locale === "ru" ? "IoT Температура" : locale === "en" ? "IoT Temperature" : "IoT Harorat"}
                    </div>
                    <div className="text-[11px] sm:text-xs font-black text-[#00ffc8] mt-0.5 flex items-center gap-1">
                      <span>{temp}°C</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] animate-pulse" />
                    </div>
                    <div className="text-[7px] sm:text-[8px] text-gray-300 font-bold mt-0.5">
                      {locale === "ru" ? "18 активных цистерн" : locale === "en" ? "18 Active Tankers" : "18 ta Faol Sisterna"}
                    </div>
                  </div>
                </div>

                {/* Interactive Chart Preview Area */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#141a22] border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] mb-1">
                    <span className="font-extrabold text-white flex items-center gap-1.5">
                      <span>{locale === "ru" ? "Индекс рыночных цен" : locale === "en" ? "Market Price Index" : "Bozor Narxlari Indeksi"}</span>
                      <span className="text-[8px] text-[#00ffc8] font-semibold bg-[#00ffc8]/10 px-1.5 py-0.2 rounded">
                        4,450 UZS/L
                      </span>
                    </span>
                    <span className="text-[8px] text-gray-400 font-mono">Real-vaqt dinamikasi</span>
                  </div>

                  {/* Vector SVG Line Chart */}
                  <div className="h-10 sm:h-12 w-full relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 50" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="laptopChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00ffc8" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#0099ff" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 45 Q 40 25, 80 32 T 160 18 T 240 22 T 300 8 L 300 50 L 0 50 Z"
                        fill="url(#laptopChartGrad)"
                      />
                      <path
                        d="M 0 45 Q 40 25, 80 32 T 160 18 T 240 22 T 300 8"
                        fill="none"
                        stroke="#00ffc8"
                        strokeWidth="2.2"
                      />
                      {/* Pulse point at end */}
                      <circle cx="300" cy="8" r="3.5" fill="#00ffc8" className="animate-ping" />
                      <circle cx="300" cy="8" r="2.5" fill="#ffffff" />
                    </svg>
                  </div>
                </div>

                {/* Live Ticker Strip */}
                <div className="px-2 py-1 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-[8px] sm:text-[9px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[#00ffc8]">●</span>
                    <span className="font-bold text-gray-200">Sayxunobod Agro #42:</span>
                    <span className="text-gray-400">12,000 L Oliy A+ xom sut qabul qilindi</span>
                  </div>
                  <span className="text-[#00d3e0] font-black shrink-0 pl-2">Kafolatlangan ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Hinge & Keyboard Base Deck */}
          <div className="relative">
            {/* Display Hinge Bar */}
            <div className="h-1 sm:h-1.5 mx-auto w-24 sm:w-32 bg-[#12161b] rounded-t border-t border-white/20 shadow-xs" />
            
            {/* Base Keyboard Unibody Chassis */}
            <div className="relative h-3.5 sm:h-4.5 bg-gradient-to-b from-[#2a343d] via-[#1a2027] to-[#101418] rounded-b-[18px] sm:rounded-b-[22px] border-b-2 border-x border-[#00d3e0]/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center justify-center">
              {/* Center Opening Notch */}
              <div className="w-12 sm:w-16 h-1 bg-[#0a0d11] rounded-b-md border-b border-white/10" />
            </div>

            {/* Ambient Under-Chassis Neon Shadow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-[#00ffc8]/25 rounded-full blur-md pointer-events-none" />
          </div>
        </div>

        {/* ─── B. COMPANION SMARTPHONE MOCKUP (Tilted & In Harmonic Float) ─── */}
        <div className="absolute -right-2 sm:-right-4 lg:-right-6 -bottom-6 sm:-bottom-8 z-30 anim-phone-harmonic transition-transform duration-500">
          
          {/* Smartphone Outer Chassis with Polished Chrome Bezel */}
          <div className="relative w-[190px] sm:w-[220px] md:w-[240px] rounded-[38px] sm:rounded-[44px] p-2 sm:p-2.5 bg-gradient-to-b from-[#34414c] via-[#212930] to-[#0d1013] shadow-[0_25px_70px_rgba(0,153,255,0.38)] border-3 border-[#00ffc8]/40">
            
            {/* Dynamic Island / Speaker Pill */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-18 sm:w-20 h-3.5 sm:h-4 bg-[#000000] rounded-full z-40 flex items-center justify-end pr-1.5 gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#14181d] border border-white/20" />
              <div className="w-1 h-1 rounded-full bg-[#00ffc8] animate-pulse" />
            </div>

            {/* OLED Phone Screen Surface */}
            <div className="relative rounded-[30px] sm:rounded-[36px] overflow-hidden bg-[#0d1013] text-white flex flex-col pt-5 pb-2.5 px-2.5 sm:px-3 min-h-[380px] sm:min-h-[440px] shadow-inner border border-white/10 font-sans">
              
              {/* Top Phone Status Bar */}
              <div className="flex items-center justify-between text-[9px] font-semibold text-white/70 px-1 pt-1 mb-2">
                <span>09:41</span>
                <div className="flex items-center gap-1 text-[9px]">
                  <span>5G</span>
                  <span className="text-[#00ffc8]">⚡ 100%</span>
                </div>
              </div>

              {/* App Header Mini */}
              <div className="flex items-center justify-between px-0.5 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] flex items-center justify-center text-[9px] font-black text-[#0d1013] shadow-md">
                    Z
                  </div>
                  <div>
                    <div className="text-[8px] text-white/50 uppercase tracking-wider font-bold">ZaminFlow App</div>
                    <div className="text-[10px] font-extrabold text-white flex items-center gap-1">
                      {locale === "ru" ? "Мобильная телеметрия" : locale === "en" ? "Mobile Telemetry" : "Mobil Telemetriya"}{" "}
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] animate-ping" />
                    </div>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px]">
                  🔔
                </div>
              </div>

              {/* Cold-Chain Tanker Telematic Card */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-[#1a2026] to-[#14181d] border border-[#00d3e0]/30 shadow-md mb-2">
                <div className="flex items-center justify-between text-[8px] font-bold mb-1">
                  <span className="text-[#00ffc8] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8]" /> {locale === "ru" ? "РЕЙС #ZF-842" : locale === "en" ? "TRIP #ZF-842" : "REYS #ZF-842"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#0099ff]/20 text-[#00c5e7] border border-[#0099ff]/40 text-[7px]">
                    {temp}°C {locale === "ru" ? "ХОЛОД" : locale === "en" ? "COLD" : "SOVUQ"}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-0.5">
                  <div className="text-sm sm:text-base font-black tracking-tight text-white">
                    {liters.toLocaleString()} <span className="text-[9px] text-white/60 font-medium">{locale === "ru" ? "л" : locale === "en" ? "L" : "Litr"}</span>
                  </div>
                  <div className="text-[9px] font-bold text-[#00ffc8]">
                    4,380 <span className="text-[7px] text-white/50">UZS</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden my-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: "78%",
                      background: "linear-gradient(90deg, #00ffc8 0%, #0099ff 100%)",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[8px] text-white/60 font-medium">
                  <span>Sayxunobod</span>
                  <span>➔</span>
                  <span>{locale === "ru" ? "Ташкентский завод" : locale === "en" ? "Tashkent Dairy" : "Toshkent Zavod"}</span>
                </div>
              </div>

              {/* Verified Batch Item */}
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 mb-2">
                <div className="flex items-center justify-between text-[8px] text-white/50 font-bold uppercase mb-0.5">
                  <span>Baraka Agro Ferma</span>
                  <span className="text-[#00ffc8]">{locale === "ru" ? "Сорт A+" : locale === "en" ? "Grade A+" : "A+ Nav"}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-black text-white">
                  <span>12,000 {locale === "ru" ? "литров" : locale === "en" ? "Litres" : "Litr"}</span>
                  <span className="text-[9px] text-[#00d3e0] font-bold">
                    {locale === "ru" ? "15 мин осталось" : locale === "en" ? "15 min ETA" : "15 daq. qoldi"}
                  </span>
                </div>
              </div>

              {/* Escrow Blockage Card */}
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#00ffc8]/15 to-[#0099ff]/15 border border-[#00ffc8]/30 flex items-center justify-between mt-auto mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#00ffc8]/20 flex items-center justify-center text-[10px]">
                    🔒
                  </div>
                  <div>
                    <div className="text-[7px] text-white/60 font-bold uppercase">AgroBank Eskrou</div>
                    <div className="text-[10px] font-black text-white">48.5M UZS</div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#00ffc8] text-[#0d1013] text-[8px] font-black">
                  OK
                </span>
              </div>

              {/* Bottom Nav Bar with Center Button */}
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-around text-white/50 text-[10px]">
                <span className="text-[#00ffc8]">📊</span>
                <span>🚛</span>
                <div className="w-6 h-6 -mt-3 rounded-full bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#0d1013] flex items-center justify-center font-black shadow-md text-xs">
                  +
                </div>
                <span>💳</span>
                <span>👤</span>
              </div>

              {/* Home Bar */}
              <div className="w-16 h-1 bg-white/40 rounded-full mx-auto mt-1" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
