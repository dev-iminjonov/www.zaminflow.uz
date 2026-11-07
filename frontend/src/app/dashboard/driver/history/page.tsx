"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getDriverHistory, DriverHistoryRecord } from "@/lib/driverStore";

export default function DriverHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<DriverHistoryRecord[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setHistory(getDriverHistory());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const totalKm = history.reduce((acc, curr) => acc + curr.distanceKm, 0);
  const totalLiters = history.reduce((acc, curr) => acc + curr.volumeLiters, 0);
  const totalEarnings = history.reduce((acc, curr) => acc + curr.driverEarningsUZS, 0);

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/driver" className="text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/driver" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/driver/my-trips" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              My trips
            </Link>
            <Link href="/dashboard/driver/route" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Route
            </Link>
            <Link href="/dashboard/driver/history" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              History
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              Driver
            </span>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-[15px] hover:bg-[#12303a] hover:text-white transition cursor-pointer"
            >
              {isSigningOut ? "..." : "Sign out"}
            </button>
          </div>
        </nav>

        {/* Header Row */}
        <header className="flex flex-wrap items-end justify-between gap-5 pt-4">
          <div>
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-1">
              Mileage & Earnings Archive • Gap #15 Built
            </div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Driver Trip History & <span className="text-[#087a3c]">Earnings</span>
            </h1>
          </div>
          <Link
            href="/dashboard/driver"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to Overview
          </Link>
        </header>

        {/* Driver Summary Telemetry */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Distance Driven
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {totalKm.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                km
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Milk Volume Transported
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {totalLiters.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                L
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Compensation Earned
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#087a3c]">
                {totalEarnings.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                ✓ 100% On Time
              </span>
            </div>
          </div>
        </section>

        {/* History Table */}
        <section className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8">
          <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-1">
            Trip Archive
          </div>
          <h2 className="text-2xl font-bold text-[#17352c] mb-6">
            Completed Haulage Runs
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#17352c]/10 text-xs text-[#4d6a60] uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Batch #</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Cold-Chain SLA</th>
                  <th className="py-3 px-4 text-right">Compensation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17352c]/10">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-white/50 transition">
                    <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#4d6a60] text-xs">
                      {record.date}
                    </td>
                    <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#12303a]">
                      {record.batchNumber}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#17352c]">
                      {record.route}
                    </td>
                    <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#17352c]">
                      {record.distanceKm} km
                    </td>
                    <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#17352c]">
                      {record.volumeLiters.toLocaleString()} L
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2.5 py-1">
                        ✓ {record.avgTempC}°C (Optimal)
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-base text-[#087a3c]">
                      +{record.driverEarningsUZS.toLocaleString()} UZS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
