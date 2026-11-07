"use client";

import React, { useState } from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function DriverRoutePage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const steps = [
    {
      instruction: "Head northeast on M39 Highway toward Sirdaryo / Tashkent",
      distance: "62 km",
      time: "48 min",
      active: true,
    },
    {
      instruction: "Take the exit ramp onto Tashkent Ring Road (TKAD)",
      distance: "14 km",
      time: "18 min",
      active: false,
    },
    {
      instruction: "Turn right onto Yangi Sergeli Street toward Tashkent Central Dairy Plant Gate #2",
      distance: "4.2 km",
      time: "10 min",
      active: false,
    },
    {
      instruction: "Arrive at Reception Bay #3 (Raw Milk Intake Metering)",
      distance: "0.2 km",
      time: "Destination",
      active: false,
    },
  ];

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/driver" className="flex items-center shrink-0">
            <ZaminFlowLogo mode="light" size="md" />
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/driver" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/driver/my-trips" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              My trips
            </Link>
            <Link href="/dashboard/driver/route" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
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
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Route Navigation & <span className="text-[#087a3c]">Waypoints</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://yandex.com/maps"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-6 min-h-[44px] font-bold text-xs hover:bg-[#087a3c] transition shadow-md"
            >
              Open in Yandex Navigator ↗
            </a>
          </div>
        </header>

        {/* Map & Live Route split */}
        <section className="flex flex-wrap gap-6">
          
          {/* Simulated Interactive Map Display */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1.6_1_520px] flex flex-col justify-between gap-6 box-border">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-[#087a3c] uppercase tracking-wider">
                  Active Dispatch: Sayxunobod → Tashkent
                </span>
                <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] px-3 py-1 rounded-full">
                  28 min ETA
                </span>
              </div>

              {/* Graphical Route Map Box */}
              <div className="relative w-full h-80 rounded-2xl bg-[#e3efe9]/80 border border-[#17352c]/15 overflow-hidden p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-bold">
                  <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-sm text-[#17352c]">
                    📍 Sayxunobod Farm (Picked up 1,200 L)
                  </div>
                  <div className="bg-[#12303a] text-white px-3 py-1.5 rounded-xl shadow-sm">
                    🎯 Tashkent Central Dairy
                  </div>
                </div>

                {/* Animated Waypoint Path */}
                <div className="relative w-full h-4 bg-white/90 rounded-full my-auto overflow-hidden">
                  <div className="h-full bg-[#12303a] rounded-full" style={{ width: "72%" }} />
                  <div className="absolute top-0 left-[70%] -translate-y-1 w-6 h-6 rounded-full bg-[#22d36b] border-2 border-white shadow-lg animate-pulse" />
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-[#17352c]">
                  <span>Speed: 64 km/h • Optimal Route M39</span>
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#087a3c]">
                    Cold Chain: 3.2°C Locked
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/80 p-4 rounded-2xl border border-[#17352c]/10">
                <div className="text-xs text-[#4d6a60]">Remaining Distance</div>
                <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-xl text-[#17352c] mt-1">
                  38 km
                </div>
              </div>
              <div className="bg-white/80 p-4 rounded-2xl border border-[#17352c]/10">
                <div className="text-xs text-[#4d6a60]">Estimated Arrival</div>
                <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-xl text-[#17352c] mt-1">
                  13:30
                </div>
              </div>
              <div className="bg-white/80 p-4 rounded-2xl border border-[#17352c]/10">
                <div className="text-xs text-[#4d6a60]">Cargo Volume</div>
                <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-xl text-[#087a3c] mt-1">
                  2,150 L
                </div>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Directions */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1_1_340px] flex flex-col justify-between gap-5 box-border">
            <div>
              <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-1">
                Navigation Instructions
              </div>
              <h3 className="text-xl font-bold text-[#17352c] mb-4">
                Upcoming Turns
              </h3>

              <div className="space-y-4">
                {steps.map((st, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border text-xs flex gap-3 ${
                      st.active
                        ? "bg-[#d9f7e5]/60 border-[#22d36b] text-[#17352c]"
                        : "bg-white/60 border-transparent text-[#4d6a60]"
                    }`}
                  >
                    <span className="font-bold text-base font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#12303a]">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm leading-snug">{st.instruction}</div>
                      <div className="text-[11px] font-[family-name:var(--font-jetbrains-mono,monospace)] mt-1 font-bold">
                        {st.distance} • {st.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#17352c]/10">
              <Link
                href="/dashboard/driver/report-issue"
                className="w-full bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full min-h-[44px] font-bold text-xs inline-flex items-center justify-center hover:bg-[#12303a] hover:text-white transition"
              >
                Report Route Issue / Delay
              </Link>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
