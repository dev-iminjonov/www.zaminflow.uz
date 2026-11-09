"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, ThemeToggleButton } from "@/context/ThemeContext";
import {
  fetchFarmerDashboardData,
  FarmerDashboardData,
  MOCK_FARMER_DATA,
} from "@/lib/roleDashboardService";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import { resolveUserAvatar } from "@/lib/userAvatar";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export type FarmerWindowKey =
  | "overview"
  | "contracts"
  | "deliveries"
  | "payouts"
  | "disputes"
  | "analytics"
  | "settings";

export default function FarmerOverview() {
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const { themeMode, isDark } = useTheme();

  // Active in-place window tab (Figma/Linear/Investure style - no page reload!)
  const [activeWindow, setActiveWindow] = useState<FarmerWindowKey>("overview");

  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<FarmerDashboardData | null>(MOCK_FARMER_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Financial Chart Controls
  const [timeRange, setTimeRange] = useState<"1d" | "1w" | "1m" | "6m" | "1y" | "all">("1m");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  // Supply list modal state
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [supplyLiters, setSupplyLiters] = useState(850);
  const [supplyFat, setSupplyFat] = useState(3.8);
  const [supplyPrice, setSupplyPrice] = useState(5800);
  const [supplySuccess, setSupplySuccess] = useState(false);

  // Delivery filter state
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "in_transit" | "completed">("all");

  useEffect(() => {
    let isMounted = true;
    setSession(getStoredSession());

    const loadData = async () => {
      try {
        const result = await fetchFarmerDashboardData();
        if (isMounted) setData(result);
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Maʻlumot yuklanmadi";
          setError(message);
        }
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") loadData();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const firstName = session?.user?.fullName
    ? session.user.fullName.trim().split(" ").slice(-1)[0]
    : "Muhammadaziz";

  // Financial Chart Data based on timeRange
  const chartDatasets = useMemo(() => {
    switch (timeRange) {
      case "1d":
        return {
          points: [
            { label: "06:00", val: 12400000 },
            { label: "09:00", val: 13800000 },
            { label: "12:00", val: 15100000 },
            { label: "15:00", val: 14700000 },
            { label: "18:00", val: 16900000 },
            { label: "21:00", val: 18240000 },
          ],
          total: "18,240,000 UZS",
          delta: "+4.2% bugun",
        };
      case "1w":
        return {
          points: [
            { label: "Dush", val: 14200000 },
            { label: "Sesh", val: 15600000 },
            { label: "Chor", val: 15100000 },
            { label: "Pay", val: 17800000 },
            { label: "Jum", val: 16900000 },
            { label: "Shan", val: 18240000 },
            { label: "Yak", val: 18500000 },
          ],
          total: "18,500,000 UZS",
          delta: "+9.1% bu hafta",
        };
      case "1m":
      default:
        return {
          points: [
            { label: "1 May", val: 12100000 },
            { label: "5 May", val: 13400000 },
            { label: "10 May", val: 15800000 },
            { label: "15 May", val: 14900000 },
            { label: "20 May", val: 17200000 },
            { label: "25 May", val: 16800000 },
            { label: "1 Iyun", val: 18240000 },
          ],
          total: "18,240,000 UZS",
          delta: "+18.84% bu oy",
        };
      case "6m":
      case "1y":
      case "all":
        return {
          points: [
            { label: "Yan", val: 9400000 },
            { label: "Fev", val: 11200000 },
            { label: "Mar", val: 13800000 },
            { label: "Apr", val: 15900000 },
            { label: "May", val: 17400000 },
            { label: "Iyun", val: 18240000 },
          ],
          total: "18,240,000 UZS",
          delta: "+48.6% yarim yillik",
        };
    }
  }, [timeRange]);

  // Compute SVG coordinates for the Investure-style smooth curve
  const svgMetrics = useMemo(() => {
    const pts = chartDatasets.points;
    const minVal = Math.min(...pts.map((p) => p.val)) * 0.95;
    const maxVal = Math.max(...pts.map((p) => p.val)) * 1.05;
    const width = 760;
    const height = 220;

    const coords = pts.map((p, idx) => {
      const x = (idx / (pts.length - 1)) * (width - 40) + 20;
      const y = height - ((p.val - minVal) / (maxVal - minVal)) * (height - 40) - 20;
      return { x, y, label: p.label, value: `${(p.val / 1000000).toFixed(2)}M UZS` };
    });

    // Build SVG smooth path
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    return { coords, pathD, areaD, width, height };
  }, [chartDatasets]);

  // Navigation items matching the Investure layout
  const navigationItems: Array<{
    key: FarmerWindowKey;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      key: "overview",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      key: "contracts",
      label: "Sut Partiyalari",
      badge: "8",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      key: "deliveries",
      label: "Yetkazib Berish",
      badge: "Live",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
    {
      key: "payouts",
      label: "Moliya & Eskrou",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "disputes",
      label: "Arbitraj & Sifat",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      key: "analytics",
      label: "Tahlil & Prognoz",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      key: "settings",
      label: "Sozlamalar & STIR",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const handleCreateSupply = (e: React.FormEvent) => {
    e.preventDefault();
    setSupplySuccess(true);
    setTimeout(() => {
      setSupplySuccess(false);
      setShowSupplyModal(false);
    }, 1500);
  };

  return (
    <div className={`min-h-screen py-4 px-3 sm:px-6 relative overflow-x-hidden font-sans antialiased transition-colors duration-300 ${
      isDark ? "bg-[#0b0f14] text-white" : "bg-[#f1f5f9] text-slate-900"
    }`}>
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] pointer-events-none -z-0 opacity-20 blur-[140px] bg-gradient-to-br from-emerald-400 to-sky-400" />

      {/* Master Container: Fixed Left Sidebar + Dynamic In-Place Content Area (Figma/Investure Architecture) */}
      <div className={`relative z-10 max-w-[1520px] mx-auto rounded-[32px] border shadow-2xl flex flex-col lg:flex-row overflow-hidden transition-all ${
        isDark
          ? "bg-[#121820] border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.6)] text-white"
          : "bg-white border-slate-200 shadow-[0_20px_70px_rgba(15,23,42,0.06)] text-slate-900"
      }`}>

        {/* =========================================================================
            LEFT NAVIGATION SIDEBAR (Exact Investure Layout)
        ========================================================================= */}
        <aside className={`w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r p-6 flex flex-col justify-between transition-colors ${
          isDark ? "border-white/10 bg-[#0e1319]" : "border-slate-100 bg-[#fafcff]"
        }`}>
          <div>
            {/* 1. Brand Logo */}
            <div className="flex items-center justify-between pb-8">
              <Link href="/" className="flex items-center gap-2 transition hover:scale-105">
                <ZaminFlowLogo mode={themeMode} size="md" />
              </Link>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                Farmer Pro
              </span>
            </div>

            {/* 2. Navigation Items with Right Emerald Indicator Line */}
            <nav className="space-y-1.5" role="tablist">
              {navigationItems.map((item) => {
                const isActive = activeWindow === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveWindow(item.key)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all relative group cursor-pointer ${
                      isActive
                        ? isDark
                          ? "bg-white/[0.08] text-white"
                          : "bg-slate-100 text-slate-900 shadow-xs"
                        : isDark
                        ? "text-white/60 hover:text-white hover:bg-white/[0.03]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`transition-colors ${
                        isActive
                          ? "text-emerald-500"
                          : isDark ? "text-white/40 group-hover:text-white/70" : "text-slate-400 group-hover:text-slate-600"
                      }`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? "bg-emerald-500 text-white"
                            : isDark ? "bg-white/10 text-white/60" : "bg-slate-200 text-slate-600"
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Right Indicator Line (Signature Investure Feature) */}
                      {isActive && (
                        <span className="w-1.5 h-5 rounded-full bg-emerald-500 absolute right-1.5 top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 3. Bottom Financial Advisor Promo Card (Exact Investure Style) */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/10">
            <div className={`p-4 rounded-2xl border text-center relative overflow-hidden transition ${
              isDark ? "bg-white/[0.02] border-white/10" : "bg-gradient-to-br from-emerald-50/60 to-sky-50/60 border-emerald-100"
            }`}>
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg mb-2">
                🏛️
              </div>
              <div className="font-bold text-xs mb-1">
                AgroBank Maslahatchisi
              </div>
              <p className={`text-[11px] leading-relaxed mb-3 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                Sut hosildorligi garovida 0% li faktoring kafolati va subsidiyalar olish.
              </p>
              <button
                type="button"
                onClick={() => setActiveWindow("payouts")}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
              >
                Eskrouni koʻrish
              </button>
            </div>

            {/* User Quick Pill */}
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                    {resolveUserAvatar(firstName, session?.user?.email) ? (
                      <img
                        src={resolveUserAvatar(firstName, session?.user?.email) || ""}
                        alt={firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{firstName.charAt(0)}</span>
                    )}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-white dark:border-[#0e1319]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight truncate max-w-[110px]">{firstName}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Fermer ID #882</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                title="Chiqish"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            RIGHT MAIN WINDOW (In-place tabbed content - zero page reload)
        ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0">

          {/* 1. TOP HEADER BAR */}
          <header className={`px-6 sm:px-8 py-5 border-b flex flex-wrap items-center justify-between gap-4 transition-colors ${
            isDark ? "border-white/10 bg-[#121820]" : "border-slate-100 bg-white"
          }`}>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {activeWindow === "overview" && "Dashboard"}
                {activeWindow === "contracts" && "Sut Partiyalari & Xarid Shartnomalari"}
                {activeWindow === "deliveries" && "Sovuq Zanjir & Logistika Radar"}
                {activeWindow === "payouts" && "AgroBank Eskrou & Kliring Hisob-kitobi"}
                {activeWindow === "disputes" && "Sifat Arbitraji & Laboratoriya Nazorati"}
                {activeWindow === "analytics" && "Hosildorlik & Moliya Prognozi"}
                {activeWindow === "settings" && "Fermer Profili & Soliq.uz STIR"}
              </h1>
              <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                ZaminFlow Jonli Kliring & Sovuq Zanjir Telemetriyasi
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Pill */}
              <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs transition ${
                isDark ? "bg-white/5 border-white/10 text-white/50 focus-within:border-emerald-500" : "bg-slate-50 border-slate-200 text-slate-500 focus-within:border-emerald-500"
              }`}>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Partiya yoki shartnoma qidirish..."
                  className="bg-transparent border-none outline-hidden text-xs w-48 placeholder-slate-400"
                />
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-200/60 dark:bg-white/10">⌘K</kbd>
              </div>

              {/* Language Selector */}
              <div className={`flex rounded-full p-1 border text-[11px] font-bold ${
                isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
              }`}>
                {(["uz", "ru", "en"] as const).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocale(loc)}
                    className={`px-2.5 py-0.5 rounded-full uppercase transition cursor-pointer ${
                      locale === loc
                        ? "bg-emerald-600 text-white font-black shadow-xs"
                        : isDark ? "text-white/60 hover:text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {/* Single Theme Toggle Button */}
              <ThemeToggleButton size="sm" />

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => setShowSupplyModal(true)}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <span>+</span>
                <span>Yangi Partiya</span>
              </button>
            </div>
          </header>

          {/* 2. DYNAMIC CONTENT SWITCHER (In-place window rendering) */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto">

            {/* =========================================================================
                WINDOW 1: OVERVIEW (Exact Investure / FlowBoard FinTech Layout)
            ========================================================================= */}
            {activeWindow === "overview" && (
              <div className="space-y-6">

                {/* 1. HERO FINANCIAL CHART (Investure Total Invested Value replica) */}
                <div className={`rounded-3xl p-6 sm:p-7 border relative overflow-hidden transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
                    <div>
                      <span className={`text-xs font-mono uppercase font-bold tracking-wider ${
                        isDark ? "text-white/50" : "text-slate-500"
                      }`}>
                        Jami Qabul Qilingan & Kutilayotgan Qiymat
                      </span>
                      <div className="flex items-baseline gap-3 mt-1">
                        <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                          {chartDatasets.total}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          ▲ {chartDatasets.delta}
                        </span>
                      </div>
                    </div>

                    {/* Chart Controls: Line/Bar Toggle + Timeframe Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`flex rounded-xl p-1 border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                      }`}>
                        <button
                          type="button"
                          onClick={() => setChartType("line")}
                          className={`p-1.5 rounded-lg transition ${
                            chartType === "line"
                              ? "bg-white dark:bg-white/20 text-emerald-600 dark:text-white shadow-xs"
                              : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          }`}
                          title="Line Chart"
                        >
                          📈
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartType("bar")}
                          className={`p-1.5 rounded-lg transition ${
                            chartType === "bar"
                              ? "bg-white dark:bg-white/20 text-emerald-600 dark:text-white shadow-xs"
                              : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          }`}
                          title="Bar Chart"
                        >
                          📊
                        </button>
                      </div>

                      <div className={`flex rounded-xl p-1 border text-xs font-bold ${
                        isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                      }`}>
                        {(["1d", "1w", "1m", "6m", "1y", "all"] as const).map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => setTimeRange(period)}
                            className={`px-2.5 py-1 rounded-lg uppercase transition cursor-pointer ${
                              timeRange === period
                                ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-black"
                                : "text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive SVG Chart Canvas */}
                  <div className="relative pt-4 pb-2">
                    {/* Horizontal Reference Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[10px] font-mono text-slate-400">
                      <div className="border-b border-dashed border-slate-400 dark:border-white w-full flex justify-end pr-2">20M</div>
                      <div className="border-b border-dashed border-slate-400 dark:border-white w-full flex justify-end pr-2">16M</div>
                      <div className="border-b border-dashed border-slate-400 dark:border-white w-full flex justify-end pr-2">12M</div>
                      <div className="border-b border-dashed border-slate-400 dark:border-white w-full flex justify-end pr-2">8M</div>
                    </div>

                    {chartType === "line" ? (
                      <div className="relative w-full h-[220px]">
                        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgMetrics.width} ${svgMetrics.height}`}>
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Gradient Area */}
                          <path d={svgMetrics.areaD} fill="url(#chartGradient)" />

                          {/* Main Smooth Line */}
                          <path
                            d={svgMetrics.pathD}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Interactive Points */}
                          {svgMetrics.coords.map((pt, idx) => (
                            <circle
                              key={idx}
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredPoint?.x === pt.x ? 6 : 4}
                              className="fill-white dark:fill-[#121820] stroke-emerald-500 stroke-[3] cursor-pointer transition-all hover:scale-125"
                              onMouseEnter={() => setHoveredPoint(pt)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          ))}
                        </svg>

                        {/* Hover Tooltip (Investure exact replica) */}
                        {hoveredPoint && (
                          <div
                            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono shadow-xl border border-white/20 flex flex-col items-center"
                            style={{ left: `${(hoveredPoint.x / svgMetrics.width) * 100}%`, top: `${hoveredPoint.y}px` }}
                          >
                            <span className="text-[10px] text-slate-400">{hoveredPoint.label}</span>
                            <span className="font-bold text-emerald-400">{hoveredPoint.value}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Bar Chart view */
                      <div className="h-[220px] flex items-end justify-between gap-3 px-4 pt-6">
                        {chartDatasets.points.map((pt, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className={`w-full max-w-[40px] rounded-t-xl transition-all ${
                              idx === chartDatasets.points.length - 1
                                ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                                : isDark ? "bg-white/10 group-hover:bg-emerald-500/40" : "bg-slate-200 group-hover:bg-emerald-500/40"
                            }`} style={{ height: `${(pt.val / 20000000) * 180}px` }} />
                            <span className="text-[10px] font-mono text-slate-400">{pt.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bottom Date Labels */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5">
                      {chartDatasets.points.map((pt, idx) => (
                        <span key={idx}>{pt.label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. FOUR FINANCIAL BENTO METRIC CARDS (Investure 4-card row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Milk Yield */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:-translate-y-0.5 ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase font-bold ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        Oylik Qabul Hajmi
                      </span>
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                        🥛
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black font-mono">
                        {data?.suppliedThisMonth.value || "18,240"} <span className="text-xs font-normal text-slate-400">Litr</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold mt-1">
                        <span>↗ +14.98% / oy</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Escrow Balance */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:-translate-y-0.5 ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase font-bold ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        Kafolatlangan Eskrou
                      </span>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                        🔒
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black font-mono">
                        {data?.nextPayout.value || "5,256,000"} <span className="text-xs font-normal text-amber-500 font-bold">UZS</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-1">
                        <span>AgroBank ATB Depoziti</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Unit Price */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:-translate-y-0.5 ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase font-bold ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        Birja Narxi (1 Litr)
                      </span>
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                        📈
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black font-mono">
                        {data?.todayPrice.value || "4,380"} <span className="text-xs font-normal text-slate-400">UZS</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mt-1">
                        <span>{data?.todayPrice.delta || "+12.4% oʻsish"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Quality Index */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:-translate-y-0.5 ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase font-bold ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        Laboratoriya Sinfi
                      </span>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                        💎
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {data?.qualityGrade.grade || "A+"}{" "}
                        <span className="text-xs font-normal text-slate-400 font-sans">
                          ({data?.qualityGrade.snf || "SNF 8.7%"})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mt-1">
                        <span>Premium Ragʻbat: +400 UZS/L</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. THREE-COLUMN BOTTOM BENTO (Investure Top Gainers / Diversification / Dividend replica) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                  {/* Col 1: Top Deliveries / Batches (Investure "Top gainers") */}
                  <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between transition ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                        <h3 className="font-bold text-sm">Soʻnggi Partiyalar</h3>
                        <span className="text-xs font-mono text-slate-400">Haftalik ▾</span>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-white/5 mt-2 space-y-1">
                        {data?.recentDeliveries.map((delivery) => (
                          <div key={delivery.id} className="py-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                🌾
                              </div>
                              <div>
                                <div className="font-bold text-xs">{delivery.destination}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{delivery.volume} &bull; {delivery.batch}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold font-mono text-xs text-emerald-600 dark:text-emerald-400">
                                {(delivery as any).amount || "5,256,000"} UZS
                              </div>
                              <span className={`text-[10px] font-bold ${
                                delivery.statusType === "success" ? "text-emerald-500" : "text-amber-500"
                              }`}>
                                {delivery.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveWindow("deliveries")}
                      className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-center w-full block cursor-pointer"
                    >
                      Barcha yetkazishlarni koʻrish →
                    </button>
                  </div>

                  {/* Col 2: Quality & Milk Composition (Investure "Diversification" Half-Circle Gauge) */}
                  <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between transition ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                        <h3 className="font-bold text-sm">Sut Sifat Tarkibi</h3>
                        <span className="text-xs font-mono text-emerald-500 font-bold">Laboratoriya Tasdiqlagan</span>
                      </div>

                      {/* Half-Circle Gauge (Signature Investure Feature) */}
                      <div className="my-6 flex flex-col items-center justify-center">
                        <div className="relative w-44 h-24 overflow-hidden flex items-end justify-center">
                          <svg className="w-44 h-44 -rotate-180" viewBox="0 0 100 100">
                            {/* Background Track */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"}
                              strokeWidth="10"
                              strokeDasharray="125 250"
                            />
                            {/* Quality Fill Arc */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="10"
                              strokeDasharray="118 250"
                              strokeLinecap="round"
                            />
                          </svg>

                          <div className="absolute bottom-0 flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Soflik Koʻrsatkichi</span>
                            <span className="text-2xl font-black font-mono">94.2%</span>
                          </div>
                        </div>

                        {/* Legend row */}
                        <div className="grid grid-cols-2 gap-3 w-full mt-5 text-[11px] font-mono">
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Yogʻlik (Fat)
                            </span>
                            <span className="font-bold">4.1%</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <span className="w-2 h-2 rounded-full bg-sky-500" /> Quruq Modda (SNF)
                            </span>
                            <span className="font-bold">8.7%</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <span className="w-2 h-2 rounded-full bg-amber-500" /> Zichlik (Density)
                            </span>
                            <span className="font-bold">1.028</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <span className="w-2 h-2 rounded-full bg-purple-500" /> Kislotalilik
                            </span>
                            <span className="font-bold">16.5°T</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveWindow("disputes")}
                      className="pt-3 border-t border-slate-100 dark:border-white/10 text-xs font-bold text-slate-500 hover:text-emerald-500 text-center w-full block cursor-pointer"
                    >
                      Laboratoriya sinov sertifikatlari →
                    </button>
                  </div>

                  {/* Col 3: Payouts & Dividend comparison (Investure "Dividend" bar chart) */}
                  <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between transition ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                        <h3 className="font-bold text-sm">Oylik Toʻlovlar</h3>
                        <span className="text-xs font-mono text-slate-400">6 oy ▾</span>
                      </div>

                      <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-1">
                        {[
                          { m: "Yan", h1: "40%", h2: "25%" },
                          { m: "Fev", h1: "65%", h2: "45%" },
                          { m: "Mar", h1: "50%", h2: "35%" },
                          { m: "Apr", h1: "80%", h2: "55%" },
                          { m: "May", h1: "95%", h2: "70%" },
                          { m: "Iyun", h1: "85%", h2: "60%" },
                        ].map((b, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className="w-full flex items-end justify-center gap-1 h-32">
                              <div
                                className="w-2.5 rounded-full bg-emerald-500 shadow-sm"
                                style={{ height: b.h1 }}
                                title="2026 Toʻlov"
                              />
                              <div
                                className="w-2.5 rounded-full bg-slate-300 dark:bg-white/20"
                                style={{ height: b.h2 }}
                                title="2025 Solishtirma"
                              />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{b.m}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-4 text-[10px] font-mono pt-3 border-t border-slate-100 dark:border-white/10">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> 2026 (Joriy)
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" /> 2025 (Avvalgi)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveWindow("payouts")}
                      className="pt-3 border-t border-slate-100 dark:border-white/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-center w-full block cursor-pointer"
                    >
                      Barcha toʻlovlar tarixini ochish →
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* =========================================================================
                WINDOW 2: CONTRACTS & MILK BATCHES (In-place window)
            ========================================================================= */}
            {activeWindow === "contracts" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <h3 className="text-lg font-bold">Faol Sut Partiyalari va Shartnomalar</h3>
                      <p className="text-xs text-slate-500">AgroBank ATB Eskrou shartnomalari orqali bloklangan partiyalar</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSupplyModal(true)}
                      className="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
                    >
                      + Yangi Partiya Qoʻshish
                    </button>
                  </div>

                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 uppercase font-mono text-[10px] text-slate-400">
                          <th className="py-3 px-3">Partiya ID</th>
                          <th className="py-3 px-3">Qabul Qiluvchi Zavod</th>
                          <th className="py-3 px-3">Hajm</th>
                          <th className="py-3 px-3">Yogʻlik</th>
                          <th className="py-3 px-3">Kafolatlangan Summa</th>
                          <th className="py-3 px-3">Holat</th>
                          <th className="py-3 px-3 text-right">Amal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                        {[
                          { id: "ZF-B882", factory: "Samarqand Sut Zavodi #4", vol: "850 Litr", fat: "4.1%", sum: "4,930,000 UZS", status: "Kafolatlangan (Eskrou)", color: "emerald" },
                          { id: "ZF-B881", factory: "Toshkent Agro Processing", vol: "620 Litr", fat: "3.9%", sum: "3,596,000 UZS", status: "Yoʻlda (Tranzit)", color: "blue" },
                          { id: "ZF-B880", factory: "Buxoro Fayz Sut MCHJ", vol: "1,100 Litr", fat: "4.2%", sum: "6,600,000 UZS", status: "Toʻlandi (Bank)", color: "purple" },
                        ].map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                            <td className="py-3.5 px-3 font-bold">{row.id}</td>
                            <td className="py-3.5 px-3 font-sans font-bold">{row.factory}</td>
                            <td className="py-3.5 px-3">{row.vol}</td>
                            <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{row.fat}</td>
                            <td className="py-3.5 px-3 font-bold">{row.sum}</td>
                            <td className="py-3.5 px-3">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {row.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-sans">
                              <button
                                type="button"
                                onClick={() => setActiveWindow("deliveries")}
                                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                              >
                                Kuzatish →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 3: DELIVERIES & COLD-CHAIN IOT (In-place window)
            ========================================================================= */}
            {activeWindow === "deliveries" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <h3 className="text-lg font-bold">Sovuq Zanjir & GPS Telemetriya Radari</h3>
                      <p className="text-xs text-slate-500">Muzlatgich sisternalari harorati va qabul qilish punktlari</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">4 Ta Jonli Mashina</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">🚚 Sisterna #01 | 777 ZAM</span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">Normada</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono text-slate-500">
                        <span>Kriogen Harorat:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">3.2°C (Bloklangan)</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono text-slate-500">
                        <span>GPS Manzil:</span>
                        <span className="font-bold">M39 Magistral &bull; Samarqand tomon</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: "75%" }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">🚚 Sisterna #01 | 420 SAM</span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500 text-white font-bold">Yuklanmoqda</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono text-slate-500">
                        <span>Kriogen Harorat:</span>
                        <span className="font-bold text-blue-500">2.9°C</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono text-slate-500">
                        <span>Joylashuv:</span>
                        <span className="font-bold">Oqdaryo Markaziy Fermasi</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: "30%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 4: PAYOUTS & ESCROW CLEARING (In-place window)
            ========================================================================= */}
            {activeWindow === "payouts" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <h3 className="text-lg font-bold">AgroBank ATB Eskrou Depozitariysi & Payouts</h3>
                      <p className="text-xs text-slate-500">Avtomatik ISO 20022 pacs.008 kliring tizimi orqali kafolatlangan toʻlovlar</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                      ✓ Markaziy Bank Regulyativ Reestri #UZ-CBU-2026
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Jami Kliring Toʻlangan</span>
                      <div className="text-2xl font-black font-mono mt-1 text-emerald-900 dark:text-emerald-200">14,250,000 UZS</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <span className="text-[11px] uppercase font-bold text-amber-700 dark:text-amber-400">Eskrouda Bloklangan</span>
                      <div className="text-2xl font-black font-mono mt-1 text-amber-900 dark:text-amber-200">5,256,000 UZS</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
                      <span className="text-[11px] uppercase font-bold text-sky-700 dark:text-sky-400">Bogʻlangan Hisob (HUMO/UZCARD)</span>
                      <div className="text-base font-bold font-mono mt-2">8600 •••• •••• 4219</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 5: DISPUTES & ARBITRATION (In-place window)
            ========================================================================= */}
            {activeWindow === "disputes" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <h3 className="text-lg font-bold">Sifat Nazorati va Arbitraj Xonasi</h3>
                      <p className="text-xs text-slate-500">Zavod qabulida yogʻlik yoki zichlik bahsi yuzaga kelsa mustaqil laboratoriya tekshiruvi</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      Faol nizolar yoʻq (0)
                    </span>
                  </div>

                  <div className="p-8 text-center my-6 border border-dashed rounded-3xl border-slate-300 dark:border-white/10">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl mb-3">
                      ⚖️
                    </div>
                    <h4 className="font-bold text-base">Barcha partiyalar sinovi toʻliq tasdiqlangan</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Oxirgi 30 kun ichida barcha yetkazilgan sut partiyalari zavod qabulida A+ sinfiga muvofiq qabul qilindi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 6: ANALYTICS & PROJECTIONS (In-place window)
            ========================================================================= */}
            {activeWindow === "analytics" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <h3 className="text-lg font-bold pb-2">Hosildorlik & Kelgusi Oy Prognozi</h3>
                  <p className="text-xs text-slate-500 mb-6">Mavsumiy sut narxlari va ozuqa ratsioni boʻyicha prognozlar</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-500">Kutilayotgan Oylik Daromad</span>
                      <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">24,500,000 UZS</div>
                      <p className="text-[11px] text-slate-500 mt-2">Ozuqa oʻzgarishi hisobiga sut yogʻliligi +0.3% oshishi kutilmoqda.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-500">Mintaqaviy Kliring Oʻrtacha Narxi</span>
                      <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">5,800 UZS/L</div>
                      <p className="text-[11px] text-slate-500 mt-2">Samarqand va Toshkent viloyatlarida talab yuqori.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 7: SETTINGS & STIR (In-place window)
            ========================================================================= */}
            {activeWindow === "settings" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <h3 className="text-lg font-bold pb-2">Fermer Maʻlumotlari & STIR</h3>
                  <p className="text-xs text-slate-500 mb-6">Soliq.uz va AgroBank tizimlariga ulangan yuridik fermer xoʻjaligi</p>

                  <div className="space-y-4 max-w-lg text-xs">
                    <div>
                      <label className="font-bold block mb-1">Fermer Xoʻjaligi Nomi</label>
                      <input
                        type="text"
                        defaultValue="Oqdaryo Fayzli Dalalari FX"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">STIR (TIN)</label>
                      <input
                        type="text"
                        defaultValue="308112940"
                        readOnly
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Bogʻlangan Telefon</label>
                      <input
                        type="text"
                        defaultValue="+998 90 123 45 67"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition cursor-pointer"
                    >
                      Oʻzgarishlarni Saqlash
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </main>

      </div>

      {/* =========================================================================
          NEW MILK SUPPLY MODAL
      ========================================================================= */}
      {showSupplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl transition ${
            isDark ? "bg-[#141b24] border-white/20 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="font-bold text-base">Yangi Sut Partiyasini Eʻlon Qilish</h3>
              <button
                type="button"
                onClick={() => setShowSupplyModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {supplySuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl">
                  ✓
                </div>
                <div className="font-black text-lg">Partiya Muvaffaqiyatli Eʻlon Qilindi!</div>
                <p className="text-xs text-slate-500">AgroBank ATB Eskrou shartnomasi rasmiylashtirildi.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateSupply} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="font-bold block mb-1">Sut Hajmi (Litr)</label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={supplyLiters}
                    onChange={(e) => setSupplyLiters(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Kutilayotgan Yogʻlilik (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2.5"
                    max="6.0"
                    value={supplyFat}
                    onChange={(e) => setSupplyFat(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Talab Qilingan Narx (UZS/L)</label>
                  <input
                    type="number"
                    min="3000"
                    max="9000"
                    step="50"
                    value={supplyPrice}
                    onChange={(e) => setSupplyPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent font-mono"
                    required
                  />
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] flex justify-between items-center">
                  <span>Jami Shartnoma Qiymati:</span>
                  <span className="font-black text-sm">{(supplyLiters * supplyPrice).toLocaleString()} UZS</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Eskrou Himoyasida Joylash →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
