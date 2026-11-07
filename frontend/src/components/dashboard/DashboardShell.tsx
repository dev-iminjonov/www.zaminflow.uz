"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleKey, ROLES } from "@/lib/roles";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import { getDashboardDataForRole, DashboardKpiCard } from "@/lib/dashboardData";
import { authTranslations, Locale } from "@/messages/auth";

interface DashboardShellProps {
  role: RoleKey;
}

export default function DashboardShell({ role }: DashboardShellProps) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
  }, []);

  const roleConfig = ROLES[role];
  const dashboardData = getDashboardDataForRole(role);
  const t = authTranslations[locale];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  // Derive display values from session or fallbacks
  const displayName = session?.user?.fullName || "Partner";
  const orgName = session?.organization?.legalName || roleConfig.label;
  const isPendingVerification = session?.organization?.kybStatus !== "VERIFIED";

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] dark:bg-[linear-gradient(160deg,#13293D_0%,#006494_100%)] text-[#17352c] dark:text-[#E8F1F2] transition-colors duration-300">
      
      {/* 1. TOP HEADER / APP BAR */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-[#13293D]/80 border-b border-[#17352c]/10 dark:border-white/10 px-6 py-4">
        <div className="max-w-[1180px] mx-auto flex items-center justify-between">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <span className="font-extrabold text-2xl tracking-tight text-[#17352c] dark:text-white">
              zamin<span className="text-[#087a3c] dark:text-[#22d36b]">flow</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e6ecea] dark:bg-white/10 text-[#087a3c] dark:text-[#22d36b]">
              B2B Dairy
            </span>
          </Link>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Locale selector */}
            <div className="flex rounded-full p-0.5 border border-[#17352c]/15 dark:border-white/15 bg-white/60 dark:bg-black/20 text-xs font-semibold">
              {(["en", "ru", "uz"] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={`px-2.5 py-1 rounded-full uppercase transition cursor-pointer ${
                    locale === loc
                      ? "bg-[#12303a] text-white dark:bg-[#1B98E0] dark:text-[#13293D]"
                      : "text-[#4d6a60] dark:text-[#E8F1F2]/70 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* Role Chip */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#12303a] text-white dark:bg-[#1B98E0] dark:text-[#13293D]">
              <span className="w-2 h-2 rounded-full bg-[#22d36b]" />
              <span>{roleConfig.label}</span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-xs font-bold text-[#17352c] dark:text-white hover:text-red-600 dark:hover:text-red-400 px-3.5 py-1.5 rounded-full border border-[#17352c]/15 dark:border-white/15 hover:border-red-300 transition cursor-pointer"
            >
              {isSigningOut ? "..." : t.dashboard.signOut}
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN DASHBOARD CONTENT */}
      <main className="max-w-[1180px] mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Verification Pending Banner */}
        {isPendingVerification && (
          <div
            role="alert"
            className="rounded-2xl p-4 bg-[#fdf0d2] text-[#7a4b00] border border-[#f5d898] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <h2 className="text-sm font-bold tracking-tight">
                  {t.dashboard.verificationPending}
                </h2>
                <p className="text-xs opacity-90 mt-0.5">
                  {t.dashboard.verificationNotice}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#7a4b00]/10 shrink-0">
              KYB: Incomplete
            </span>
          </div>
        )}

        {/* Welcome Header Row */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] dark:text-[#22d36b] uppercase">
              {roleConfig.label} Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-[#17352c] dark:text-white">
              {t.dashboard.welcome}, <span className="text-[#087a3c] dark:text-[#22d36b]">{displayName}</span>
            </h1>
            <p className="text-sm text-[#4d6a60] dark:text-[#E8F1F2]/70 mt-1 font-medium">
              {orgName} &middot; {dashboardData.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/#stats"
              className="px-4 py-2 rounded-full text-xs font-bold bg-white/70 dark:bg-white/10 hover:bg-white text-[#17352c] dark:text-white border border-[#17352c]/10 dark:border-white/10 transition shadow-xs"
            >
              Live Trade Metrics &rarr;
            </Link>
          </div>
        </section>

        {/* KPI Glass Cards Grid */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">
            {t.dashboard.kpisTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dashboardData.kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="rounded-3xl p-6 transition-all duration-300 border border-white dark:border-white/10 bg-white/76 dark:bg-[#13293D]/75 backdrop-blur-md shadow-[0_10px_40px_rgba(20,80,60,0.08)] flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] dark:text-[#22d36b] uppercase">
                    {kpi.label}
                  </div>
                  <div className="flex items-baseline gap-2 my-3">
                    <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[#17352c] dark:text-white">
                      {kpi.value}
                    </span>
                    {kpi.unit && (
                      <span className="font-mono text-xs font-medium text-[#4d6a60] dark:text-[#E8F1F2]/60">
                        {kpi.unit}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#17352c]/5 dark:border-white/5">
                  {kpi.delta && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap ${
                        kpi.deltaType === "positive"
                          ? "bg-[#d9f7e5] text-[#087a3c]"
                          : kpi.deltaType === "warning"
                          ? "bg-[#fdf0d2] text-[#7a4b00]"
                          : "bg-[#e6ecea] text-[#33473f]"
                      }`}
                    >
                      {kpi.delta}
                    </span>
                  )}
                  {kpi.caption && (
                    <span className="text-[11px] text-[#4d6a60] dark:text-[#E8F1F2]/60 truncate">
                      {kpi.caption}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
