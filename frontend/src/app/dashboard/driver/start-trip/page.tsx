"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function StartTripPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Checkbox states
  const [sanitized, setSanitized] = useState(true);
  const [preChilled, setPreChilled] = useState(true);
  const [sensorCalibrated, setSensorCalibrated] = useState(true);
  const [sealsInspected, setSealsInspected] = useState(true);

  // Inputs
  const [odometerKm, setOdometerKm] = useState<number>(142850);
  const [initialTempC, setInitialTempC] = useState<number>(3.1);
  const [isActivated, setIsActivated] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const handleStartTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setIsActivated(true);
    setTimeout(() => {
      router.push("/dashboard/driver/route");
    }, 2000);
  };

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
              Safety Verification & Dispatch Activation • Gap #16 Built
            </div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Start Next Trip: <span className="text-[#087a3c]">Pre-Trip Inspection</span>
            </h1>
          </div>
          <Link
            href="/dashboard/driver"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Cancel
          </Link>
        </header>

        {isActivated ? (
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-8 sm:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#d9f7e5] text-[#087a3c] flex items-center justify-center text-3xl font-extrabold">
              🛰
            </div>
            <h2 className="text-3xl font-extrabold text-[#17352c]">
              Dispatch Activated & Telemetry Locked!
            </h2>
            <p className="text-base text-[#4d6a60]">
              GPS tracking and cold-chain temperature broadcasting are live. Redirecting to your turn-by-turn route...
            </p>
          </div>
        ) : (
          <form onSubmit={handleStartTrip} className="flex flex-wrap gap-7">
            
            {/* Checklist */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1.6_1_520px] flex flex-col gap-6 box-border">
              <div>
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  1. Mandatory Cold-Chain & Tanker Sanitization Checklist
                </h3>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/80 border border-[#17352c]/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sanitized}
                      onChange={(e) => setSanitized(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-[#087a3c]"
                      required
                    />
                    <div>
                      <div className="font-bold text-sm text-[#17352c]">
                        CIP Chemical Wash & Steam Sanitization Verified
                      </div>
                      <div className="text-xs text-[#4d6a60]">
                        Cleaned within the last 24 hours; certificate valid for Grade A raw milk haulage.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/80 border border-[#17352c]/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preChilled}
                      onChange={(e) => setPreChilled(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-[#087a3c]"
                      required
                    />
                    <div>
                      <div className="font-bold text-sm text-[#17352c]">
                        Internal Tank Pre-Chilled to ≤ 4.0°C
                      </div>
                      <div className="text-xs text-[#4d6a60]">
                        Refrigeration compressor operating at steady-state without thermal alarms.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/80 border border-[#17352c]/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sensorCalibrated}
                      onChange={(e) => setSensorCalibrated(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-[#087a3c]"
                      required
                    />
                    <div>
                      <div className="font-bold text-sm text-[#17352c]">
                        IoT Digital Probe Synced &amp; Battery &gt; 80%
                      </div>
                      <div className="text-xs text-[#4d6a60]">
                        Telemetry sensor paired with ZaminFlow platform Gateway.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/80 border border-[#17352c]/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sealsInspected}
                      onChange={(e) => setSealsInspected(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-[#087a3c]"
                      required
                    />
                    <div>
                      <div className="font-bold text-sm text-[#17352c]">
                        Manifold Valves & Anti-Tamper Seals Secure
                      </div>
                      <div className="text-xs text-[#4d6a60]">
                        Rubber gaskets intact; no leakages or residue at intake manifolds.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#17352c]/10">
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  2. Vehicle Starting Odometer & Temperature Reading
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Current Odometer (km)
                    </label>
                    <input
                      type="number"
                      value={odometerKm}
                      onChange={(e) => setOdometerKm(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Pre-Chilled Internal Temp (°C)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      max={4.0}
                      value={initialTempC}
                      onChange={(e) => setInitialTempC(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Dispatch Summary */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1_1_340px] flex flex-col justify-between gap-6 box-border">
              <div>
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Dispatch Route
                </div>
                <h3 className="text-2xl font-bold text-[#17352c] mt-1 mb-4">
                  Sayxunobod → Tashkent
                </h3>

                <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[#4d6a60]">Stops on Run:</span>
                    <span className="font-bold text-[#17352c]">3 Collection Points</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4d6a60]">Estimated Run Time:</span>
                    <span className="font-bold text-[#17352c]">4 hr 30 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4d6a60]">Total Batch Volume:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#087a3c]">
                      2,150 L
                    </span>
                  </div>
                  <div className="border-t border-[#17352c]/10 pt-2 flex justify-between items-center">
                    <span className="text-[#4d6a60]">Driver Payout:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#12303a]">
                      650,000 UZS
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#12303a] text-white rounded-full min-h-[52px] font-bold text-base hover:bg-[#087a3c] transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Activate Dispatch & Route →</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
