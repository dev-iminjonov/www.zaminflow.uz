"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function ConfirmPickupPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Form states
  const [meterLiters, setMeterLiters] = useState<number>(1200);
  const [milkTempC, setMilkTempC] = useState<number>(3.2);
  const [sealNumber, setSealNumber] = useState<string>("SEAL-UZ-99214");
  const [farmerOtp, setFarmerOtp] = useState<string>("8492");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmed(true);
    setTimeout(() => {
      router.push("/dashboard/driver");
    }, 2500);
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
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Confirm Milk Pickup: <span className="text-[#087a3c]">Sayxunobod Farm</span>
            </h1>
          </div>
          <Link
            href="/dashboard/driver"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to Overview
          </Link>
        </header>

        {isConfirmed ? (
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-8 sm:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#d9f7e5] text-[#087a3c] flex items-center justify-center text-3xl font-extrabold">
              ✓
            </div>
            <h2 className="text-3xl font-extrabold text-[#17352c]">
              Handover Confirmed & Batch In Transit!
            </h2>
            <p className="text-base text-[#4d6a60]">
              1,200 Litres transferred from Sayxunobod bulk tank into tanker. Farmer OTP verified and manifold seal registered. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-wrap gap-7">
            
            {/* Form Fields */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1.6_1_520px] flex flex-col gap-6 box-border">
              
              <div className="bg-white/80 rounded-2xl p-4 border border-[#17352c]/10 text-sm space-y-1">
                <div>Batch: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#12303a]">ZF-0412</strong></div>
                <div>Farm: <strong>Sayxunobod Dairy Cooperative</strong></div>
                <div>Manager: <strong>Muhammadaziz Iminjonov (+998 90 123 45 67)</strong></div>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  Flow Meter & Handover Readings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Pump Flow Meter (Litres)
                    </label>
                    <input
                      type="number"
                      value={meterLiters}
                      onChange={(e) => setMeterLiters(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-xl font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Milk Temp at Handover (°C)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      max={4.0}
                      value={milkTempC}
                      onChange={(e) => setMilkTempC(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-xl font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#17352c]/10">
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  Security Seal & Farmer OTP Verification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Anti-Tamper Seal Number
                    </label>
                    <input
                      type="text"
                      value={sealNumber}
                      onChange={(e) => setSealNumber(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-base font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Farmer 4-Digit Handover OTP
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={farmerOtp}
                      onChange={(e) => setFarmerOtp(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-xl tracking-widest text-center font-extrabold text-[#12303a] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Card: Confirmation CTA */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1_1_340px] flex flex-col justify-between gap-6 box-border">
              <div>
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Digital Bill of Lading
                </div>
                <h3 className="text-2xl font-bold text-[#17352c] mt-1 mb-4">
                  Transfer Custody
                </h3>

                <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 space-y-2 text-xs">
                  <div>Target Destination: <strong>Tashkent Central Dairy</strong></div>
                  <div>Loaded Litres: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-sm">{meterLiters.toLocaleString()} L</strong></div>
                  <div>Handover Chilled Temp: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-sm text-[#087a3c]">{milkTempC}°C</strong></div>
                  <div>Lock Status: <strong>GPS Telemetry Active</strong></div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#12303a] text-white rounded-full min-h-[52px] font-bold text-base hover:bg-[#087a3c] transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Confirm Handover & Resume Route →</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
