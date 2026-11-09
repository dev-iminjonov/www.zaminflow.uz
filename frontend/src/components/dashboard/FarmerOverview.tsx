"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, ThemeToggleButton } from "@/context/ThemeContext";
import {
  fetchFarmerDashboardData,
  FarmerDashboardData,
  EMPTY_FARMER_DATA,
  submitFarmerSupplyListing,
} from "@/lib/roleDashboardService";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import { resolveUserAvatar } from "@/lib/userAvatar";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import UniversalSpotlightSearch from "@/components/search/UniversalSpotlightSearch";
import B2BProfileWindow from "@/components/profile/B2BProfileWindow";
import InteractiveFinancialChart from "@/components/dashboard/InteractiveFinancialChart";
import InteractiveComparisonBarChart from "@/components/dashboard/InteractiveComparisonBarChart";
import InteractiveRadialGauge from "@/components/dashboard/InteractiveRadialGauge";

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
  const [data, setData] = useState<FarmerDashboardData | null>(EMPTY_FARMER_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Financial Chart Controls
  const [timeRange, setTimeRange] = useState<"1d" | "1w" | "1m" | "6m" | "1y" | "all">("1m");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

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

  const handleCreateSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitFarmerSupplyListing({
        volume_liters: Number(supplyLiters),
        cooling_temp_c: 3.4,
        milking_session: "MORNING",
        fat_pct: Number(supplyFat),
        snf_pct: 8.7,
        acidity_turner: 16.5,
      });
      setSupplySuccess(true);
      setTimeout(() => {
        setSupplySuccess(false);
        setShowSupplyModal(false);
        fetchFarmerDashboardData().then((res) => setData(res));
      }, 1500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Xatolik yuz berdi");
    }
  };

  return (
    <div className={`min-h-screen py-4 px-3 sm:px-6 relative overflow-x-hidden font-sans antialiased transition-colors duration-300 ${
      isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f6fbf8] text-[#081c15]"
    }`}>
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] pointer-events-none -z-0 opacity-20 blur-[140px] bg-gradient-to-br from-emerald-400 to-sky-400" />

      {/* Master Container: Fixed Left Sidebar + Dynamic In-Place Content Area (Figma/Investure Architecture) */}
      <div className={`relative z-10 max-w-[1520px] mx-auto rounded-[32px] border shadow-2xl flex flex-col lg:flex-row overflow-hidden transition-all ${
        isDark
          ? "bg-[#14181d] border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.6)] text-[#E8F1F2]"
          : "bg-white border-[#b7e4c7] shadow-[0_10px_35px_rgba(0,153,255,0.06)] text-[#081c15]"
      }`}>

        {/* =========================================================================
            LEFT NAVIGATION SIDEBAR (Exact Investure Layout)
        ========================================================================= */}
        <aside className={`w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r p-6 flex flex-col justify-between transition-colors ${
          isDark ? "border-white/10 bg-[#0d1013]" : "border-[#b7e4c7]/60 bg-[#f6fbf8]"
        }`}>
          <div>
            {/* 1. Brand Logo */}
            <div className="flex items-center pb-8">
              <Link href="/" className="flex items-center gap-2 transition hover:scale-105">
                <ZaminFlowLogo mode={themeMode} size="md" />
              </Link>
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
              {/* Universal Live Spotlight Search */}
              <UniversalSpotlightSearch
                role="farmer"
                onSelectAction={(item) => {
                  if (item.category === "batches") {
                    setActiveWindow("contracts");
                  } else if (item.category === "navigation") {
                    setActiveWindow("overview");
                  } else if (item.href) {
                    router.push(item.href);
                  }
                }}
              />

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

                {/* 1. HERO FINANCIAL CHART (Interactive & Live) */}
                <div className={`rounded-3xl p-6 sm:p-7 border relative overflow-hidden transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <InteractiveFinancialChart
                    title="Jami Qabul Qilingan & Kutilayotgan Qiymat"
                    subtitle="FERMER TRANZAKSIYALARI VA SOVRIN TÖLOVLARI"
                    totalDisplay={chartDatasets.total}
                    deltaDisplay={chartDatasets.delta}
                    deltaPositive={true}
                    unit="UZS"
                    accentColor="#10b981"
                    secondaryColor="#00d3e0"
                    gradientId="farmerChartGradient"
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                    points={chartDatasets.points}
                    isDark={isDark}
                  />
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
                        <span>{data?.todayPrice.delta || "+12.4% ösiş"}</span>
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
                        <span>Premium Rağbat: +400 UZS/L</span>
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
                        <h3 className="font-bold text-sm">Sönggi Partiyalar</h3>
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

                  {/* Col 2: Quality & Milk Composition (Interactive Radial Gauge) */}
                  <div className="lg:col-span-4 flex flex-col">
                    <InteractiveRadialGauge
                      title="Sut Sifat Tarkibi"
                      totalLabel="94.2% A-Sinf"
                      isDark={isDark}
                      defaultActiveKey="fat"
                      segments={[
                        { key: "fat", label: "Yogʻlik (Fat)", percentage: 82.0, color: "#10b981", sublabel: "Sut yogʻliligi: 4.1%", countFormatted: "4.1%" },
                        { key: "snf", label: "Quruq (SNF)", percentage: 87.0, color: "#0ea5e9", sublabel: "Quruq modda: 8.7%", countFormatted: "8.7%" },
                        { key: "density", label: "Zichlik", percentage: 95.0, color: "#f59e0b", sublabel: "Zichlik: 1.028", countFormatted: "1.028" },
                      ]}
                    />
                  </div>

                  {/* Col 3: Payouts & Dividend comparison (Interactive Dual Comparison Bar Chart) */}
                  <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between transition ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <InteractiveComparisonBarChart
                      title="Oylik Tölovlar Dinamikasi"
                      subtitle="6 oylik solishtirma tahlil"
                      currentLabel="2026 (Joriy)"
                      previousLabel="2025 (Avvalgi)"
                      currentTotal="18.2M UZS"
                      previousTotal="12.4M UZS"
                      primaryColor="#10b981"
                      unit="UZS"
                      isDark={isDark}
                      actionText="Barcha toʻlovlar tarixini ochish →"
                      onActionClick={() => setActiveWindow("payouts")}
                      items={[
                        { label: "Yan", currentVal: 14200000, previousVal: 9100000, currentFormatted: "14.2M UZS", previousFormatted: "9.1M UZS" },
                        { label: "Fev", currentVal: 15600000, previousVal: 10400000, currentFormatted: "15.6M UZS", previousFormatted: "10.4M UZS" },
                        { label: "Mar", currentVal: 15100000, previousVal: 11200000, currentFormatted: "15.1M UZS", previousFormatted: "11.2M UZS" },
                        { label: "Apr", currentVal: 17800000, previousVal: 12500000, currentFormatted: "17.8M UZS", previousFormatted: "12.5M UZS" },
                        { label: "May", currentVal: 18240000, previousVal: 13400000, currentFormatted: "18.2M UZS", previousFormatted: "13.4M UZS" },
                        { label: "Iyun", currentVal: 18500000, previousVal: 13900000, currentFormatted: "18.5M UZS", previousFormatted: "13.9M UZS" },
                      ]}
                    />
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
                          <th className="py-3 px-3">Qabul Qiluvçi Zavod</th>
                          <th className="py-3 px-3">Hajm</th>
                          <th className="py-3 px-3">Yoğlik</th>
                          <th className="py-3 px-3">Kafolatlangan Summa</th>
                          <th className="py-3 px-3">Holat</th>
                          <th className="py-3 px-3 text-right">Amal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                        {data?.payouts && data.payouts.length > 0 ? (
                          data.payouts.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                              <td className="py-3.5 px-3 font-bold">{row.batch}</td>
                              <td className="py-3.5 px-3 font-sans font-bold">Rasmiy Kliring Markazi</td>
                              <td className="py-3.5 px-3">-</td>
                              <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">4.1%</td>
                              <td className="py-3.5 px-3 font-bold">{row.amount} UZS</td>
                              <td className="py-3.5 px-3">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  {row.condition}
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center text-base mb-2">
                                📊
                              </div>
                              <p className="text-xs font-bold text-slate-600 dark:text-white/70">
                                Hozircha to'lov yozuvlari mavjud emas
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Yangi sut partiyasi topshirilgach, bank eskrou kliringi bu yerda aks etadi.
                              </p>
                              <button
                                type="button"
                                onClick={() => setShowSupplyModal(true)}
                                className="mt-3 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer"
                              >
                                + Yangi Partiya E'lon Qilish
                              </button>
                            </td>
                          </tr>
                        )}
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
                      <p className="text-xs text-slate-500">Muzlatgiç sisternalari harorati va qabul qiliş punktlari</p>
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
                      <p className="text-xs text-slate-500">Avtomatik ISO 20022 pacs.008 kliring tizimi orqali kafolatlangan tölovlar</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
                      ✓ Markaziy Bank Regulyativ Reestri #UZ-CBU-2026
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Jami Kliring Tölangan</span>
                      <div className="text-2xl font-black font-mono mt-1 text-emerald-900 dark:text-emerald-200">14,250,000 UZS</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <span className="text-[11px] uppercase font-bold text-amber-700 dark:text-amber-400">Eskrouda Bloklangan</span>
                      <div className="text-2xl font-black font-mono mt-1 text-amber-900 dark:text-amber-200">5,256,000 UZS</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
                      <span className="text-[11px] uppercase font-bold text-sky-700 dark:text-sky-400">Boğlangan Hisob (HUMO/UZCARD)</span>
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
                      <p className="text-xs text-slate-500">Zavod qabulida yoğlik yoki ziçlik bahsi yuzaga kelsa mustaqil laboratoriya tekşiruvi</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      Faol nizolar yoʻq (0)
                    </span>
                  </div>

                  <div className="p-8 text-center my-6 border border-dashed rounded-3xl border-slate-300 dark:border-white/10">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl mb-3">
                      ⚖️
                    </div>
                    <h4 className="font-bold text-base">Barça partiyalar sinovi töliq tasdiqlangan</h4>
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
                  <p className="text-xs text-slate-500 mb-6">Mavsumiy sut narxlari va ozuqa ratsioni böyiça prognozlar</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-500">Kutilayotgan Oylik Daromad</span>
                      <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">24,500,000 UZS</div>
                      <p className="text-[11px] text-slate-500 mt-2">Ozuqa özgarişi hisobiga sut yoğliligi +0.3% oşişi kutilmoqda.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-500">Mintaqaviy Kliring Örtaça Narxi</span>
                      <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">5,800 UZS/L</div>
                      <p className="text-[11px] text-slate-500 mt-2">Samarqand va Toshkent viloyatlarida talab yuqori.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 7: SETTINGS & STIR (Role-Adaptive B2B Profile Window)
            ========================================================================= */}
            {activeWindow === "settings" && (
              <B2BProfileWindow session={session} role="farmer" isDark={isDark} />
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
                  <label className="font-bold block mb-1">Kutilayotgan Yoğlilik (%)</label>
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
                  <span>Jami Şartnoma Qiymati:</span>
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
