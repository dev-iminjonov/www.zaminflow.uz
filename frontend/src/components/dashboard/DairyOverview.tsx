"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import {
  DairyDashboardData,
  fetchDairyDashboardData,
} from "@/lib/roleDashboardService";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggleButton } from "@/context/ThemeContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { resolveUserAvatar } from "@/lib/userAvatar";

export default function DairyOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<DairyDashboardData | null>(null);
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
        const result = await fetchDairyDashboardData();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch dairy metrics");
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
    : "Malika";

  // Mock bar chart heights for weekly intake telemetry
  const barData = [
    { day: "Mon", height: "48%", val: "142k L" },
    { day: "Tue", height: "62%", val: "165k L" },
    { day: "Wed", height: "55%", val: "154k L" },
    { day: "Thu", height: "92%", val: "186.4k L", peak: true },
    { day: "Fri", height: "70%", val: "172k L" },
    { day: "Sat", height: "78%", val: "179k L" },
  ];

  return (
    <div className="min-h-screen bg-[#EAEFF0] dark:bg-[#0A1318] py-5 px-3 sm:px-6 transition-colors font-sans antialiased">
      {/* Quixotic / TeamHub Floating Master Canvas */}
      <div className="max-w-[1380px] mx-auto bg-white dark:bg-[#101E27] rounded-[36px] shadow-[0_20px_50px_rgba(15,40,30,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-white/5 p-4 sm:p-8 flex flex-col gap-6">

        {/* 1. TOP NAV BAR (Brand, Navigation Tabs, Search, Profile) */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
          {/* Brand Logo */}
          <Link href="/dashboard/dairy" className="flex items-center shrink-0">
            <ZaminFlowLogo size="md" />
          </Link>

          {/* Navigation Pill Tabs (Quixotic Center Navigation) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-semibold">
            <Link
              href="/dashboard/dairy"
              className="px-4 py-1.5 rounded-full bg-[#087a3c] text-white shadow-xs font-bold transition"
            >
              {t.nav.overview}
            </Link>
            <Link
              href="/dashboard/dairy/orders"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.orders}
            </Link>
            <Link
              href="/dashboard/dairy/shipments"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.shipments}
            </Link>
            <Link
              href="/dashboard/dairy/escrow"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.escrow}
            </Link>
            <Link
              href="/dashboard/dairy/regional-pricing"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              Economics
            </Link>
            <Link
              href="/dashboard/dairy/profile"
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
              <span className="text-slate-400">Search batches, trucks...</span>
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

            {/* Theme Mode Toggle */}
            <ThemeToggleButton size="sm" />

            {/* User Profile Pill */}
            <Link
              href="/dashboard/dairy/profile"
              title="View Partner Profile"
              className="flex items-center gap-2 pl-2 hover:opacity-85 transition group"
            >
              {(() => {
                const avatar = resolveUserAvatar(
                  session?.user?.fullName || firstName,
                  session?.user?.email
                );
                return (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:ring-2 ring-emerald-500/50">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={firstName}
                        className="w-full h-full object-cover object-[center_18%]"
                      />
                    ) : (
                      <span>{firstName.charAt(0)}</span>
                    )}
                  </div>
                );
              })()}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {firstName}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                  Dairy Partner ↗
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

        {/* 2. GREETING & DATE FILTER ROW (Quixotic Header) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-[#087a3c] dark:text-[#22d36b] uppercase mb-1">
              DAIRY INDUSTRY PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.dairy.welcome}, <span className="text-[#087a3c] dark:text-[#22d36b]">{firstName}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ZaminFlow Automated Cold-Chain
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
              href="/dashboard/dairy/place-order"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#087a3c] hover:bg-[#065F46] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>+</span>
              <span>{t.dairy.placeOrderBtn}</span>
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
                fetchDairyDashboardData()
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
          
          {/* Left Vertical Icon Dock (Quixotic Navigation Strip) */}
          <aside className="hidden xl:flex flex-col items-center gap-4 py-5 px-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shrink-0 select-none shadow-xs">
            <Link
              href="/dashboard/dairy"
              className="w-10 h-10 rounded-full bg-[#087a3c] text-white flex items-center justify-center shadow-xs"
              title="Overview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/dairy/orders"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Orders"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/dairy/shipments"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Cold-chain Fleet"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </Link>

            <Link
              href="/dashboard/dairy/escrow"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Escrow Ledger"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/dairy/regional-pricing"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Economics & Pricing"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

          {/* Grid of Quixotic / TeamHub Dashboard Cards */}
          <div className="flex-1 flex flex-col gap-6 w-full min-w-0">

            {/* ROW 1: FINTECH CARD + ENGAGEMENT/VOLUME BARS + PERFORMANCE AREA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
              
              {/* CARD 1: Quixotic FinTech Escrow Card (cols 4) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="rounded-[28px] p-6 bg-gradient-to-br from-[#065F46] via-[#047857] to-[#022c22] text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  {/* Subtle decorative circles */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  
                  {/* Top: Brand & Contactless Icon */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-mono tracking-wider uppercase text-emerald-200 font-bold">
                      ZaminFlow Escrow
                    </span>
                    {/* Contactless waves SVG */}
                    <svg className="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.393 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>

                  {/* Middle: Big Balance */}
                  <div className="my-auto relative z-10 pt-2">
                    <div className="text-[11px] text-emerald-100/80 uppercase font-semibold">
                      Secured Escrow Balance
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight font-mono text-white mt-1">
                      {data?.escrowBalance.value || "48,500,000"}{" "}
                      <span className="text-sm font-normal text-emerald-200">UZS</span>
                    </div>
                  </div>

                  {/* Bottom: Card Number & Clearing Status */}
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-100/90 pt-3 border-t border-white/10 relative z-10">
                    <span>•••• 8820</span>
                    <span className="text-[10px] font-sans font-bold bg-white/20 text-white rounded-full px-2 py-0.5">
                      CBU Regulated
                    </span>
                  </div>
                </div>

                {/* Sub-card: Open Orders Counter */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-[22px] p-4 border border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                      Open Orders In Pipeline
                    </span>
                    <div className="text-xl font-extrabold text-slate-800 dark:text-white font-mono mt-0.5">
                      {data?.openOrders.value || "12"}
                    </div>
                  </div>
                  <Link
                    href="/dashboard/dairy/orders"
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    View All →
                  </Link>
                </div>
              </div>

              {/* CARD 2: Quixotic Intake & Volume Bar Chart (cols 5) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      Telemetry & Supply
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      Daily Milk Volume (L)
                    </h3>
                  </div>

                  {/* Monthly / Weekly toggle */}
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

                {/* Bar Graph Visual */}
                <div className="h-40 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                  {barData.map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip on peak */}
                      {bar.peak && (
                        <span className="absolute -top-7 text-[10px] font-bold bg-[#087a3c] text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                          {data?.receivedToday.delta || "+3.8%"}
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

                {/* Sub-label */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-white/5">
                  <span>Processed Today: <strong className="text-slate-800 dark:text-white font-mono">{data?.receivedToday.value || "186,400"} L</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{data?.receivedToday.delta || "+3.8%"} vs yesterday</span>
                </div>
              </div>

              {/* CARD 3: Quixotic Active Cold Chain Card (cols 3) */}
              <div className="lg:col-span-3 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      Cold Chain Oversight
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1">
                    Active Shipments
                  </h3>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-2">
                    {data?.activeShipments.value || "47"}
                  </div>
                  <span className="inline-block mt-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg px-2 py-0.5">
                    {data?.activeShipments.coldStatus || "+3.2°C cold"}
                  </span>
                </div>

                {/* Smooth Wavy SVG line (Quixotic Spline) */}
                <div className="py-2">
                  <svg className="w-full h-12 text-emerald-500 overflow-visible" viewBox="0 0 100 30" fill="none">
                    <path
                      d="M0 25 C20 15, 30 28, 50 12 C70 -4, 80 18, 100 8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/dashboard/dairy/shipments"
                    className="text-center py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
                  >
                    Track Fleet ↑
                  </Link>
                  <Link
                    href="/dashboard/dairy/escrow"
                    className="text-center py-2 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold text-xs hover:bg-white dark:hover:bg-white/10 transition"
                  >
                    Escrow ↓
                  </Link>
                </div>
              </div>

            </div>

            {/* ROW 2: RECENT SHIPMENTS TABLE + REGIONAL PRICING BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* TABLE: Incoming Shipments (cols 7) */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Live Telemetry
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Incoming Route Deliveries
                    </h3>
                  </div>
                  <Link
                    href="/dashboard/dairy/shipments"
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Full Fleet View →
                  </Link>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {data?.incomingShipments.map((shipment) => (
                    <div
                      key={shipment.id}
                      className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs transition hover:bg-white/60 dark:hover:bg-white/5 px-2 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                          🥛
                        </div>
                        <div>
                          <Link
                            href="/dashboard/dairy/shipments"
                            className="font-bold text-slate-900 dark:text-white hover:text-emerald-700"
                          >
                            {shipment.route}
                          </Link>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {shipment.batch}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {shipment.temp}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {shipment.etaOrStatus}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            shipment.statusType === "warning"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : shipment.statusType === "neutral"
                              ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD: Regional Pricing & Partner Network (cols 5) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Supply Economics
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Regional Supplier Price (UZS/L)
                      </h3>
                    </div>
                    <Link
                      href="/dashboard/dairy/regional-pricing"
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Compare →
                    </Link>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-3.5 pt-4">
                    {data?.regionalPrices.map((item) => (
                      <div key={item.region} className="flex items-center gap-3">
                        <span className="w-24 text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                          {item.region}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-[#087a3c]"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="w-20 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mandatory Settlement & Liaison Avatars (Quixotic style) */}
                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Regional Field Liaisons
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      14 Certified Inspector Stations
                    </span>
                  </div>
                  <div className="flex items-center -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900">
                      A
                    </div>
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900">
                      S
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900">
                      M
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900">
                      +11
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
