"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getFarmerBatches, MilkBatch } from "@/lib/farmerStore";

export default function MyMilkPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<MilkBatch[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setBatches(getFarmerBatches());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const filteredBatches = batches.filter((b) => {
    if (filter === "all") return true;
    if (filter === "stored") return b.status === "stored";
    if (filter === "transit") return b.status === "in_transit" || b.status === "testing";
    if (filter === "released") return b.status === "released";
    return true;
  });

  const totalInStorage = batches
    .filter((b) => b.status === "stored")
    .reduce((acc, curr) => acc + curr.volumeLiters, 0);

  const totalInTransit = batches
    .filter((b) => b.status === "in_transit" || b.status === "testing")
    .reduce((acc, curr) => acc + curr.volumeLiters, 0);

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
            <Link href="/dashboard/farmer/my-milk" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
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
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-1">
              Supply Management • Gap #1 Built
            </div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              My Milk Supply <span className="text-[#087a3c]">Inventory</span>
            </h1>
          </div>
          <Link
            href="/dashboard/farmer/list-supply"
            className="inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-7 min-h-[48px] font-bold text-base hover:bg-[#087a3c] transition shadow-sm cursor-pointer"
          >
            + List new milk supply
          </Link>
        </header>

        {/* Top KPI Telemetry Grid */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Current in Cold Storage
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {totalInStorage.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                L
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                3.4°C chilled
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              In Transit to Plants
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {totalInTransit.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                L
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                2 Tankers
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Bulk Tank Temperature
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                3.4°C
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                ✓ Optimal (2°–4°C)
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Average Farm-Gate Rate
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                4,380
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS / L
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                Grade A+
              </span>
            </div>
          </div>
        </section>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { id: "all", label: "All batches" },
            { id: "stored", label: "In Farm Storage" },
            { id: "transit", label: "In Transit / Testing" },
            { id: "released", label: "Settled & Released" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition cursor-pointer ${
                filter === tab.id
                  ? "bg-[#12303a] text-white"
                  : "bg-white/80 text-[#17352c] border border-white hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Batch Inventory Cards */}
        <section className="flex flex-col gap-4">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 flex flex-wrap items-center justify-between gap-6"
            >
              {/* Batch Info */}
              <div className="flex-[1_1_240px]">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#12303a]">
                    {batch.batchNumber}
                  </span>
                  <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-0.5">
                    Grade {batch.qualityGrade}
                  </span>
                  <span className="text-xs text-[#4d6a60]">
                    {batch.milkingDate} ({batch.milkingSession})
                  </span>
                </div>
                <div className="text-sm text-[#4d6a60]">
                  Target: <span className="font-semibold text-[#17352c]">{batch.destinationPlant}</span>
                </div>
                <div className="text-xs text-[#4d6a60] mt-0.5">
                  Collection window: {batch.pickupWindow}
                </div>
              </div>

              {/* Lab Parameters */}
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-xs text-[#4d6a60]">Volume</div>
                  <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-xl text-[#17352c]">
                    {batch.volumeLiters.toLocaleString()} L
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#4d6a60]">Fat / SNF</div>
                  <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-semibold text-sm text-[#17352c]">
                    {batch.fatPercent}% / {batch.snfPercent}%
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#4d6a60]">Estimated Payout</div>
                  <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#087a3c]">
                    {batch.totalEstimatedPayout.toLocaleString()} UZS
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#4d6a60]">Status</div>
                  <span
                    className={`text-xs font-bold rounded-lg px-2.5 py-1 inline-block mt-0.5 ${
                      batch.status === "in_transit"
                        ? "bg-[#d9f7e5] text-[#087a3c]"
                        : batch.status === "testing"
                        ? "bg-[#fdf0d2] text-[#7a4b00]"
                        : batch.status === "released"
                        ? "bg-[#e6ecea] text-[#33473f]"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {batch.status === "stored" && "● Chilling in Bulk Tank"}
                    {batch.status === "in_transit" && "● In Transit (GPS locked)"}
                    {batch.status === "testing" && "● Titration Testing"}
                    {batch.status === "released" && "✓ Escrow Released"}
                    {batch.status === "disputed" && "⚠ Disputed"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/farmer/batches/${batch.batchNumber}`}
                  className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#12303a] hover:text-white transition cursor-pointer"
                >
                  View Telemetry →
                </Link>
                {batch.status === "testing" && (
                  <Link
                    href={`/dashboard/farmer/dispute?batch=${batch.batchNumber}`}
                    className="bg-[#fdf0d2] text-[#7a4b00] border border-[#f59e0b]/40 rounded-full px-4 min-h-[44px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#fde68a] transition"
                  >
                    Dispute Lab Test
                  </Link>
                )}
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
