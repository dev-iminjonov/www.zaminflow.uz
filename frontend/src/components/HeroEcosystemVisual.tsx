"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface HeroEcosystemVisualProps {
  isDark: boolean;
}

export default function HeroEcosystemVisual({ isDark }: HeroEcosystemVisualProps) {
  const { t } = useLanguage();
  const [livePrice, setLivePrice] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/v1/public/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.avgRawMilkPrice?.value > 0) {
          setLivePrice(data.avgRawMilkPrice.value);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const displayPrice = livePrice ? livePrice.toLocaleString("en-US") : "4,380";

  return (
    <div className="relative w-full max-w-[620px] lg:max-w-none mx-auto select-none p-4 sm:p-6 lg:p-8">
      {/* 1. SOFT GLOWING EMERALD AURA ILLUMINATING THE SCENE */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div
          className={`w-[480px] h-[480px] sm:w-[600px] sm:h-[600px] rounded-full blur-[120px] ${
            isDark
              ? "bg-gradient-to-tr from-[#1B98E0]/20 via-[#006494]/30 to-[#00C853]/20"
              : "bg-gradient-to-tr from-[#00b4d8]/25 via-[#48cae4]/20 to-[#90e0ef]/25"
          }`}
        />
      </div>

      {/* 2. 3D ISOMETRIC ECOSYSTEM RENDER CONTAINER */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(8,28,21,0.12)] border border-white/80 dark:border-white/10 bg-white/40 dark:bg-[#13293D]/40 backdrop-blur-md">
        <picture>
          <source srcSet="/images/hero-ecosystem-3d.avif" type="image/avif" />
          <source srcSet="/images/hero-ecosystem-3d.webp" type="image/webp" />
          <img
            src="/images/hero-ecosystem-3d.jpg"
            alt="ZaminFlow Connected 3D Agricultural Ecosystem"
            className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-500"
            width={1376}
            height={768}
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>

      {/* 3. THREE FLOATING FROSTED-GLASS BENTO UI CARDS */}

      {/* CARD 1: TOP-LEFT "LIVE PRICING" WITH VIBRANT GREEN SPARKLINE */}
      <div
        className={`absolute -top-3 sm:-top-5 left-1 sm:left-2 z-20 w-[195px] sm:w-[225px] rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl border transition-all duration-300 animate-float-1 ${
          isDark
            ? "bg-[#13293D]/90 border-[#247BA0]/50 text-[#E8F1F2] shadow-[0_16px_36px_rgba(0,0,0,0.4)]"
            : "bg-white/95 border-[#ade8f4] text-[#03045e] shadow-[0_16px_36px_rgba(8,28,21,0.08)]"
        }`}
      >
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-ping shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#087a3c] dark:text-[#22d36b] truncate">
              {t.hero.cards.livePricing}
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#087a3c]/10 dark:bg-[#00C853]/15 text-[#087a3c] dark:text-[#22d36b] font-bold shrink-0">
            +12.4%
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[#03045e] dark:text-white">
            {displayPrice}
          </span>
          <span className="text-[11px] text-[#0077b6] dark:text-[#E8F1F2]/70 font-bold">
            UZS / L
          </span>
        </div>

        {/* Vector Sparkline Chart */}
        <div className="w-full h-9 relative my-1">
          <svg viewBox="0 0 100 36" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="heroSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M0 30 Q 15 28, 25 22 T 50 18 T 75 12 T 100 6 L 100 36 L 0 36 Z"
              fill="url(#heroSparklineGrad)"
            />
            <path
              d="M0 30 Q 15 28, 25 22 T 50 18 T 75 12 T 100 6"
              fill="none"
              stroke="#0096c7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="6" r="3.5" fill="#0096c7" className="animate-pulse" />
          </svg>
        </div>

        <div className="mt-1 flex items-center justify-between text-[10px] text-[#0077b6] dark:text-[#E8F1F2]/60 font-medium">
          <span>{t.hero.cards.fat} 4.1%</span>
          <span>{t.hero.cards.snf} 8.7% ({t.hero.cards.grade})</span>
        </div>
      </div>

      {/* CARD 2: BOTTOM-LEFT "LOGISTICS" WITH MINIMALIST DIGITAL ROUTE */}
      <div
        className={`absolute -bottom-3 sm:-bottom-5 left-1 sm:left-2 z-20 w-[225px] sm:w-[255px] rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl border transition-all duration-300 animate-float-2 ${
          isDark
            ? "bg-[#13293D]/90 border-[#247BA0]/50 text-[#E8F1F2] shadow-[0_16px_36px_rgba(0,0,0,0.4)]"
            : "bg-white/95 border-[#ade8f4] text-[#03045e] shadow-[0_16px_36px_rgba(8,28,21,0.08)]"
        }`}
      >
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <svg className="w-3.5 h-3.5 text-[#087a3c] dark:text-[#22d36b] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#087a3c] dark:text-[#22d36b] truncate">
              {t.hero.cards.logistics}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#087a3c]/10 dark:bg-[#00C853]/15 text-[#087a3c] dark:text-[#22d36b] whitespace-nowrap shrink-0">
            +3.2°C {t.hero.cards.cold}
          </span>
        </div>

        <div className="text-xs font-bold truncate mb-1 text-[#03045e] dark:text-white">
          Sayxunobod &rarr; Toshkent
        </div>
        <div className="text-[11px] text-[#0077b6] dark:text-[#E8F1F2]/70 mb-2 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8]" />
          <span>{t.hero.cards.lockEta}</span>
        </div>

        {/* Minimalist Route Progress Line */}
        <div className="w-full bg-[#ade8f4]/50 dark:bg-white/10 h-1.5 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-[#48cae4] to-[#0096c7] w-[75%] rounded-full" />
        </div>
      </div>

      {/* CARD 3: BOTTOM-RIGHT "SECURED ESCROW" WITH 3D PADLOCK & VERIFIED CHECK */}
      <div
        className={`absolute -bottom-3 sm:-bottom-5 right-1 sm:right-2 z-20 w-[215px] sm:w-[245px] rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl border transition-all duration-300 animate-float-3 ${
          isDark
            ? "bg-[#13293D]/90 border-[#247BA0]/50 text-[#E8F1F2] shadow-[0_16px_36px_rgba(0,0,0,0.4)]"
            : "bg-white/95 border-[#ade8f4] text-[#03045e] shadow-[0_16px_36px_rgba(8,28,21,0.08)]"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {/* Glowing 3D-styled Padlock Icon */}
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#023e8a] flex items-center justify-center text-white shadow-md">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-[#087a3c] dark:text-[#22d36b]">
              {t.hero.cards.securedEscrow}
            </div>
            <div className="text-[10px] text-[#0077b6] dark:text-[#E8F1F2]/60 font-semibold">
              {t.hero.cards.bankLocked}
            </div>
          </div>
        </div>

        {/* High contrast bold currency value */}
        <div className="text-base sm:text-lg font-black font-mono tracking-tight text-[#03045e] dark:text-white my-1">
          48,500,000 <span className="text-[11px] font-sans font-semibold text-[#0077b6] dark:text-[#E8F1F2]/70">UZS</span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#087a3c] dark:text-[#22d36b] font-bold">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{t.hero.cards.autoRelease}</span>
        </div>
      </div>
    </div>
  );
}
