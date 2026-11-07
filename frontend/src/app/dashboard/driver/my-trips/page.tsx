"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getDriverStops, DriverTripStop } from "@/lib/driverStore";

export default function DriverTripsPage() {
  const router = useRouter();
  const [stops, setStops] = useState<DriverTripStop[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setStops(getDriverStops());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const totalLitresScheduled = stops
    .filter((s) => s.type === "pickup")
    .reduce((acc, curr) => acc + curr.volumeLiters, 0);

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
            <Link href="/dashboard/driver/my-trips" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              My trips
            </Link>
            <Link href="/dashboard/driver/route" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Route
            </Link>
            <Link href="/dashboard/driver/history" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
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
              Dispatch Manifest • Gap #13 Built
            </div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Today&apos;s Trip <span className="text-[#087a3c]">Manifest & Stops</span>
            </h1>
          </div>
          <Link
            href="/dashboard/driver/start-trip"
            className="inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-7 min-h-[48px] font-bold text-base hover:bg-[#087a3c] transition shadow-sm cursor-pointer"
          >
            Start next trip →
          </Link>
        </header>

        {/* Telemetry Summary Cards */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Scheduled Stops
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {stops.length}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                stops
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                2 Farm Pickups
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Total Volume to Haul
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {totalLitresScheduled.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                L
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                72% Tank Capacity
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Tanker IoT Temperature
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#087a3c]">
                3.2°C
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                ✓ In range (2°–4°C)
              </span>
            </div>
          </div>
        </section>

        {/* Manifest Stops Timeline */}
        <section className="flex flex-col gap-5">
          {stops.map((stop, index) => {
            const isNext = stop.status === "next";

            return (
              <div
                key={stop.id}
                className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-7 flex flex-wrap items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#12303a] text-white font-bold flex items-center justify-center font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#12303a]">
                        {stop.time}
                      </span>
                      <span
                        className={`text-xs font-bold rounded-lg px-2.5 py-0.5 ${
                          isNext ? "bg-[#d9f7e5] text-[#087a3c]" : "bg-[#e6ecea] text-[#33473f]"
                        }`}
                      >
                        {isNext ? "● Next Stop" : "Scheduled"}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-[#17352c]">{stop.locationName}</h3>
                    <div className="text-xs text-[#4d6a60]">{stop.address}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-xs text-[#4d6a60]">Batch Target</div>
                    <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-base text-[#12303a]">
                      {stop.batchNumber}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#4d6a60]">Volume</div>
                    <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-base text-[#087a3c]">
                      {stop.volumeLiters.toLocaleString()} L
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#4d6a60]">Station Contact</div>
                    <div className="text-xs font-semibold text-[#17352c]">{stop.contactName}</div>
                    <div className="text-xs font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#4d6a60]">{stop.contactPhone}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard/driver/route"
                      className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-xs inline-flex items-center justify-center hover:bg-[#12303a] hover:text-white transition"
                    >
                      Route Map →
                    </Link>
                    {isNext && (
                      <Link
                        href="/dashboard/driver/confirm-pickup"
                        className="bg-[#12303a] text-white rounded-full px-5 min-h-[44px] font-bold text-xs inline-flex items-center justify-center hover:bg-[#087a3c] transition shadow-md"
                      >
                        Confirm Pickup
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

      </div>
    </div>
  );
}
