"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getFarmerBatches, MilkBatch } from "@/lib/farmerStore";

export default function DeliveriesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<MilkBatch[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string>("all");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setBatches(getFarmerBatches());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const deliveryBatches = batches.filter((b) => {
    const isDelivery = b.status !== "stored";
    if (!isDelivery) return false;
    if (selectedPlant === "all") return true;
    return b.destinationPlant.toLowerCase().includes(selectedPlant.toLowerCase());
  });

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
              Deliveries & <span className="text-[#087a3c]">Transit Tracking</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#4d6a60]">Plant Filter:</span>
            {["all", "Tashkent", "Samarqand", "Fergana"].map((plant) => (
              <button
                key={plant}
                onClick={() => setSelectedPlant(plant)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedPlant === plant
                    ? "bg-[#12303a] text-white"
                    : "bg-white text-[#17352c] border border-white hover:bg-white"
                }`}
              >
                {plant === "all" ? "All Plants" : plant}
              </button>
            ))}
          </div>
        </header>

        {/* Deliveries List */}
        <section className="flex flex-col gap-5">
          {deliveryBatches.map((delivery) => {
            const isReleased = delivery.status === "released";
            const isTesting = delivery.status === "testing";
            const isTransit = delivery.status === "in_transit";

            return (
              <div
                key={delivery.id}
                className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-7 flex flex-col gap-6"
              >
                {/* Header of Card */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#17352c]/10">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-xl font-bold text-[#12303a]">
                        {delivery.batchNumber}
                      </span>
                      <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2.5 py-0.5">
                        Grade {delivery.qualityGrade}
                      </span>
                      <span className="text-xs text-[#4d6a60]">
                        Milked {delivery.milkingDate}
                      </span>
                    </div>
                    <div className="text-base font-semibold text-[#17352c]">
                      Destination: {delivery.destinationPlant}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-[#4d6a60]">Volume</div>
                      <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#17352c]">
                        {delivery.volumeLiters.toLocaleString()} L
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#4d6a60]">Cold Chain</div>
                      <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#087a3c]">
                        {delivery.tankerTempC || 3.2}°C
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#4d6a60]">Escrow Amount</div>
                      <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#12303a]">
                        {delivery.totalEstimatedPayout.toLocaleString()} UZS
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Step Milestone Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    
                    {/* Step 1: Dispatched */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-[#12303a] text-white font-bold flex items-center justify-center text-xs">
                        ✓
                      </div>
                      <span className="font-bold text-[#12303a]">Dispatched</span>
                      <span className="text-[11px] text-[#4d6a60] font-[family-name:var(--font-jetbrains-mono,monospace)]">07:30</span>
                    </div>

                    {/* Step 2: Farm Pickup */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-[#12303a] text-white font-bold flex items-center justify-center text-xs">
                        ✓
                      </div>
                      <span className="font-bold text-[#12303a]">Farm Handover</span>
                      <span className="text-[11px] text-[#4d6a60] font-[family-name:var(--font-jetbrains-mono,monospace)]">08:15</span>
                    </div>

                    {/* Step 3: In Transit */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
                          isTransit
                            ? "bg-[#22d36b] text-[#12303a] animate-pulse ring-4 ring-[#22d36b]/30"
                            : "bg-[#12303a] text-white"
                        }`}
                      >
                        {isTransit ? "●" : "✓"}
                      </div>
                      <span className="font-bold text-[#12303a]">GPS Cold Transit</span>
                      <span className="text-[11px] text-[#4d6a60] font-[family-name:var(--font-jetbrains-mono,monospace)]">3.2°C Locked</span>
                    </div>

                    {/* Step 4: Gate Lab Titration */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
                          isTesting
                            ? "bg-[#f59e0b] text-white animate-pulse ring-4 ring-[#f59e0b]/30"
                            : isReleased
                            ? "bg-[#12303a] text-white"
                            : "bg-[#e3efe9] text-[#4d6a60]"
                        }`}
                      >
                        {isTesting ? "●" : isReleased ? "✓" : "4"}
                      </div>
                      <span className={`font-bold ${isTesting ? "text-[#b45309]" : "text-[#12303a]"}`}>
                        Lab Titration
                      </span>
                      <span className="text-[11px] text-[#4d6a60]">
                        {isTesting ? "Testing Fat/SNF" : isReleased ? "Grade A+ Pass" : "Pending Arrival"}
                      </span>
                    </div>

                    {/* Step 5: Escrow Released */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
                          isReleased
                            ? "bg-[#087a3c] text-white ring-4 ring-[#22d36b]/30"
                            : "bg-[#e3efe9] text-[#4d6a60]"
                        }`}
                      >
                        {isReleased ? "✓" : "5"}
                      </div>
                      <span className={`font-bold ${isReleased ? "text-[#087a3c]" : "text-[#4d6a60]"}`}>
                        Bank Payout
                      </span>
                      <span className="text-[11px] text-[#4d6a60]">
                        {isReleased ? "Direct IBAN Sent" : "Auto-Release"}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Footer with Driver details and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#17352c]/10 text-sm">
                  <div className="flex items-center gap-4 text-xs text-[#4d6a60]">
                    <span>Driver: <strong className="text-[#17352c]">{delivery.driverName || "Assigned Driver"}</strong></span>
                    <span>Plate: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#17352c]">{delivery.truckPlate || "01 772 AAA"}</strong></span>
                    <span>Phone: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#17352c]">{delivery.driverPhone || "+998 90 123 45 67"}</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/farmer/batches/${delivery.batchNumber}`}
                      className="bg-[#12303a] text-white rounded-full px-5 min-h-[40px] font-bold text-xs inline-flex items-center justify-center hover:bg-[#087a3c] transition shadow-sm"
                    >
                      Live Route & IoT Telemetry →
                    </Link>
                    {isTesting && (
                      <Link
                        href={`/dashboard/farmer/dispute?batch=${delivery.batchNumber}`}
                        className="bg-[#fdf0d2] text-[#7a4b00] rounded-full px-4 min-h-[40px] font-bold text-xs inline-flex items-center justify-center hover:bg-[#fde68a] transition"
                      >
                        Contest Grade
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
