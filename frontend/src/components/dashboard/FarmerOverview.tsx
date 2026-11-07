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

export default function FarmerOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<FarmerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
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

  // Derive first name from session (e.g. "Muhammadaziz" from "Iminjonov Muhammadaziz")
  const firstName = session?.user?.fullName
    ? session.user.fullName.trim().split(" ").slice(-1)[0]
    : "Muhammadaziz";

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/farmer" className="text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/farmer" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              {t.nav.overview}
            </Link>
            <Link href="/dashboard/farmer/my-milk" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              {t.nav.myMilk}
            </Link>
            <Link href="/dashboard/farmer/deliveries" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              {t.nav.deliveries}
            </Link>
            <Link href="/dashboard/farmer/payouts" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              {t.nav.payouts}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {/* Locale Picker */}
            <div className="flex rounded-full p-0.5 border border-[#17352c]/10 bg-black/5 text-[11px] font-bold">
              {(["uz", "ru", "en"] as const).map((loc) => (
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
              Farmer
            </span>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-[15px] hover:bg-[#12303a] hover:text-white transition cursor-pointer"
            >
              {isSigningOut ? "..." : t.nav.signOut}
            </button>
          </div>
        </nav>

        {/* Header Row */}
        <header className="flex flex-wrap items-end justify-between gap-5 pt-4">
          <div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              {t.farmer.welcome}, <span className="text-[#087a3c]">{firstName}</span>
            </h1>
          </div>
          <Link
            href="/dashboard/farmer/list-supply"
            className="inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-7 min-h-[48px] font-bold text-base hover:bg-[#087a3c] transition shadow-sm cursor-pointer"
          >
            {t.farmer.listSupplyBtn}
          </Link>
        </header>

        {/* Error Notification with Retry */}
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

        {/* KPI Grid (4 Cards) */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
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
              {/* Card 1: Today's Price */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  {t.farmer.todayPrice}
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.todayPrice.value}
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                    {data?.todayPrice.unit}
                  </span>
                  <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
                    {data?.todayPrice.delta}
                  </span>
                </div>
              </div>

              {/* Card 2: Supplied this month */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  {t.farmer.suppliedThisMonth}
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.suppliedThisMonth.value}
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                    {data?.suppliedThisMonth.unit}
                  </span>
                </div>
              </div>

              {/* Card 3: Next payout */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  {t.farmer.nextPayout}
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.nextPayout.value}
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                    {data?.nextPayout.unit}
                  </span>
                </div>
              </div>

              {/* Card 4: Latest quality grade */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  {t.farmer.qualityGrade}
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.qualityGrade.grade}
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                    {data?.qualityGrade.snf}
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Bottom Section: Deliveries & Escrow */}
        <section className="flex flex-wrap gap-5">
          
          {/* Left Card: Recent deliveries */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 flex-[1.5_1_520px] box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Deliveries
            </div>
            <div className="text-[22px] font-bold mt-1.5 mb-2.5 text-[#17352c]">
              Recent deliveries
            </div>

            {data?.recentDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex flex-wrap items-center gap-3 py-3.5 border-t border-[#17352c]/10 text-sm"
              >
                <div className="flex-[1_1_160px]">
                  <Link
                    href={`/dashboard/farmer/batches/${delivery.batch.replace("Batch ", "")}`}
                    className="font-bold text-[#17352c] hover:text-[#087a3c] transition"
                  >
                    {delivery.destination}
                  </Link>
                  <div className="text-[13px] text-[#4d6a60]">{delivery.batch}</div>
                </div>
                <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-medium text-[#17352c]">
                  {delivery.volume}
                </span>
                <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                  {delivery.grade}
                </span>
                <span
                  className={`text-xs font-bold rounded-lg px-2 py-1 whitespace-nowrap ${
                    delivery.statusType === "warning"
                      ? "bg-[#fdf0d2] text-[#7a4b00]"
                      : delivery.statusType === "neutral"
                      ? "bg-[#e6ecea] text-[#33473f]"
                      : "bg-[#d9f7e5] text-[#087a3c]"
                  }`}
                >
                  {delivery.status}
                </span>
              </div>
            ))}
          </div>

          {/* Right Card: Escrow Payouts */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 flex-[1_1_340px] box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Escrow
            </div>
            <div className="text-[22px] font-bold mt-1.5 mb-2.5 text-[#17352c]">
              Payouts
            </div>

            {data?.payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between gap-3 py-3.5 border-t border-[#17352c]/10 text-sm"
              >
                <div className="flex-1">
                  <div className="font-bold text-[#17352c]">{payout.batch}</div>
                  <div className="text-[13px] text-[#4d6a60]">{payout.condition}</div>
                </div>
                <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                  {payout.amount}
                </span>
              </div>
            ))}
          </div>

        </section>

      </div>
    </div>
  );
}
