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

export default function AdminOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<AdminDashboardData | null>(null);
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
    : "Admin";

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/admin" className="flex items-center shrink-0">
            <ZaminFlowLogo mode="light" size="md" />
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/admin" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              {t.nav.overview}
            </Link>
            <Link href="/dashboard/admin/users" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              {t.nav.users}
            </Link>
            <Link href="/dashboard/admin/verification" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              {t.nav.verification}
            </Link>
            <Link href="/dashboard/admin/disputes" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              {t.nav.disputes}
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
              Admin
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
              {t.admin.welcome}, <span className="text-[#087a3c]">{firstName}</span>
            </h1>
          </div>
          <Link
            href="/dashboard/admin/verification"
            className="inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-7 min-h-[48px] font-bold text-base hover:bg-[#087a3c] transition shadow-sm cursor-pointer"
          >
            {t.admin.reviewKybBtn}
          </Link>
        </header>

        {/* Error Notification with Retry */}
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
              {/* Card 1: Pending verification */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Pending verification
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.pendingVerification.value}
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                    {data?.pendingVerification.unit}
                  </span>
                </div>
              </div>

              {/* Card 2: Active users */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Active users
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.activeUsers.value}
                  </span>
                  <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
                    {data?.activeUsers.delta}
                  </span>
                </div>
              </div>

              {/* Card 3: Open disputes */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Open disputes
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.openDisputes.value}
                  </span>
                  <span className="text-xs font-bold bg-[#fdf0d2] text-[#7a4b00] rounded-lg px-2 py-1 whitespace-nowrap">
                    {data?.openDisputes.status}
                  </span>
                </div>
              </div>

              {/* Card 4: Escrow total */}
              <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Escrow total
                </div>
                <div className="flex items-baseline flex-wrap gap-2 mt-3">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                    {data?.escrowTotal.value}
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                    {data?.escrowTotal.unit}
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Bottom Section: Verification Queue & Users by Role */}
        <section className="flex flex-wrap gap-5">
          
          {/* Left Card: Verification Queue */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 flex-[1.5_1_520px] box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Verification
            </div>
            <div className="text-[22px] font-bold mt-1.5 mb-2.5 text-[#17352c]">
              Verification queue
            </div>

            {data?.verificationQueue.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-3 py-3.5 border-t border-[#17352c]/10 text-sm"
              >
                <div className="flex-[1_1_200px]">
                  <div className="font-bold text-[#17352c]">{item.roleLabel}</div>
                  <div className="text-[13px] text-[#4d6a60]">{item.timeAgo}</div>
                </div>
                <span className="text-xs font-bold bg-[#e6ecea] text-[#33473f] rounded-lg px-2 py-1 whitespace-nowrap">
                  {item.roleChip}
                </span>
                <Link
                  href={`/dashboard/admin/verification/${encodeURIComponent(item.roleLabel.replace(/\s+·\s+/g, "-"))}`}
                  className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-[15px] inline-flex items-center justify-center hover:bg-[#12303a] hover:text-white transition cursor-pointer"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>

          {/* Right Card: Users by Role */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 flex-[1_1_340px] flex flex-col gap-4 box-border">
            <div>
              <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                Users
              </div>
              <div className="text-[22px] font-bold mt-1.5 mb-0 text-[#17352c]">
                Users by role
              </div>
            </div>

            {data?.usersByRole.map((item) => (
              <div key={item.role} className="flex items-center gap-3">
                <span className="w-[112px] text-sm font-semibold text-[#17352c]">
                  {item.role}
                </span>
                <div className="flex-1 h-2 rounded-lg bg-[#e3efe9] overflow-hidden">
                  <div
                    className="h-2 rounded-lg bg-[#12303a]"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-sm font-medium text-[#17352c]">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

        </section>

      </div>
    </div>
  );
}
