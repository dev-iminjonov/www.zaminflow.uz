"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import {
  DriverDashboardData,
  fetchDriverDashboardData,
} from "@/lib/roleDashboardService";
import { useLanguage } from "@/context/LanguageContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export default function DriverOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<DriverDashboardData | null>(null);
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
        const result = await fetchDriverDashboardData();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch driver metrics");
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
    : "Bobur";

  // Mock bar chart heights for weekly driver deliveries
  const barData = [
    { day: "Mon", height: "45%", val: "2 trips" },
    { day: "Tue", height: "70%", val: "3 trips" },
    { day: "Wed", height: "55%", val: "2 trips" },
    { day: "Thu", height: "95%", val: "4 trips", peak: true },
    { day: "Fri", height: "65%", val: "3 trips" },
    { day: "Sat", height: "80%", val: "3 trips" },
  ];

  return (
    <div className="min-h-screen bg-[#EAEFF0] dark:bg-[#0A1318] py-5 px-3 sm:px-6 transition-colors font-sans antialiased">
      {/* Quixotic / TeamHub Floating Master Canvas */}
      <div className="max-w-[1380px] mx-auto bg-white dark:bg-[#101E27] rounded-[36px] shadow-[0_20px_50px_rgba(15,40,30,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-white/5 p-4 sm:p-8 flex flex-col gap-6">

        {/* 1. TOP NAV BAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
          {/* Brand Logo */}
          <Link href="/dashboard/driver" className="flex items-center shrink-0">
            <ZaminFlowLogo size="md" />
          </Link>

          {/* Navigation Pill Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-semibold">
            <Link
              href="/dashboard/driver"
              className="px-4 py-1.5 rounded-full bg-[#087a3c] text-white shadow-xs font-bold transition"
            >
              {t.nav.overview}
            </Link>
            <Link
              href="/dashboard/driver/my-trips"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.myTrips}
            </Link>
            <Link
              href="/dashboard/driver/route"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.route}
            </Link>
            <Link
              href="/dashboard/driver/history"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.history}
            </Link>
            <Link
              href="/dashboard/driver/profile"
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
              <span className="text-slate-400">Search routes, waybills...</span>
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
              href="/dashboard/driver/profile"
              title="View Driver Logistics Profile"
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
                  Fleet Driver ↗
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.driver.welcome}, <span className="text-[#087a3c] dark:text-[#22d36b]">{firstName}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cold-Chain Tanker Fleet &bull; Real-time IoT Gateway & Automated Handover
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
              href="/dashboard/driver/start-trip"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#087a3c] hover:bg-[#065F46] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>+</span>
              <span>{t.driver.startNextTripBtn}</span>
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
                fetchDriverDashboardData()
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
              href="/dashboard/driver"
              className="w-10 h-10 rounded-full bg-[#087a3c] text-white flex items-center justify-center shadow-xs"
              title="Overview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/driver/my-trips"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="My Trips"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </Link>

            <Link
              href="/dashboard/driver/route"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="GPS Route"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/driver/confirm-pickup"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="QR Pickup"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/driver/report-issue"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Report Incident"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

            {/* ROW 1: ACTIVE TRIP CARD + DISPATCH BARS + COLD CHAIN STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
              
              {/* CARD 1: Quixotic Active Trip FinTech Card (cols 4) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="rounded-[28px] p-6 bg-gradient-to-br from-[#065F46] via-[#047857] to-[#022c22] text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  
                  {/* Top */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-mono tracking-wider uppercase text-emerald-200 font-bold">
                      ZaminFlow Cold Fleet
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      GPS LIVE
                    </span>
                  </div>

                  {/* Middle */}
                  <div className="my-auto relative z-10 pt-2">
                    <div className="text-[11px] text-emerald-100/80 uppercase font-semibold">
                      Current Waybill: {data?.activeTrip.batch || "ZF-0412"}
                    </div>
                    <div className="text-xl font-bold tracking-tight text-white mt-1">
                      {data?.activeTrip.route || "Sayxunobod → Toshkent"}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-emerald-300"
                          style={{ width: `${data?.activeTrip.progressPercentage || 65}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-100">
                        {data?.activeTrip.progressPercentage || 65}%
                      </span>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-100/90 pt-3 border-t border-white/10 relative z-10">
                    <span>ETA: {data?.activeTrip.eta || "28 min"}</span>
                    <span className="text-[10px] font-sans font-bold bg-white/20 text-white rounded-full px-2 py-0.5">
                      Cold Chain Locked
                    </span>
                  </div>
                </div>

                {/* Sub-card: Completed trips */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-[22px] p-4 border border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                      Trips Completed This Week
                    </span>
                    <div className="text-xl font-extrabold text-slate-800 dark:text-white font-mono mt-0.5">
                      {data?.completedThisWeek.value || "14"}{" "}
                      <span className="text-xs font-normal text-slate-500">runs</span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/driver/history"
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Logbook →
                  </Link>
                </div>
              </div>

              {/* CARD 2: Weekly Delivery Bars (cols 5) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Operations Schedule
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      Weekly Trips Completed
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
                          {bar.val}
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
                  <span>Today&apos;s Run: <strong className="text-slate-800 dark:text-white font-mono">{data?.todayTrips.value || "3"} Pickups</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">On Schedule</span>
                </div>
              </div>

              {/* CARD 3: Temperature Telemetry Gauge (cols 3) */}
              <div className="lg:col-span-3 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Cold Chain Tanker
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1">
                    Telemetry Lock
                  </h3>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-2">
                    {data?.coldChain.temp || "3.2°C"}
                  </div>
                  <span className="inline-block mt-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg px-2 py-0.5">
                    {data?.coldChain.status || "Optimal Cold Chain"}
                  </span>
                </div>

                {/* Spline curve */}
                <div className="py-2">
                  <svg className="w-full h-12 text-emerald-500 overflow-visible" viewBox="0 0 100 30" fill="none">
                    <path
                      d="M0 16 C30 14, 50 18, 70 15 C85 12, 95 16, 100 14"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/dashboard/driver/confirm-pickup"
                    className="text-center py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
                  >
                    Pickup ↑
                  </Link>
                  <Link
                    href="/dashboard/driver/report-issue"
                    className="text-center py-2 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold text-xs hover:bg-white dark:hover:bg-white/10 transition"
                  >
                    Report ↓
                  </Link>
                </div>
              </div>

            </div>

            {/* ROW 2: TODAY'S STOPS SCHEDULE + NEXT PICKUP DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* TABLE: Today's Stops (cols 7) */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Manifest Schedule
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Today&apos;s Collection Stops
                    </h3>
                  </div>
                  <Link
                    href="/dashboard/driver/route"
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    GPS Live Map →
                  </Link>
                </div>

                <div className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {data?.todayStops.map((stop) => (
                    <div
                      key={stop.id}
                      className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs transition hover:bg-white/60 dark:hover:bg-white/5 px-2 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs w-12 text-[#087a3c] dark:text-[#22d36b]">
                          {stop.time}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {stop.locationName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {stop.batchInfo}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          stop.statusType === "next"
                            ? "bg-[#087a3c] text-white shadow-xs"
                            : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {stop.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD: Next Pickup & Gate Handover (cols 5) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Immediate Action
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Upcoming Farm Collection
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {data?.nextPickup.time || "14:30"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 mt-4 space-y-2">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block">
                      Target Station
                    </span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {data?.nextPickup.location || "Sayxunobod Collection Point #2"}
                    </div>
                    <p className="text-xs text-slate-500">
                      Arrive at gate, scan Farmer QR code, and verify intake milk temperature before transferring to insulated compartment.
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Dispatched Vehicle
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      MAN TGS 26.440 &bull; Tanker 01-A 882 AA
                    </span>
                  </div>
                  <Link
                    href="/dashboard/driver/confirm-pickup"
                    className="px-3.5 py-1.5 rounded-full bg-[#087a3c] text-white font-bold text-xs hover:bg-[#065F46] transition"
                  >
                    Scan QR
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
