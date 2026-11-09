"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SplashDoodle } from "./DoodleAccents";
import { useLanguage } from "@/context/LanguageContext";
import {
  UZBEKISTAN_REGIONS,
  UZBEKISTAN_MAP_VIEWBOX,
  MILK_LOGISTICS_ARTERY_PATHS,
  UzbekistanRegionData,
} from "./uzbekistanMapData";

export default function RegionalMapSearchSection({ isDark = false }: { isDark?: boolean }) {
  const { t, locale } = useLanguage();
  const [activeRegion, setActiveRegion] = useState<UzbekistanRegionData>(
    UZBEKISTAN_REGIONS.find((r) => r.slug === "tashkent") || UZBEKISTAN_REGIONS[1]
  );
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  const handleSelectRegion = (region: UzbekistanRegionData) => {
    setActiveRegion(region);
  };

  // Major hubs to display permanent beacons on the map
  const majorHubs = UZBEKISTAN_REGIONS.filter(
    (r) => r.isMajorHub || r.id === activeRegion.id
  );

  return (
    <section id="stats" className="relative w-full py-20 sm:py-28 select-none overflow-hidden scroll-mt-24">
      {/* Inline Keyframe Animations for Map Arteries */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes arteryFlow {
          from { stroke-dashoffset: 140; }
          to { stroke-dashoffset: 0; }
        }
        .animate-artery-flow {
          animation: arteryFlow 12s linear infinite;
        }
      `}} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Top Header & Floating Search Bar */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-black tracking-widest uppercase text-[#00d3e0]">
              {t.mapSection.badge}
            </span>
            <SplashDoodle size={22} color="#00ffc8" />
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4 ${
              isDark ? "text-white" : "text-[#081c15]"
            }`}
          >
            {t.mapSection.titleStart}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              {t.mapSection.titleAccent}
            </span>
            {t.mapSection.titleEnd}
          </h2>

          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            {t.mapSection.subtitle}
          </p>
        </div>


        {/* Uzbekistan Vector SVG Map - Frameless & Open (Not in a container) */}
        <div className="relative w-full min-h-[520px] sm:min-h-[600px] lg:min-h-[660px] flex flex-col justify-between mt-4">

          {/* Ambient Cosmic Radial Glows */}
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#00ffc8]/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#0099ff]/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Actual SVG Map of Uzbekistan */}
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-6 lg:p-10 pointer-events-none z-10">
            <svg
              viewBox={UZBEKISTAN_MAP_VIEWBOX}
              className="w-full h-full max-h-[580px] object-contain drop-shadow-[0_10px_35px_rgba(0,0,0,0.5)] pointer-events-auto"
            >
              <defs>
                {/* Active Region Gradient */}
                <linearGradient id="activeRegionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00ffc8" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#00d3e0" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#0099ff" stopOpacity="0.22" />
                </linearGradient>

                {/* Hover Region Gradient */}
                <linearGradient id="hoverRegionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00ffc8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00d3e0" stopOpacity="0.12" />
                </linearGradient>

                {/* Artery Gradient */}
                <linearGradient id="arteryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00ffc8" />
                  <stop offset="50%" stopColor="#00d3e0" />
                  <stop offset="100%" stopColor="#0099ff" />
                </linearGradient>

                {/* Map Glow Filter */}
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background Map Ambient Blur Silhouette */}
              <g opacity="0.4" filter="url(#glowFilter)">
                {UZBEKISTAN_REGIONS.map((r) => (
                  <path
                    key={`ambient-${r.id}`}
                    d={r.d}
                    fill={r.id === activeRegion.id ? "#00ffc8" : "#00d3e0"}
                    stroke="none"
                    opacity={r.id === activeRegion.id ? 0.35 : 0.08}
                  />
                ))}
              </g>

              {/* Inter-Regional Cold Chain Logistics Arteries */}
              <g className="pointer-events-none">
                {MILK_LOGISTICS_ARTERY_PATHS.map((pathStr, idx) => (
                  <g key={`artery-${idx}`}>
                    {/* Shadow track */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="rgba(0, 153, 255, 0.15)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Flowing animated dash pulse */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="url(#arteryGrad)"
                      strokeWidth="1.8"
                      strokeDasharray="6 10"
                      strokeLinecap="round"
                      className="animate-artery-flow"
                      opacity="0.85"
                    />
                  </g>
                ))}
              </g>

              {/* 14 Uzbekistan Administrative Regions (Hoverable & Clickable) */}
              <g>
                {UZBEKISTAN_REGIONS.map((reg) => {
                  const isActive = activeRegion.id === reg.id;
                  const isHovered = hoveredRegionId === reg.id;

                  let fill = isDark ? "rgba(20, 26, 34, 0.75)" : "rgba(240, 248, 255, 0.9)";
                  let stroke = isDark ? "rgba(0, 211, 224, 0.28)" : "rgba(0, 153, 255, 0.35)";
                  let strokeWidth = 1.0;
                  let filter = "none";

                  if (isActive) {
                    fill = "url(#activeRegionGrad)";
                    stroke = "#00ffc8";
                    strokeWidth = 2.4;
                    filter = "url(#glowFilter)";
                  } else if (isHovered) {
                    fill = "url(#hoverRegionGrad)";
                    stroke = "#00d3e0";
                    strokeWidth = 1.8;
                  }

                  return (
                    <path
                      key={reg.id}
                      id={reg.id}
                      d={reg.d}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter={filter}
                      cursor="pointer"
                      className="transition-all duration-300"
                      onClick={() => handleSelectRegion(reg)}
                      onMouseEnter={() => setHoveredRegionId(reg.id)}
                      onMouseLeave={() => setHoveredRegionId(null)}
                    >
                      <title>{reg.name} — {reg.volume}</title>
                    </path>
                  );
                })}
              </g>

              {/* SVG Centroid Telemetry Beacons */}
              <g className="pointer-events-none">
                {majorHubs.map((hub) => {
                  const isActive = activeRegion.id === hub.id;
                  const { x, y } = hub.center;

                  return (
                    <g key={`beacon-${hub.id}`} transform={`translate(${x}, ${y})`}>
                      {isActive && (
                        <>
                          <circle r="18" fill="none" stroke="#00ffc8" strokeWidth="1.5" opacity="0.3" className="animate-ping" />
                          <circle r="10" fill="none" stroke="#00d3e0" strokeWidth="1.2" opacity="0.6" />
                        </>
                      )}
                      {/* Center Point */}
                      <circle
                        r={isActive ? 5 : 3.2}
                        fill={isActive ? "#00ffc8" : "#00d3e0"}
                        stroke="#070B14"
                        strokeWidth="1.5"
                        filter={isActive ? "url(#glowFilter)" : "none"}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Interactive HTML Radar Pins & Badges Layer */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {majorHubs.map((pin) => {
              const isActive = activeRegion.id === pin.id;
              return (
                <div
                  key={`html-pin-${pin.id}`}
                  onClick={() => handleSelectRegion(pin)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto transition-transform duration-300"
                  style={{ left: `${pin.center.pctX}%`, top: `${pin.center.pctY}%` }}
                >
                  {/* Radar Pulse Rings */}
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`absolute w-9 h-9 rounded-full transition-opacity ${
                        isActive
                          ? "bg-[#00ffc8]/40 animate-ping opacity-100"
                          : "bg-[#0099ff]/25 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                    {/* Pin Circle with White Ring & Milk Emoji */}
                    <div
                      className={`w-7 h-7 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-[11px] font-black transition-transform duration-300 ${
                        isActive
                          ? "bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] scale-125 text-[#070B14] shadow-[0_0_20px_rgba(0,255,200,0.7)]"
                          : "bg-[#070B14] text-white hover:scale-110"
                      }`}
                    >
                      🥛
                    </div>
                  </div>

                  {/* Pin Name Badge */}
                  <div
                    className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap shadow-md transition-all ${
                      isActive
                        ? "bg-[#00ffc8] text-[#070B14] font-black shadow-[0_4px_12px_rgba(0,255,200,0.5)]"
                        : "bg-[#070B14]/85 backdrop-blur-md text-white/90 border border-white/10 group-hover:bg-white group-hover:text-black"
                    }`}
                  >
                    {pin.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Region Detailed Tooltip Floating Card (Matches User Reference Image) */}
          <div
            className={`relative z-30 self-start max-w-sm w-full sm:w-auto rounded-3xl p-5 backdrop-blur-2xl border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
              isDark
                ? "bg-[#14181d]/90 border-[#00d3e0]/40 text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                : "bg-white/95 border-[#00d3e0]/40 text-[#081c15] shadow-[0_20px_50px_rgba(0,153,255,0.15)]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/40">
                {t.mapSection.activeRegionLabel}
              </span>
              <span className="text-xs font-bold text-amber-400">{activeRegion.rating}</span>
            </div>

            <h3 className="text-xl font-black tracking-tight mb-1">{activeRegion.name}</h3>

            <div className="grid grid-cols-2 gap-3 my-3 pt-2 border-t border-black/5 dark:border-white/10 text-xs">
              <div>
                <div className="text-[10px] opacity-60 font-medium">{t.mapSection.monthlyVolumeLabel}</div>
                <div className="font-extrabold text-[#0099ff]">{activeRegion.volume}</div>
              </div>
              <div>
                <div className="text-[10px] opacity-60 font-medium">{t.mapSection.avgPriceLabel}</div>
                <div className="font-extrabold text-[#00ffc8]">{activeRegion.price}</div>
              </div>
              <div>
                <div className="text-[10px] opacity-60 font-medium">{t.mapSection.fatSnfLabel}</div>
                <div className="font-bold text-gray-200">{activeRegion.fatContent} {t.mapSection.gradeText}</div>
              </div>
              <div>
                <div className="text-[10px] opacity-60 font-medium">{t.mapSection.coldStorageLabel}</div>
                <div className="font-bold text-[#00d3e0]">{activeRegion.coolingTemp}</div>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 mb-3 pt-1 border-t border-white/5 truncate">
              🏢 <span className="font-medium">{activeRegion.certifiedHub}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
              <span className="text-[11px] font-semibold opacity-75">
                {activeRegion.farms} {t.mapSection.certifiedFarmsSuffix}
              </span>
              <Link
                href="/sign-up"
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_14px_rgba(0,255,200,0.4)]"
              >
                {t.mapSection.viewLotBtn}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
