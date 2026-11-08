"use client";

import React, { useState } from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useRouter } from "next/navigation";
import { signOut, authenticatedFetch } from "@/lib/auth";
import { addFarmerBatch } from "@/lib/farmerStore";

export default function ListSupplyPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Form State
  const [volumeLiters, setVolumeLiters] = useState<number>(1500);
  const [milkingSession, setMilkingSession] = useState<"morning" | "evening">("morning");
  const [milkingDate, setMilkingDate] = useState<string>("Today, 06:30");
  const [storageTempC, setStorageTempC] = useState<number>(3.3);
  const [fatPercent, setFatPercent] = useState<number>(4.1);
  const [snfPercent, setSnfPercent] = useState<number>(8.7);
  const [acidityT, setAcidityT] = useState<number>(16.5);
  const [destinationPlant, setDestinationPlant] = useState<string>("Tashkent Central Dairy");
  const [pickupWindow, setPickupWindow] = useState<string>("Tomorrow 07:00 - 08:30");
  const [priceFloor, setPriceFloor] = useState<number>(4380);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdBatchId, setCreatedBatchId] = useState<string>("");

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  // Compute grade and price
  const isGradeAPlus = fatPercent >= 4.0 && snfPercent >= 8.6 && acidityT <= 17;
  const isGradeA = !isGradeAPlus && fatPercent >= 3.6 && snfPercent >= 8.4 && acidityT <= 19;
  const qualityGrade: "A+" | "A" | "B" = isGradeAPlus ? "A+" : isGradeA ? "A" : "B";

  const effectivePrice = isGradeAPlus ? 4380 : isGradeA ? 4150 : 3800;
  const totalPayout = volumeLiters * effectivePrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authenticatedFetch("/farmer/supply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volume_liters: volumeLiters,
          cooling_temp_c: storageTempC,
          milking_session: milkingSession.toUpperCase(),
          fat_pct: fatPercent,
          snf_pct: snfPercent,
          acidity_turner: acidityT,
        }),
      });
    } catch {
      // Resilient fallback if offline
    }
    const created = addFarmerBatch({
      volumeLiters,
      milkingDate,
      milkingSession,
      storageTempC,
      qualityGrade,
      fatPercent,
      snfPercent,
      acidityT,
      pricePerLiter: effectivePrice,
      totalEstimatedPayout: totalPayout,
      status: "stored",
      destinationPlant,
      pickupWindow,
      escrowStatus: "locked",
    });
    setCreatedBatchId(created.batchNumber);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/farmer" className="flex items-center shrink-0">
            <ZaminFlowLogo mode="light" size="md" />
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/farmer" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/farmer/my-milk" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              My milk
            </Link>
            <Link href="/dashboard/farmer/deliveries" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Deliveries
            </Link>
            <Link href="/dashboard/farmer/payouts" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Payouts
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              Farmer
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
              List Milk Supply <span className="text-[#087a3c]">for Commercial Buyers</span>
            </h1>
          </div>
          <Link
            href="/dashboard/farmer/my-milk"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to My Milk
          </Link>
        </header>

        {isSubmitted ? (
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-8 sm:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#d9f7e5] text-[#087a3c] flex items-center justify-center text-3xl font-extrabold">
              ✓
            </div>
            <h2 className="text-3xl font-extrabold text-[#17352c]">
              Batch {createdBatchId} Successfully Listed!
            </h2>
            <p className="text-base text-[#4d6a60] max-w-md">
              Your raw milk batch has been published to commercial buyers. The designated refrigerated tanker will be routed for collection.
            </p>
            <div className="bg-white/90 rounded-2xl p-4 w-full border border-[#17352c]/10 text-left space-y-1 text-sm font-medium">
              <div>Volume: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">{volumeLiters.toLocaleString()} L</strong></div>
              <div>Quality Grade: <strong className="text-[#087a3c]">Grade {qualityGrade} ({fatPercent}% Fat, {snfPercent}% SNF)</strong></div>
              <div>Estimated Bank Escrow: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#12303a]">{totalPayout.toLocaleString()} UZS</strong></div>
              <div>Assigned Plant: <strong>{destinationPlant}</strong></div>
            </div>
            <div className="flex gap-4 pt-4">
              <Link
                href="/dashboard/farmer/my-milk"
                className="bg-[#12303a] text-white rounded-full px-6 min-h-[48px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#087a3c] transition shadow-md"
              >
                View in My Milk Inventory →
              </Link>
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-white text-[#12303a] border border-[#12303a] rounded-full px-5 min-h-[48px] font-bold text-sm hover:bg-gray-100 transition"
              >
                List Another Batch
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-7">
            
            {/* Left Column: Form Inputs */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1.6_1_520px] flex flex-col gap-6 box-border">
              
              {/* Section 1: Volume & Milking */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  1. Volume & Milking Session
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Volume (Litres)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={20000}
                      step={50}
                      value={volumeLiters}
                      onChange={(e) => setVolumeLiters(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Storage Bulk Temp (°C)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={1.0}
                      max={8.0}
                      value={storageTempC}
                      onChange={(e) => setStorageTempC(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Milking Session
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMilkingSession("morning")}
                        className={`flex-1 h-12 rounded-xl text-sm font-bold transition cursor-pointer ${
                          milkingSession === "morning"
                            ? "bg-[#12303a] text-white"
                            : "bg-white border border-[#17352c]/20 text-[#17352c]"
                        }`}
                      >
                        Morning (06:00)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMilkingSession("evening")}
                        className={`flex-1 h-12 rounded-xl text-sm font-bold transition cursor-pointer ${
                          milkingSession === "evening"
                            ? "bg-[#12303a] text-white"
                            : "bg-white border border-[#17352c]/20 text-[#17352c]"
                        }`}
                      >
                        Evening (17:30)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Milking Date
                    </label>
                    <input
                      type="text"
                      value={milkingDate}
                      onChange={(e) => setMilkingDate(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 text-sm font-semibold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Laboratory Estimates */}
              <div className="pt-4 border-t border-[#17352c]/10">
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  2. Milk Quality & Titration Test
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Fat Content (%)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={2.8}
                      max={5.5}
                      value={fatPercent}
                      onChange={(e) => setFatPercent(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      SNF (%)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={7.5}
                      max={9.5}
                      value={snfPercent}
                      onChange={(e) => setSnfPercent(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Acidity (°T)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={14}
                      max={24}
                      value={acidityT}
                      onChange={(e) => setAcidityT(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Buyer & Pickup Logistics */}
              <div className="pt-4 border-t border-[#17352c]/10">
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  3. Destination Facility & Pickup Window
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Commercial Buyer Plant
                    </label>
                    <select
                      value={destinationPlant}
                      onChange={(e) => setDestinationPlant(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 text-sm font-semibold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                    >
                      <option value="Tashkent Central Dairy">Tashkent Central Dairy (Tashkent Region)</option>
                      <option value="Samarqand Milk Products">Samarqand Milk Products (Samarqand)</option>
                      <option value="Fergana Valley Dairy">Fergana Valley Dairy (Fergana)</option>
                      <option value="Andijan Pure Dairy">Andijan Pure Dairy (Andijan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Farm Pickup Window
                    </label>
                    <input
                      type="text"
                      value={pickupWindow}
                      onChange={(e) => setPickupWindow(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 text-sm font-semibold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Instant Live Payout Calculation Summary */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1_1_340px] flex flex-col justify-between gap-6 box-border">
              <div>
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Payout Summary
                </div>
                <h3 className="text-2xl font-bold text-[#17352c] mt-1 mb-4">
                  Live Contract Valuation
                </h3>

                <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#4d6a60]">Quality Grade:</span>
                    <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2.5 py-1">
                      Grade {qualityGrade}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#4d6a60]">Base Spot Rate:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-semibold text-[#17352c]">
                      4,100 UZS / L
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#4d6a60]">Quality Bonus (Fat & SNF):</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#087a3c]">
                      +{effectivePrice - 4100} UZS / L
                    </span>
                  </div>

                  <div className="border-t border-[#17352c]/10 pt-2 flex justify-between items-center text-sm">
                    <span className="font-bold text-[#17352c]">Effective Payout Rate:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                      {effectivePrice.toLocaleString()} UZS / L
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-xs font-bold text-[#4d6a60] uppercase tracking-wider mb-1">
                    Total Estimated Bank Escrow Payout
                  </div>
                  <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-extrabold text-3xl sm:text-4xl text-[#087a3c]">
                    {totalPayout.toLocaleString()} <span className="text-base text-[#17352c]">UZS</span>
                  </div>
                  <p className="text-xs text-[#4d6a60] mt-2">
                    Locked in partner bank escrow upon tanker dispatch; released directly to IBAN upon gate titration confirmation.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#12303a] text-white rounded-full min-h-[52px] font-bold text-base hover:bg-[#087a3c] transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Publish Milk Supply Batch</span>
                <span>→</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
