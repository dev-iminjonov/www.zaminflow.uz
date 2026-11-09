"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, ThemeToggleButton } from "@/context/ThemeContext";
import {
  fetchDairyDashboardData,
  DairyDashboardData,
  EMPTY_DAIRY_DATA,
} from "@/lib/roleDashboardService";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import { resolveUserAvatar } from "@/lib/userAvatar";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import UniversalSpotlightSearch from "@/components/search/UniversalSpotlightSearch";
import B2BProfileWindow from "@/components/profile/B2BProfileWindow";
import InteractiveFinancialChart from "@/components/dashboard/InteractiveFinancialChart";
import InteractiveComparisonBarChart from "@/components/dashboard/InteractiveComparisonBarChart";
import InteractiveRadialGauge from "@/components/dashboard/InteractiveRadialGauge";

export type DairyWindowKey =
  | "overview"
  | "orders"
  | "shipments"
  | "escrow"
  | "pricing"
  | "analytics"
  | "settings";

export default function DairyOverview() {
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const { themeMode, isDark } = useTheme();

  // Active in-place window tab (Figma/Investure style - zero page reload!)
  const [activeWindow, setActiveWindow] = useState<DairyWindowKey>("overview");

  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<DairyDashboardData | null>(EMPTY_DAIRY_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Financial Chart Controls
  const [timeRange, setTimeRange] = useState<"1d" | "1w" | "1m" | "6m" | "1y" | "all">("1m");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Procurement order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [procureLiters, setProcureLiters] = useState(5000);
  const [procureRegion, setProcureRegion] = useState("Samarqand");
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Regional prices state
  const [regionalPriceAdjustments, setRegionalPriceAdjustments] = useState<Record<string, number>>({
    Samarqand: 5800,
    Toshkent: 6200,
    Fargʻona: 5600,
    Buxoro: 5400,
  });

  const handlePriceStep = (region: string, delta: number) => {
    setRegionalPriceAdjustments((prev) => ({
      ...prev,
      [region]: Math.max(3000, (prev[region] || 5800) + delta),
    }));
  };

  useEffect(() => {
    let isMounted = true;
    setSession(getStoredSession());

    const loadData = async () => {
      try {
        const result = await fetchDairyDashboardData();
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
    : "Malika";

  // Financial Chart Data based on timeRange
  const chartDatasets = useMemo(() => {
    switch (timeRange) {
      case "1d":
        return {
          points: [
            { label: "06:00", val: 32000 },
            { label: "09:00", val: 58000 },
            { label: "12:00", val: 94000 },
            { label: "15:00", val: 128000 },
            { label: "18:00", val: 165000 },
            { label: "21:00", val: 186400 },
          ],
          total: "186,400 Litr",
          delta: "+8.4% bugun",
        };
      case "1w":
        return {
          points: [
            { label: "Dush", val: 142000 },
            { label: "Sesh", val: 165000 },
            { label: "Chor", val: 154000 },
            { label: "Pay", val: 186400 },
            { label: "Jum", val: 172000 },
            { label: "Shan", val: 179000 },
            { label: "Yak", val: 184000 },
          ],
          total: "1,182,400 Litr",
          delta: "+12.1% bu hafta",
        };
      case "1m":
      default:
        return {
          points: [
            { label: "1 May", val: 130000 },
            { label: "5 May", val: 145000 },
            { label: "10 May", val: 162000 },
            { label: "15 May", val: 158000 },
            { label: "20 May", val: 175000 },
            { label: "25 May", val: 171000 },
            { label: "1 Iyun", val: 186400 },
          ],
          total: "48,500,000 UZS",
          delta: "+16.8% oylik hajm",
        };
      case "6m":
      case "1y":
      case "all":
        return {
          points: [
            { label: "Yan", val: 95000 },
            { label: "Fev", val: 115000 },
            { label: "Mar", val: 142000 },
            { label: "Apr", val: 168000 },
            { label: "May", val: 178000 },
            { label: "Iyun", val: 186400 },
          ],
          total: "284,500,000 UZS",
          delta: "+42.5% jami xarid",
        };
    }
  }, [timeRange]);

  // Navigation items matching Investure layout
  const navigationItems: Array<{
    key: DairyWindowKey;
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
      key: "orders",
      label: "Xarid Buyurtmalari",
      badge: "12",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: "shipments",
      label: "Kiruvchi Flot",
      badge: "Live",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
    {
      key: "escrow",
      label: "Eskrou & Depozit",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "pricing",
      label: "Iqtisodiyot & Narxlar",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      key: "analytics",
      label: "Zavod Tahlili",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "settings",
      label: "Zavod Profili & ISO",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setShowOrderModal(false);
    }, 1500);
  };

  const activeRate = regionalPriceAdjustments[procureRegion] || 5800;
  const totalProcureEscrow = procureLiters * activeRate;

  return (
    <div className={`min-h-screen py-4 px-3 sm:px-6 relative overflow-x-hidden font-sans antialiased transition-colors duration-300 ${
      isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f6fbf8] text-[#081c15]"
    }`}>
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] pointer-events-none -z-0 opacity-20 blur-[140px] bg-gradient-to-br from-teal-400 to-emerald-400" />

      {/* Master Container: Fixed Left Sidebar + Dynamic In-Place Content Area */}
      <div className={`relative z-10 max-w-[1520px] mx-auto rounded-[32px] border shadow-2xl flex flex-col lg:flex-row overflow-hidden transition-all ${
        isDark
          ? "bg-[#14181d] border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.6)] text-[#E8F1F2]"
          : "bg-white border-[#b7e4c7] shadow-[0_10px_35px_rgba(0,153,255,0.06)] text-[#081c15]"
      }`}>

        {/* =========================================================================
            LEFT NAVIGATION SIDEBAR (Investure / FlowBoard Architecture)
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
                          ? "text-teal-500"
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
                            ? "bg-teal-500 text-white"
                            : isDark ? "bg-white/10 text-white/60" : "bg-slate-200 text-slate-600"
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Right Indicator Line */}
                      {isActive && (
                        <span className="w-1.5 h-5 rounded-full bg-teal-500 absolute right-1.5 top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 3. Bottom Industrial Depository Card */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/10">
            <div className={`p-4 rounded-2xl border text-center relative overflow-hidden transition ${
              isDark ? "bg-white/[0.02] border-white/10" : "bg-gradient-to-br from-teal-50/60 to-emerald-50/60 border-teal-100"
            }`}>
              <div className="w-10 h-10 mx-auto rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-lg mb-2">
                🏭
              </div>
              <div className="font-bold text-xs mb-1">
                AgroBank Sanoat Eskrousi
              </div>
              <p className={`text-[11px] leading-relaxed mb-3 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                Depozit balansi: 48,500,000 UZS. Xaridlar uchun avtomatlashtirilgan kliring.
              </p>
              <button
                type="button"
                onClick={() => setActiveWindow("escrow")}
                className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
              >
                Eskrouni koʻrish
              </button>
            </div>

            {/* User Quick Pill */}
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-600 text-white font-black text-xs flex items-center justify-center">
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
                  <span className="w-2 h-2 rounded-full bg-teal-500 absolute bottom-0 right-0 border-2 border-white dark:border-[#0e1319]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight truncate max-w-[110px]">{firstName}</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">Zavod ID #4</span>
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
            RIGHT MAIN WINDOW (Dynamic In-Place View Switcher)
        ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0">

          {/* 1. TOP HEADER BAR */}
          <header className={`px-6 sm:px-8 py-5 border-b flex flex-wrap items-center justify-between gap-4 transition-colors ${
            isDark ? "border-white/10 bg-[#121820]" : "border-slate-100 bg-white"
          }`}>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {activeWindow === "overview" && "Dashboard"}
                {activeWindow === "orders" && "Sut Xaridi Buyurtmalari & Shartnomalar"}
                {activeWindow === "shipments" && "Kiruvchi Yuklar & IoT Telemetriya"}
                {activeWindow === "escrow" && "AgroBank Eskrou Depoziti & Tölovlar"}
                {activeWindow === "pricing" && "Mintaqaviy Xarid Narxlari Sozlamasi"}
                {activeWindow === "analytics" && "Zavod Ishlab Chiqarish Tahlili"}
                {activeWindow === "settings" && "Zavod Profili & Xalqaro Standartlar"}
              </h1>
              <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                {session?.organization?.legalName || "ZaminFlow Ekotizimi"} &bull; IoT Silo & Sovuq Zanjir Nazorati
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Universal Live Spotlight Search */}
              <UniversalSpotlightSearch
                role="dairy"
                onSelectAction={(item) => {
                  if (item.category === "batches") {
                    setActiveWindow("orders");
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
                        ? "bg-teal-600 text-white font-black shadow-xs"
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
                onClick={() => setShowOrderModal(true)}
                className="px-4 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <span>+</span>
                <span>Xarid Buyurtmasi</span>
              </button>
            </div>
          </header>

          {/* 2. DYNAMIC CONTENT SWITCHER */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto">

            {/* =========================================================================
                WINDOW 1: OVERVIEW (Financial Intake & Silo Command)
            ========================================================================= */}
            {activeWindow === "overview" && (
              <div className="space-y-6">

                {/* 1. HERO FINANCIAL INTAKE CHART (Interactive & Live) */}
                <div className={`rounded-3xl p-6 sm:p-7 border relative overflow-hidden transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <InteractiveFinancialChart
                    title="Kunlik & Oylik Qabul Qilingan Xomashyo Hajmi"
                    subtitle="XOM SUT RECEPTION VA LOGISTIKA QABULI"
                    totalDisplay={chartDatasets.total}
                    deltaDisplay={chartDatasets.delta}
                    deltaPositive={true}
                    unit="Litr"
                    accentColor="#14b8a6"
                    secondaryColor="#0099ff"
                    gradientId="dairyChartGradient"
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                    points={chartDatasets.points}
                    isDark={isDark}
                  />
                </div>

                {/* 2. FOUR FINANCIAL BENTO METRIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Secured Escrow */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:-translate-y-0.5 ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase font-bold ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        Secured Escrow Balance
                      </span>
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-xs">
                        🔒
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black font-mono">
                        {data?.escrowBalance.value || "48,500,000"} <span className="text-xs font-normal text-teal-500 font-bold">UZS</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-bold mt-1">
                        <span>AgroBank ATB Depoziti</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Received Today */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:-translate-y-0.5 ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase font-bold ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        Bugungi Qabul Hajmi
                      </span>
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                        🥛
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black font-mono">
                        {data?.receivedToday.value || "186,400"} <span className="text-xs font-normal text-slate-400">L</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold mt-1">
                        <span>{data?.receivedToday.delta || "+8.2% vs ötgan hafta"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Open Orders */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:-translate-y-0.5 ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase font-bold ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        Faol Xarid Shartnomalari
                      </span>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                        📄
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black font-mono">
                        {data?.openOrders.value || "12"} <span className="text-xs font-normal text-slate-400">partiya</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-1">
                        <span>Barchasi eskrouda bronlangan</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Silo Capacity */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:-translate-y-0.5 ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono uppercase font-bold ${isDark ? "text-white/50" : "text-slate-500"}`}>
                        Silo Rezervuari #1
                      </span>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                        ⚙️
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        74.5% <span className="text-xs font-normal text-slate-400 font-sans">(186k / 250k L)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mt-1">
                        <span>Sovutgich: 2.8°C (Locked)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. THREE-COLUMN BOTTOM BENTO */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                  {/* Col 1: Inbound Shipments list */}
                  <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between transition ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                        <h3 className="font-bold text-sm">Kiruvchi Yuklar & Sisternalar</h3>
                        <span className="text-xs font-mono text-teal-500 font-bold">Jonli GPS</span>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-white/5 mt-2 space-y-1">
                        {data?.incomingShipments && data.incomingShipments.length > 0 ? (
                          data.incomingShipments.map((shipment) => (
                            <div key={shipment.id} className="py-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-xs">
                                  🚛
                                </div>
                                <div>
                                  <div className="font-bold text-xs">{shipment.route}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{shipment.batch} &bull; {shipment.temp}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold font-mono text-xs">{shipment.etaOrStatus}</div>
                                <span className="text-[10px] font-bold text-teal-500">
                                  GPS {shipment.gpsLock ? "🔒 Locked" : "Signal"}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400">
                            <span className="text-2xl block mb-2">🚛</span>
                            Hozircha zavodga yoʻnaltirilgan faol yuklar yoʻq.
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveWindow("shipments")}
                      className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline text-center w-full block cursor-pointer"
                    >
                      Barcha yuklar radarini ochish →
                    </button>
                  </div>

                  {/* Col 2: Silo Tank Capacity (Interactive Radial Gauge) */}
                  <div className="lg:col-span-4 flex flex-col">
                    <InteractiveRadialGauge
                      title="Silo Siğimi & Xomaşyo"
                      totalLabel="228.4k L Jami"
                      isDark={isDark}
                      defaultActiveKey="silo1"
                      segments={[
                        { key: "silo1", label: "Silo #1", percentage: 74.5, color: "#14b8a6", sublabel: "Silo #1: 186.4k L", countFormatted: "186.4k L" },
                        { key: "silo2", label: "Silo #2", percentage: 42.0, color: "#0ea5e9", sublabel: "Silo #2: 42.0k L", countFormatted: "42.0k L" },
                        { key: "temp", label: "Harorat", percentage: 56.0, color: "#00ffc8", sublabel: "Harorat: 2.8°C", countFormatted: "2.8°C" },
                      ]}
                    />
                  </div>

                  {/* Col 3: Regional Pricing Matrix Stepper */}
                  <div className={`lg:col-span-3 p-6 rounded-3xl border flex flex-col justify-between transition ${
                    isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                        <h3 className="font-bold text-sm">Xarid Narxlari</h3>
                        <span className="text-xs font-mono text-slate-400">UZS / L</span>
                      </div>

                      <div className="space-y-2.5 mt-3">
                        {Object.entries(regionalPriceAdjustments).slice(0, 3).map(([reg, price]) => (
                          <div key={reg} className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold">{reg}</span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <button
                                type="button"
                                onClick={() => handlePriceStep(reg, -100)}
                                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs min-w-[55px] text-center text-teal-600 dark:text-teal-400">
                                {price}
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePriceStep(reg, 100)}
                                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveWindow("pricing")}
                      className="pt-3 border-t border-slate-100 dark:border-white/10 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline text-center w-full block cursor-pointer"
                    >
                      Toʻliq narxlar matritsasi →
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* =========================================================================
                WINDOW 2: ORDERS (In-place window)
            ========================================================================= */}
            {activeWindow === "orders" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <h3 className="text-lg font-bold">Xarid Buyurtmalari Reestri</h3>
                      <p className="text-xs text-slate-500">Fermerlar bilan tuzilgan va AgroBank depozitida kafolatlangan partiyalar</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOrderModal(true)}
                      className="px-4 py-2 rounded-full bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer"
                    >
                      + Yangi Buyurtma Joylash
                    </button>
                  </div>

                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 uppercase font-mono text-[10px] text-slate-400">
                          <th className="py-3 px-3">Buyurtma ID</th>
                          <th className="py-3 px-3">Fermer Kooperativi</th>
                          <th className="py-3 px-3">Hajm</th>
                          <th className="py-3 px-3">Stavka</th>
                          <th className="py-3 px-3">Eskrou Depoziti</th>
                          <th className="py-3 px-3">Holat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                        {[
                          { id: "ORD-941", farmer: "Oqdaryo Fayzli Dalalari", vol: "5,000 Litr", rate: "5,800 UZS/L", sum: "29,000,000 UZS", status: "Kafolatlangan (Eskrou)" },
                          { id: "ORD-940", farmer: "Zarafshon Agro Hamkor", vol: "3,200 Litr", rate: "5,800 UZS/L", sum: "18,560,000 UZS", status: "Yetkazilmoqda" },
                          { id: "ORD-939", farmer: "Pastdarğom Baraka", vol: "8,000 Litr", rate: "5,750 UZS/L", sum: "46,000,000 UZS", status: "Qabul Qilindi" },
                        ].map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                            <td className="py-3.5 px-3 font-bold">{o.id}</td>
                            <td className="py-3.5 px-3 font-sans font-bold">{o.farmer}</td>
                            <td className="py-3.5 px-3">{o.vol}</td>
                            <td className="py-3.5 px-3">{o.rate}</td>
                            <td className="py-3.5 px-3 font-bold text-teal-600 dark:text-teal-400">{o.sum}</td>
                            <td className="py-3.5 px-3">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                {o.status}
                              </span>
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
                WINDOW 3: SHIPMENTS (In-place window)
            ========================================================================= */}
            {activeWindow === "shipments" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <h3 className="text-lg font-bold pb-2">Sovuq Zanjir Logistika Floti & IoT Telemetriya</h3>
                  <p className="text-xs text-slate-500 mb-6">Zavod darvozasiga yetib kelayotgan barça izotermik sut taşuvçi sisternalar</p>

                  {data?.incomingShipments && data.incomingShipments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.incomingShipments.map((s) => (
                        <div key={s.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm">🚛 {s.route}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500 text-white">
                              {s.etaOrStatus}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs font-mono text-slate-500">
                            <span>Sisterna Harorati:</span>
                            <span className="font-bold text-teal-600 dark:text-teal-400">{s.temp}</span>
                          </div>
                          <div className="flex justify-between text-xs font-mono text-slate-500">
                            <span>Partiya Kodi:</span>
                            <span className="font-bold">{s.batch}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                      <span className="text-3xl block mb-2">🚚</span>
                      <p className="font-bold text-sm">Hozircha kiruvchi sut tashuvchi transportlar mavjud emas</p>
                      <p className="text-xs text-slate-400 mt-1">Fermerlar bilan yangi şartnoma tuzilganda yoki yangi partiya jönatilganda bu yerda körinadi</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 4: ESCROW (In-place window)
            ========================================================================= */}
            {activeWindow === "escrow" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <h3 className="text-lg font-bold pb-2">AgroBank ATB Sanoat Eskrousi</h3>
                  <p className="text-xs text-slate-500 mb-6">Qabul qilingan xomaşyo uçun avtomatlaştirilgan tölov kafolatlari</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Joriy Depozit Qoldiği</span>
                      <div className="text-2xl font-black font-mono text-teal-900 dark:text-teal-200 mt-1">48,500,000 UZS</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-500">Bugun Qabul Qilingan Partiyalar</span>
                      <div className="text-2xl font-black font-mono mt-1">18,420,000 UZS</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-500">Kliring Holati</span>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-2">ISO 20022 PACS.008 Faol</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 5: PRICING (In-place window)
            ========================================================================= */}
            {activeWindow === "pricing" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <h3 className="text-lg font-bold pb-2">Hududiy Bazaviy Xarid Narxlari Matritsasi</h3>
                  <p className="text-xs text-slate-500 mb-6">Fermerlar uçun ommaviy kotirovka narxlari (3.4% yoğlilik bazasida)</p>

                  <div className="space-y-3 max-w-xl">
                    {Object.entries(regionalPriceAdjustments).map(([reg, price]) => (
                      <div key={reg} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm">{reg} Viloyati</div>
                          <div className="text-xs text-slate-500">Standart 3.4% yoğlik uçun stavka</div>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <button
                            type="button"
                            onClick={() => handlePriceStep(reg, -100)}
                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 text-sm font-black hover:bg-slate-200 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-base font-black text-teal-600 dark:text-teal-400 min-w-[70px] text-center">
                            {price}
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePriceStep(reg, 100)}
                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 text-sm font-black hover:bg-slate-200 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 6: ANALYTICS (In-place window)
            ========================================================================= */}
            {activeWindow === "analytics" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition ${
                  isDark ? "bg-[#141b24] border-white/10" : "bg-white border-slate-200/80 shadow-xs"
                }`}>
                  <h3 className="text-lg font-bold pb-2">Zavod Işlab Çiqariş & Xomaşyo Oqimi</h3>
                  <p className="text-xs text-slate-500 mb-6">Oylik tahlil va taʻminotchilar ishonchlilik reytingi</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-500">Örtaça Yoğlilik Körsatkiçi</span>
                      <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">4.08% Fat</div>
                      <p className="text-[11px] text-slate-500 mt-2">Barça qabul qilingan partiyalarning örtaça ölçovi.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-500">Faol Fermer Hamkorlar</span>
                      <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">84 ta Ferma</div>
                      <p className="text-[11px] text-slate-500 mt-2">99.4% öz vaqtida yetkazib beriş darajasi.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 7: SETTINGS & ISO (Role-Adaptive B2B Profile Window)
            ========================================================================= */}
            {activeWindow === "settings" && (
              <B2BProfileWindow session={session} role="dairy" isDark={isDark} />
            )}

          </div>

        </main>

      </div>

      {/* =========================================================================
          NEW PROCUREMENT ORDER MODAL
      ========================================================================= */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl transition ${
            isDark ? "bg-[#141b24] border-white/20 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="font-bold text-base">Yangi Sut Xaridi Buyurtmasi</h3>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-teal-500 text-white flex items-center justify-center text-xl">
                  ✓
                </div>
                <div className="font-black text-lg">Buyurtma Muvaffaqiyatli Joylandi!</div>
                <p className="text-xs text-slate-500">AgroBank Eskrou depozitida {totalProcureEscrow.toLocaleString()} UZS bloklandi.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateOrder} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="font-bold block mb-1">Talab Qilinuvchi Hajm (Litr)</label>
                  <input
                    type="number"
                    min="1000"
                    max="50000"
                    step="500"
                    value={procureLiters}
                    onChange={(e) => setProcureLiters(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Hudud</label>
                  <select
                    value={procureRegion}
                    onChange={(e) => setProcureRegion(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent font-medium"
                  >
                    {Object.keys(regionalPriceAdjustments).map((reg) => (
                      <option key={reg} value={reg} className="dark:bg-[#141b24]">
                        {reg} ({regionalPriceAdjustments[reg].toLocaleString()} UZS/L)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-mono text-[11px] flex justify-between items-center">
                  <span>Eskrouda Talab Qilinuvchi Summa:</span>
                  <span className="font-black text-sm">{totalProcureEscrow.toLocaleString()} UZS</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  AgroBank Depozitida Bron Qilish →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
