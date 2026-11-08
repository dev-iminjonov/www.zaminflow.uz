"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import {
  FarmerDashboardData,
  fetchFarmerDashboardData,
} from "@/lib/roleDashboardService";
import { useLanguage } from "@/context/LanguageContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export default function FarmerOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<FarmerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const { locale, setLocale, dashT: t } = useLanguage();

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const result = await fetchFarmerDashboardData();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch farmer metrics");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadData();
      }
    }, 15000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
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

  // Mock bar chart heights for weekly farmer supply
  const barData = [
    { day: "Mon", height: "45%", val: "480 L" },
    { day: "Tue", height: "60%", val: "540 L" },
    { day: "Wed", height: "55%", val: "510 L" },
    { day: "Thu", height: "92%", val: "720 L", peak: true },
    { day: "Fri", height: "68%", val: "590 L" },
    { day: "Sat", height: "75%", val: "630 L" },
  ];

  return (
    <div className="min-h-screen bg-[#EAEFF0] dark:bg-[#0A1318] py-5 px-3 sm:px-6 transition-colors font-sans antialiased">
      {/* Quixotic / TeamHub Floating Master Canvas */}
      <div className="max-w-[1380px] mx-auto bg-white dark:bg-[#101E27] rounded-[36px] shadow-[0_20px_50px_rgba(15,40,30,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-white/5 p-4 sm:p-8 flex flex-col gap-6">

        {/* 1. TOP NAV BAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
          {/* Brand Logo */}
          <Link href="/dashboard/farmer" className="flex items-center shrink-0">
            <ZaminFlowLogo size="md" />
          </Link>

          {/* Navigation Pill Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-semibold">
            <Link
              href="/dashboard/farmer"
              className="px-4 py-1.5 rounded-full bg-[#087a3c] text-white shadow-xs font-bold transition"
            >
              {t.nav.overview}
            </Link>
            <Link
              href="/dashboard/farmer/my-milk"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.myMilk}
            </Link>
            <Link
              href="/dashboard/farmer/deliveries"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.deliveries}
            </Link>
            <Link
              href="/dashboard/farmer/payouts"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.payouts}
            </Link>
            <Link
              href="/dashboard/farmer/dispute"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              Arbitration
            </Link>
            <Link
              href="/dashboard/farmer/profile"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              Profile
            </Link>
          </nav>

          {/* Right Section: Search, Language Switcher, User Menu */}
          <div className="flex items-center gap-3">
            {/* Search Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-slate-400">Search batches, lab tests...</span>
            </div>

            {/* Language Selector */}
            <div className="flex rounded-full p-0.5 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-bold">
              {(["uz", "ru", "en"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={`px-2 py-0.5 rounded-full uppercase transition cursor-pointer ${
                    locale === loc
                      ? "bg-[#12303a] text-white dark:bg-[#1B98E0] dark:text-[#13293D]"
                      : "text-slate-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* User Profile Pill */}
            <Link
              href="/dashboard/farmer/profile"
              title="View Farm Trading Profile"
              className="flex items-center gap-2 pl-2 hover:opacity-85 transition group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:ring-2 ring-emerald-500/50">
                {firstName.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {firstName}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                  Dairy Farmer ↗
                </span>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              title={t.nav.signOut}
              className="p-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* 2. GREETING ROW */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-[#087a3c] dark:text-[#22d36b] uppercase mb-1">
              FARMER PORTAL &bull; FERMER BOSHQARUVI
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.farmer.welcome}, <span className="text-[#087a3c] dark:text-[#22d36b]">{firstName}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ZaminFlow Smart Escrow &bull; Kafolatlangan sut taʼminoti
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Filter */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span>📅 Today, 7 Nov 2026</span>
              <span className="text-[10px] text-slate-400">⌄</span>
            </div>

            {/* Primary Action Button */}
            <Link
              href="/dashboard/farmer/list-supply"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#087a3c] hover:bg-[#065F46] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>+</span>
              <span>{t.farmer.listSupplyBtn}</span>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-sm text-red-800">
            <span>{error}</span>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchFarmerDashboardData()
                  .then(setData)
                  .catch((e) => setError(e.message))
                  .finally(() => setIsLoading(false));
              }}
              className="underline font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* 3. MAIN DASHBOARD CONTENT WITH LEFT FLOATING DOCK */}
        <div className="flex gap-6 items-start">
          
          {/* Left Vertical Icon Dock */}
          <aside className="hidden xl:flex flex-col items-center gap-4 py-5 px-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shrink-0 select-none shadow-xs">
            <Link
              href="/dashboard/farmer"
              className="w-10 h-10 rounded-full bg-[#087a3c] text-white flex items-center justify-center shadow-xs"
              title="Overview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/farmer/my-milk"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="My Milk"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </Link>

            <Link
              href="/dashboard/farmer/deliveries"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Deliveries"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </Link>

            <Link
              href="/dashboard/farmer/payouts"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Bank Payouts"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/farmer/dispute"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Disputes & Lab Titration"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </Link>

            <div className="w-6 h-px bg-slate-200 dark:bg-white/10 my-1" />

            <button
              onClick={handleSignOut}
              className="w-10 h-10 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition cursor-pointer"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </aside>

          {/* Main Grid Content */}
          <div className="flex-1 flex flex-col gap-6 w-full min-w-0">

            {/* ROW 1: FINTECH PAYOUT CARD + YIELD BARS + LAB GRADE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
              
              {/* CARD 1: Quixotic FinTech Next Payout Card (cols 4) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="rounded-[28px] p-6 bg-gradient-to-br from-[#065F46] via-[#047857] to-[#022c22] text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  
                  {/* Top */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-mono tracking-wider uppercase text-emerald-200 font-bold">
                      ZaminFlow Farmer Escrow
                    </span>
                    <svg className="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.393 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>

                  {/* Middle */}
                  <div className="my-auto relative z-10 pt-2">
                    <div className="text-[11px] text-emerald-100/80 uppercase font-semibold">
                      {t.farmer.nextPayout}
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight font-mono text-white mt-1">
                      {data?.nextPayout.value || "4,818,000"}{" "}
                      <span className="text-sm font-normal text-emerald-200">UZS</span>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-100/90 pt-3 border-t border-white/10 relative z-10">
                    <span>•••• 4818</span>
                    <span className="text-[10px] font-sans font-bold bg-white/20 text-white rounded-full px-2 py-0.5">
                      Guaranteed Clearing
                    </span>
                  </div>
                </div>

                {/* Sub-card: Supplied this month */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-[22px] p-4 border border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                      {t.farmer.suppliedThisMonth}
                    </span>
                    <div className="text-xl font-extrabold text-slate-800 dark:text-white font-mono mt-0.5">
                      {data?.suppliedThisMonth.value || "3,200"}{" "}
                      <span className="text-xs font-normal text-slate-500">L</span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/farmer/my-milk"
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Inventory →
                  </Link>
                </div>
              </div>

              {/* CARD 2: Daily Supply & Price Bar Chart (cols 5) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Production Telemetry
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      Daily Milk Yield (L)
                    </h3>
                  </div>

                  <div className="flex rounded-full p-0.5 bg-slate-200/60 dark:bg-white/10 text-[10px] font-bold">
                    <button
                      onClick={() => setTimeRange("7d")}
                      className={`px-2.5 py-1 rounded-full transition ${
                        timeRange === "7d" ? "bg-[#087a3c] text-white shadow-xs" : "text-slate-500"
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setTimeRange("30d")}
                      className={`px-2.5 py-1 rounded-full transition ${
                        timeRange === "30d" ? "bg-[#087a3c] text-white shadow-xs" : "text-slate-500"
                      }`}
                    >
                      30 Days
                    </button>
                  </div>
                </div>

                {/* Bars */}
                <div className="h-40 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                  {barData.map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {bar.peak && (
                        <span className="absolute -top-7 text-[10px] font-bold bg-[#087a3c] text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                          {data?.todayPrice.value} UZS/L
                        </span>
                      )}
                      <div className="w-full bg-slate-200/70 dark:bg-white/10 rounded-full h-32 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-full transition-all duration-500 ${
                            bar.peak
                              ? "bg-[#087a3c] shadow-md"
                              : "bg-emerald-400/80 dark:bg-emerald-500/60 group-hover:bg-emerald-500"
                          }`}
                          style={{ height: bar.height }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom stats */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-white/5">
                  <span>Today's Base Price: <strong className="text-slate-800 dark:text-white font-mono">{data?.todayPrice.value || "5,800"} UZS/L</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{data?.todayPrice.delta || "+200 UZS"}</span>
                </div>
              </div>

              {/* CARD 3: TeamHub Certified Lab Quality Ring (cols 3) */}
              <div className="lg:col-span-3 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Quality Titration
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1">
                    {data?.qualityGrade.grade || "Grade A"}
                  </h3>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-2">
                    {data?.qualityGrade.snf || "8.65% SNF"}
                  </div>
                  <span className="inline-block mt-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg px-2 py-0.5">
                    Fat 4.1% &bull; Certified Pure
                  </span>
                </div>

                {/* Circular Gauge / Smooth curve */}
                <div className="py-2">
                  <svg className="w-full h-12 text-emerald-500 overflow-visible" viewBox="0 0 100 30" fill="none">
                    <path
                      d="M0 20 C25 28, 45 4, 70 16 C85 24, 95 8, 100 12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/dashboard/farmer/deliveries"
                    className="text-center py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
                  >
                    Batches ↑
                  </Link>
                  <Link
                    href="/dashboard/farmer/dispute"
                    className="text-center py-2 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold text-xs hover:bg-white dark:hover:bg-white/10 transition"
                  >
                    Dispute ↓
                  </Link>
                </div>
              </div>

            </div>

            {/* ROW 2: RECENT DELIVERIES TABLE + ESCROW PAYOUTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* TABLE: Deliveries (cols 7) */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Dispatched Batches
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recent Deliveries & GPS Tracking
                    </h3>
                  </div>
                  <Link
                    href="/dashboard/farmer/deliveries"
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    All Deliveries →
                  </Link>
                </div>

                <div className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {data?.recentDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs transition hover:bg-white/60 dark:hover:bg-white/5 px-2 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                          🚛
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/farmer/batches/${delivery.batch.replace("Batch ", "")}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-emerald-700"
                          >
                            {delivery.destination}
                          </Link>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {delivery.batch}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {delivery.volume}
                        </span>
                        <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-0.5">
                          {delivery.grade}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            delivery.statusType === "warning"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : delivery.statusType === "neutral"
                              ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {delivery.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD: Escrow Settlements (cols 5) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Financial Settlements
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Bank Payouts & Escrow Releases
                      </h3>
                    </div>
                    <Link
                      href="/dashboard/farmer/payouts"
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      History →
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-200/50 dark:divide-white/5 pt-1">
                    {data?.payouts.map((payout) => (
                      <div key={payout.id} className="py-3.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {payout.batch}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {payout.condition}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-[#087a3c] dark:text-[#22d36b]">
                          {payout.amount} UZS
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Escrow Custody
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      AsakaBank / AgroBank Partner Portal
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Verified
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
