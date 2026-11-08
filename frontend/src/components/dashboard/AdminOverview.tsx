"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import {
  AdminDashboardData,
  fetchAdminDashboardData,
} from "@/lib/roleDashboardService";
import { useLanguage } from "@/context/LanguageContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { resolveUserAvatar } from "@/lib/userAvatar";

export default function AdminOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<AdminDashboardData | null>(null);
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
        const result = await fetchAdminDashboardData();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch admin metrics");
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
    : "Admin";

  // Mock bar chart heights for weekly platform volume
  const barData = [
    { day: "Mon", height: "50%", val: "42 approvals" },
    { day: "Tue", height: "65%", val: "58 approvals" },
    { day: "Wed", height: "58%", val: "49 approvals" },
    { day: "Thu", height: "92%", val: "84 approvals", peak: true },
    { day: "Fri", height: "72%", val: "63 approvals" },
    { day: "Sat", height: "80%", val: "71 approvals" },
  ];

  return (
    <div className="min-h-screen bg-[#EAEFF0] dark:bg-[#0A1318] py-5 px-3 sm:px-6 transition-colors font-sans antialiased">
      {/* Quixotic / TeamHub Floating Master Canvas */}
      <div className="max-w-[1380px] mx-auto bg-white dark:bg-[#101E27] rounded-[36px] shadow-[0_20px_50px_rgba(15,40,30,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-white/5 p-4 sm:p-8 flex flex-col gap-6">

        {/* 1. TOP NAV BAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
          {/* Brand Logo */}
          <Link href="/dashboard/admin" className="flex items-center shrink-0">
            <ZaminFlowLogo size="md" />
          </Link>

          {/* Navigation Pill Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-semibold">
            <Link
              href="/dashboard/admin"
              className="px-4 py-1.5 rounded-full bg-[#087a3c] text-white shadow-xs font-bold transition"
            >
              {t.nav.overview}
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.users}
            </Link>
            <Link
              href="/dashboard/admin/verification"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.verification}
            </Link>
            <Link
              href="/dashboard/admin/disputes"
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              {t.nav.disputes}
            </Link>
            <Link
              href="/dashboard/admin/profile"
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
              <span className="text-slate-400">Search organizations, dossiers...</span>
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
              href="/dashboard/admin/profile"
              title="View Admin Operations Profile"
              className="flex items-center gap-2 pl-2 hover:opacity-85 transition group"
            >
              {(() => {
                const avatar = resolveUserAvatar(
                  session?.user?.fullName || "Iminjonov Muhammadaziz",
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
                  Super Admin ↗
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
              SYSTEM ADMINISTRATION &bull; TIZIM BOSHQARUVI
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.admin.welcome}, <span className="text-[#087a3c] dark:text-[#22d36b]">{firstName}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Platform Governance &bull; Tizim nazorati va audit
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
              href="/dashboard/admin/verification"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#087a3c] hover:bg-[#065F46] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>+</span>
              <span>{t.admin.reviewKybBtn}</span>
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
                fetchAdminDashboardData()
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
              href="/dashboard/admin"
              className="w-10 h-10 rounded-full bg-[#087a3c] text-white flex items-center justify-center shadow-xs"
              title="Overview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/admin/users"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Users Directory"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/admin/verification"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="KYB Compliance"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </Link>

            <Link
              href="/dashboard/admin/disputes"
              className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
              title="Disputes Arbitration"
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

            {/* ROW 1: PLATFORM TREASURY CARD + APPROVAL BARS + DISPUTES CARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
              
              {/* CARD 1: Platform Escrow Treasury Card (cols 4) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="rounded-[28px] p-6 bg-gradient-to-br from-[#065F46] via-[#047857] to-[#022c22] text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  
                  {/* Top */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-mono tracking-wider uppercase text-emerald-200 font-bold">
                      Central Treasury
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">
                      CBU AUDITED
                    </span>
                  </div>

                  {/* Middle */}
                  <div className="my-auto relative z-10 pt-2">
                    <div className="text-[11px] text-emerald-100/80 uppercase font-semibold">
                      Total Custody Escrow
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight font-mono text-white mt-1">
                      {data?.escrowTotal.value || "48,500,000"}{" "}
                      <span className="text-sm font-normal text-emerald-200">UZS</span>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-100/90 pt-3 border-t border-white/10 relative z-10">
                    <span>14 Region Clearing</span>
                    <span className="text-[10px] font-sans font-bold bg-white/20 text-white rounded-full px-2 py-0.5">
                      100% Reserve Backed
                    </span>
                  </div>
                </div>

                {/* Sub-card: Active users */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-[22px] p-4 border border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                      Total Enterprise Accounts
                    </span>
                    <div className="text-xl font-extrabold text-slate-800 dark:text-white font-mono mt-0.5">
                      {data?.activeUsers.value || "1,240"}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {data?.activeUsers.delta || "+12% this month"}
                  </span>
                </div>
              </div>

              {/* CARD 2: Weekly KYB Approvals Bar Chart (cols 5) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Compliance Velocity
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      KYB Review Throughput
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
                  <span>Pending Dossiers: <strong className="text-slate-800 dark:text-white font-mono">{data?.pendingVerification.value || "3"} entities</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">2.4 hr turnaround</span>
                </div>
              </div>

              {/* CARD 3: Arbitration & Risk Card (cols 3) */}
              <div className="lg:col-span-3 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Disputes Tribunal
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1">
                    Open Arbitration
                  </h3>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-2">
                    {data?.openDisputes.value || "2"}
                  </div>
                  <span className="inline-block mt-1 text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-lg px-2 py-0.5">
                    {data?.openDisputes.status || "Escrow Frozen · Active"}
                  </span>
                </div>

                {/* Spline curve */}
                <div className="py-2">
                  <svg className="w-full h-12 text-emerald-500 overflow-visible" viewBox="0 0 100 30" fill="none">
                    <path
                      d="M0 24 C20 18, 40 22, 60 10 C80 6, 90 14, 100 12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/dashboard/admin/verification"
                    className="text-center py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
                  >
                    KYB Queue ↑
                  </Link>
                  <Link
                    href="/dashboard/admin/disputes"
                    className="text-center py-2 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold text-xs hover:bg-white dark:hover:bg-white/10 transition"
                  >
                    Tribunal ↓
                  </Link>
                </div>
              </div>

            </div>

            {/* ROW 2: VERIFICATION QUEUE TABLE + USERS BY ROLE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* TABLE: Verification Queue (cols 7) */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Compliance Pipeline
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Pending KYB Dossiers
                    </h3>
                  </div>
                  <Link
                    href="/dashboard/admin/verification"
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Full Inspection Queue →
                  </Link>
                </div>

                <div className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {data?.verificationQueue.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs transition hover:bg-white/60 dark:hover:bg-white/5 px-2 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                          🏢
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.roleLabel}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.timeAgo}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-[#e6ecea] dark:bg-slate-800 text-[#33473f] dark:text-slate-300 rounded-lg px-2 py-0.5">
                          {item.roleChip}
                        </span>
                        <Link
                          href={`/dashboard/admin/verification/${encodeURIComponent(item.roleLabel.replace(/\s+·\s+/g, "-"))}`}
                          className="px-4 py-1.5 rounded-full bg-[#087a3c] hover:bg-[#065F46] text-white font-bold text-xs transition"
                        >
                          Review Dossier
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD: Users by Role (cols 5) */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-white/5 rounded-[28px] p-6 border border-slate-200/70 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Ecosystem Distribution
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Stakeholders by Role
                      </h3>
                    </div>
                    <Link
                      href="/dashboard/admin/users"
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Directory →
                    </Link>
                  </div>

                  <div className="space-y-3.5 pt-4">
                    {data?.usersByRole.map((item) => (
                      <div key={item.role} className="flex items-center gap-3">
                        <span className="w-28 text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                          {item.role}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-[#087a3c]"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="w-14 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Platform Security
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Argon2id &bull; HttpOnly Strict Cookies &bull; CSRF Double-Submit
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Active
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
