"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getBatchById, MilkBatch } from "@/lib/farmerStore";

export default function FarmerBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = (params?.id as string) || "ZF-0412";
  const [batch, setBatch] = useState<MilkBatch | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const found = getBatchById(batchId);
    if (found) setBatch(found);
    else {
      // Fallback batch for mock preview
      setBatch({
        id: batchId.toLowerCase(),
        batchNumber: batchId.toUpperCase(),
        volumeLiters: 1200,
        milkingDate: "Today, 06:30",
        milkingSession: "morning",
        storageTempC: 3.2,
        qualityGrade: "A+",
        fatPercent: 4.1,
        snfPercent: 8.7,
        acidityT: 16.5,
        pricePerLiter: 4380,
        totalEstimatedPayout: 5256000,
        status: "in_transit",
        destinationPlant: "Tashkent Central Dairy",
        pickupWindow: "08:00 - 09:30",
        driverName: "Bobur Rahimov",
        driverPhone: "+998 90 123 45 67",
        truckPlate: "01 772 AAA",
        tankerTempC: 3.2,
        eta: "28 min ETA",
        escrowStatus: "locked",
      });
    }
  }, [batchId]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  if (!batch) return null;

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/farmer" className="text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/farmer" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/farmer/my-milk" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              My milk
            </Link>
            <Link href="/dashboard/farmer/deliveries" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
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
              Batch <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#087a3c]">{batch.batchNumber}</span> Telemetry
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/farmer/deliveries"
              className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
            >
              ← Back to Deliveries
            </Link>
            <Link
              href={`/dashboard/farmer/dispute?batch=${batch.batchNumber}`}
              className="bg-[#fdf0d2] text-[#7a4b00] rounded-full px-4 min-h-[42px] font-bold text-xs inline-flex items-center justify-center hover:bg-[#fde68a] transition"
            >
              Contest Lab Results
            </Link>
          </div>
        </header>

        {/* Key Metrics Banner */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Current Tanker Temp
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-2">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {batch.tankerTempC || 3.2}°C
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-0.5">
                ✓ Sensor Locked
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Volume in Tanker
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-2">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {batch.volumeLiters.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                L
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Quality Grade
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-2">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                Grade {batch.qualityGrade}
              </span>
              <span className="text-xs text-[#4d6a60]">
                SNF {batch.snfPercent}%
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Escrow Value
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-2">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[28px] font-bold text-[#087a3c]">
                {batch.totalEstimatedPayout.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS
              </span>
            </div>
          </div>
        </section>

        {/* Split Section: Route Tracking & Live Cold Chain Graph */}
        <section className="flex flex-wrap gap-6">
          
          {/* Left: Route Telemetry Card */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1.4_1_480px] flex flex-col gap-5 box-border">
            <div>
              <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                Active Transit Telemetry
              </div>
              <h2 className="text-2xl font-bold text-[#17352c] mt-1">
                Sayxunobod Farm → {batch.destinationPlant}
              </h2>
            </div>

            {/* Simulated Live Route Map Box */}
            <div className="relative w-full h-56 rounded-2xl bg-[#e3efe9]/60 border border-[#17352c]/10 overflow-hidden flex flex-col justify-between p-5">
              <div className="flex justify-between items-center text-xs font-bold text-[#17352c]">
                <span className="bg-white/90 px-3 py-1 rounded-full shadow-sm">📍 Sayxunobod Collection Hub (KM 0)</span>
                <span className="bg-[#12303a] text-white px-3 py-1 rounded-full shadow-sm">🎯 Destination Plant (KM 142)</span>
              </div>

              {/* Highway Route Line */}
              <div className="relative w-full h-3 bg-white/80 rounded-full my-auto overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-[#12303a] rounded-full" style={{ width: "72%" }} />
                <div className="absolute top-0 left-[70%] -translate-y-1 w-5 h-5 rounded-full bg-[#22d36b] border-2 border-white shadow-md animate-pulse" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                  Speed: 64 km/h • GPS Accuracy 2.5m
                </span>
                <span className="font-bold text-[#087a3c] bg-[#d9f7e5] px-2.5 py-1 rounded-lg">
                  {batch.eta || "28 min ETA"}
                </span>
              </div>
            </div>

            {/* Driver & Tanker Details */}
            <div className="bg-white/80 rounded-2xl p-4 border border-[#17352c]/10 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div>
                <div className="text-xs text-[#4d6a60]">Certified Milk Hauler</div>
                <div className="font-bold text-[#17352c]">{batch.driverName || "Bobur Rahimov"}</div>
                <div className="text-xs font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#4d6a60]">{batch.driverPhone || "+998 90 123 45 67"}</div>
              </div>
              <div>
                <div className="text-xs text-[#4d6a60]">Vehicle Plate</div>
                <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#12303a]">{batch.truckPlate || "01 772 AAA"}</div>
              </div>
              <div>
                <div className="text-xs text-[#4d6a60]">IoT Probe ID</div>
                <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-semibold text-[#087a3c]">PROBE-UZ-881</div>
              </div>
            </div>
          </div>

          {/* Right: Lab Titration Certificate & Temperature History */}
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1_1_340px] flex flex-col gap-5 box-border">
            <div>
              <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                Laboratory Analysis
              </div>
              <h2 className="text-2xl font-bold text-[#17352c] mt-1">
                Quality Certificate
              </h2>
            </div>

            <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#4d6a60]">Butterfat Content:</span>
                <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                  {batch.fatPercent}% <span className="text-xs text-[#087a3c]">(Standard ≥ 3.6%)</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#4d6a60]">Solids-Not-Fat (SNF):</span>
                <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                  {batch.snfPercent}% <span className="text-xs text-[#087a3c]">(Standard ≥ 8.5%)</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#4d6a60]">Titratable Acidity:</span>
                <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                  {batch.acidityT}°T <span className="text-xs text-[#087a3c]">(Optimal 16–18°T)</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#4d6a60]">Milk Density:</span>
                <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                  1.028 g/cm³ <span className="text-xs text-[#087a3c]">✓ Pure</span>
                </span>
              </div>

              <div className="border-t border-[#17352c]/10 pt-3 flex justify-between items-center">
                <span className="font-bold text-[#12303a]">Verified Quality Grade:</span>
                <span className="text-xs font-extrabold bg-[#d9f7e5] text-[#087a3c] px-3 py-1 rounded-lg">
                  Grade {batch.qualityGrade} Verified
                </span>
              </div>
            </div>

            <div className="bg-[#e6ecea]/60 rounded-2xl p-4 text-xs text-[#4d6a60] space-y-1">
              <div className="font-bold text-[#17352c]">Agrobank Escrow Settlement Lock:</div>
              <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] truncate">TX: 0x7a89b...e214c • Secured in Central Clearing</div>
              <div>Auto-releases upon dairy reception gate titration signature.</div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
