"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { addDairyOrder } from "@/lib/dairyStore";

export default function PlaceOrderPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Form inputs
  const [targetVolumeLiters, setTargetVolumeLiters] = useState<number>(30000);
  const [destinationPlant, setDestinationPlant] = useState<string>("Tashkent Central Dairy");
  const [requiredGrade, setRequiredGrade] = useState<"A+" | "A" | "B">("A+");
  const [maxPricePerLiter, setMaxPricePerLiter] = useState<number>(4380);
  const [deliveryDate, setDeliveryDate] = useState<string>("Tomorrow, 16:00");
  const [supplierCount, setSupplierCount] = useState<number>(6);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const totalEscrowRequired = targetVolumeLiters * maxPricePerLiter;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addDairyOrder({
      targetVolumeLiters,
      requiredGrade,
      destinationPlant,
      maxPricePerLiter,
      deliveryDate,
      status: "open",
      supplierCount,
      lockedEscrowUZS: totalEscrowRequired,
    });
    setCreatedOrderNumber(created.orderNumber);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/dairy" className="text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/dairy" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/dairy/orders" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              Orders
            </Link>
            <Link href="/dashboard/dairy/shipments" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Shipments
            </Link>
            <Link href="/dashboard/dairy/escrow" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Escrow
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              Dairy Industry
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
              Create Milk <span className="text-[#087a3c]">Procurement Order</span>
            </h1>
          </div>
          <Link
            href="/dashboard/dairy/orders"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to Orders
          </Link>
        </header>

        {isSubmitted ? (
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-8 sm:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#d9f7e5] text-[#087a3c] flex items-center justify-center text-3xl font-extrabold">
              ✓
            </div>
            <h2 className="text-3xl font-extrabold text-[#17352c]">
              Order {createdOrderNumber} Placed & Funded!
            </h2>
            <p className="text-base text-[#4d6a60] max-w-md">
              Your procurement order is now published to verified smallholder farmers and dairy cooperatives. The required escrow funds have been reserved.
            </p>
            <div className="bg-white/90 rounded-2xl p-4 w-full border border-[#17352c]/10 text-left space-y-1 text-sm font-medium">
              <div>Target Volume: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">{targetVolumeLiters.toLocaleString()} L</strong></div>
              <div>Required Grade: <strong className="text-[#087a3c]">Grade {requiredGrade}</strong></div>
              <div>Prefunded Escrow: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#12303a]">{totalEscrowRequired.toLocaleString()} UZS</strong></div>
              <div>Destination: <strong>{destinationPlant}</strong></div>
            </div>
            <div className="pt-4 flex gap-4">
              <Link
                href="/dashboard/dairy/orders"
                className="bg-[#12303a] text-white rounded-full px-6 min-h-[48px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#087a3c] transition shadow-md"
              >
                View in Active Orders Pipeline →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-7">
            
            {/* Left Column: Form Fields */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1.6_1_520px] flex flex-col gap-6 box-border">
              
              <div>
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  1. Order Target & Delivery Window
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Target Volume (Litres)
                    </label>
                    <input
                      type="number"
                      step={5000}
                      min={5000}
                      max={200000}
                      value={targetVolumeLiters}
                      onChange={(e) => setTargetVolumeLiters(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Required Delivery By
                    </label>
                    <input
                      type="text"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 text-sm font-semibold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#17352c]/10">
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  2. Quality Specifications & Price Ceiling
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Minimum Quality Standard
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRequiredGrade("A+")}
                        className={`flex-1 h-12 rounded-xl text-sm font-bold transition cursor-pointer ${
                          requiredGrade === "A+"
                            ? "bg-[#12303a] text-white"
                            : "bg-white border border-[#17352c]/20 text-[#17352c]"
                        }`}
                      >
                        Grade A+ (Premium)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRequiredGrade("A")}
                        className={`flex-1 h-12 rounded-xl text-sm font-bold transition cursor-pointer ${
                          requiredGrade === "A"
                            ? "bg-[#12303a] text-white"
                            : "bg-white border border-[#17352c]/20 text-[#17352c]"
                        }`}
                      >
                        Grade A (Standard)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Max Purchase Price (UZS / L)
                    </label>
                    <input
                      type="number"
                      step={10}
                      min={3800}
                      max={5500}
                      value={maxPricePerLiter}
                      onChange={(e) => setMaxPricePerLiter(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#17352c]/10">
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-4">
                  3. Facility Destination & Cooperative Allocation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Receiving Processing Plant
                    </label>
                    <select
                      value={destinationPlant}
                      onChange={(e) => setDestinationPlant(e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 text-sm font-semibold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                    >
                      <option value="Tashkent Central Dairy">Tashkent Central Dairy</option>
                      <option value="Samarqand Milk Products">Samarqand Milk Products</option>
                      <option value="Fergana Valley Dairy">Fergana Valley Dairy</option>
                      <option value="Andijan Pure Dairy">Andijan Pure Dairy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Target Smallholder Farm Coops
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={supplierCount}
                      onChange={(e) => setSupplierCount(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Escrow Prefunding Calculator */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1_1_340px] flex flex-col justify-between gap-6 box-border">
              <div>
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Escrow Calculation
                </div>
                <h3 className="text-2xl font-bold text-[#17352c] mt-1 mb-4">
                  Prefunded Vault Allocation
                </h3>

                <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#4d6a60]">Contract Volume:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                      {targetVolumeLiters.toLocaleString()} L
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#4d6a60]">Max Unit Rate:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                      {maxPricePerLiter.toLocaleString()} UZS / L
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#4d6a60]">Quality Standard:</span>
                    <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-0.5">
                      Grade {requiredGrade}
                    </span>
                  </div>

                  <div className="border-t border-[#17352c]/10 pt-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-[#17352c]">Escrow Required:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#087a3c]">
                      {totalEscrowRequired.toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-xs font-bold text-[#4d6a60] uppercase tracking-wider mb-1">
                    Total Bank Escrow Commitment
                  </div>
                  <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-extrabold text-3xl sm:text-4xl text-[#12303a]">
                    {totalEscrowRequired.toLocaleString()} <span className="text-base font-normal">UZS</span>
                  </div>
                  <p className="text-xs text-[#4d6a60] mt-2">
                    Secured through your Agrobank settlement account. Auto-disburses to smallholder farmers upon gate titration acceptance.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#12303a] text-white rounded-full min-h-[52px] font-bold text-base hover:bg-[#087a3c] transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Commit Escrow & Post Order</span>
                <span>→</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
