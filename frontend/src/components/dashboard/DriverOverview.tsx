"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import {
  DriverDashboardData,
  fetchDriverDashboardData,
} from "@/lib/roleDashboardService";
import { dashboardTranslations, DashboardLocale } from "@/messages/dashboard";

export default function DriverOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<DriverDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [locale, setLocale] = useState<DashboardLocale>("en");
  const t = dashboardTranslations[locale];

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

    // 15-second polling interval while document is visible
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

  // Derive first name from session or fallback
  const firstName = session?.user?.fullName
    ? session.user.fullName.trim().split(" ").slice(-1)[0]
    : "Bobur";

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-14 flex flex-col gap-5 sm:gap-7">
        
        {/* Floating Pill Nav */}
        <nav className="bg-white rounded-[24px] sm:rounded-[40px] px-4 sm:px-8 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/driver" className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-7 text-xs sm:text-[15px] font-semibold overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <Link href="/dashboard/driver" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5 whitespace-nowrap">
              {t.nav.overview}
            </Link>
            <Link href="/dashboard/driver/my-trips" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5 whitespace-nowrap">
              {t.nav.myTrips}
            </Link>
            <Link href="/dashboard/driver/route" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5 whitespace-nowrap">
              {t.nav.route}
            </Link>
            <Link href="/dashboard/driver/history" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5 whitespace-nowrap">
              {t.nav.history}
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Locale Picker */}
            <div className="flex rounded-full p-0.5 border border-[#17352c]/10 bg-black/5 text-[11px] font-bold">
              {(["en", "ru", "uz"] as DashboardLocale[]).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={`px-2 py-0.5 rounded-full uppercase transition cursor-pointer ${
                    locale === loc
                      ? "bg-[#12303a] text-white"
                      : "text-[#4d6a60] hover:text-black"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              Driver
            </span>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-3.5 sm:px-5 min-h-[38px] sm:min-h-[44px] font-bold text-xs sm:text-[15px] hover:bg-[#12303a] hover:text-white transition cursor-pointer"
            >
              {isSigningOut ? "..." : t.nav.signOut}
            </button>
          </div>
        </nav>

        {/* Header Row */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 sm:pt-4">
          <div>
            <h1 className="m-0 text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              {t.driver.welcome}, <span className="text-[#087a3c]">{firstName}</span>
            </h1>
          </div>
          <Link
            href="/dashboard/driver/start-trip"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-7 min-h-[48px] font-bold text-base hover:bg-[#087a3c] transition shadow-sm cursor-pointer"
          >
            {t.driver.startNextTripBtn}
          </Link>
        </header>

        {/* Error Notification with Retry */}
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

        {/* KPI Grid (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {isLoading && !data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 min-h-[120px] animate-pulse"
              >
                <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-36 bg-gray-200 rounded" />
              </div>
            ))
          ) : (
            <>
              {/* Card 1: Today's trips */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Today&apos;s trips
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.todayTrips.value}
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                    {data?.todayTrips.unit}
                  </span>
                </div>
              </div>

              {/* Card 2: Next pickup */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Next pickup
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.nextPickup.time}
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                    {data?.nextPickup.location}
                  </span>
                </div>
              </div>

              {/* Card 3: Cold chain */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Cold chain
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.coldChain.temp}
                  </span>
                  <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
                    {data?.coldChain.status}
                  </span>
                </div>
              </div>

              {/* Card 4: Completed this week */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Completed this week
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.completedThisWeek.value}
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                    {data?.completedThisWeek.unit}
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Bottom Section: Route & Active Trip */}
        <section className="flex flex-col lg:flex-row gap-5">
          
          {/* Left Card: Today's stops */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-4 sm:p-6 w-full lg:flex-[1.5_1_520px] box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Route
            </div>
            <div className="text-[20px] sm:text-[22px] font-bold mt-1.5 mb-2.5 text-[#17352c]">
              Today&apos;s stops
            </div>

            {data?.todayStops.map((stop) => (
              <div
                key={stop.id}
                className="flex flex-wrap items-center gap-3 py-3.5 border-t border-[#17352c]/10 text-sm"
              >
                <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold w-14 text-[#17352c]">
                  {stop.time}
                </span>
                <div className="flex-[1_1_200px]">
                  <div className="font-bold text-[#17352c]">{stop.locationName}</div>
                  <div className="text-[13px] text-[#4d6a60]">{stop.batchInfo}</div>
                </div>
                <span
                  className={`text-xs font-bold rounded-lg px-2 py-1 whitespace-nowrap ${
                    stop.statusType === "next"
                      ? "bg-[#d9f7e5] text-[#087a3c]"
                      : "bg-[#e6ecea] text-[#33473f]"
                  }`}
                >
                  {stop.status}
                </span>
              </div>
            ))}
          </div>

          {/* Right Card: Active Trip */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-4 sm:p-6 w-full lg:flex-[1_1_340px] flex flex-col gap-3.5 box-border">
            <div>
              <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                Active trip
              </div>
              <div className="text-[22px] font-bold mt-1.5 mb-0 text-[#17352c]">
                {data?.activeTrip.batch}
              </div>
            </div>

            <div className="font-bold text-[#17352c]">
              {data?.activeTrip.route}
            </div>

            <div className="h-2.5 rounded-full bg-[#e3efe9] overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-[#12303a]"
                style={{ width: `${data?.activeTrip.progressPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-[13px] text-[#4d6a60]">
              <span>{data?.activeTrip.progressPercentage}% complete</span>
              <span>{data?.activeTrip.eta}</span>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-auto pt-4">
              <Link
                href="/dashboard/driver/confirm-pickup"
                className="flex-[1_1_150px] inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-5 min-h-[48px] font-bold text-[15px] hover:bg-[#087a3c] transition shadow-sm text-center"
              >
                Confirm pickup
              </Link>
              <Link
                href="/dashboard/driver/report-issue"
                className="flex-[1_1_150px] inline-flex items-center justify-center bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[48px] font-bold text-[15px] hover:bg-[#12303a] hover:text-white transition text-center"
              >
                Report issue
              </Link>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
