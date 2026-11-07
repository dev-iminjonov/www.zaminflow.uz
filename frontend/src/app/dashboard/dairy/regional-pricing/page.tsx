"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getRegionalPrices, saveRegionalPrices, RegionalPriceConfig } from "@/lib/dairyStore";

export default function RegionalPricingPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<RegionalPriceConfig[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setPrices(getRegionalPrices());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const handlePriceChange = (index: number, newPrice: number) => {
    const updated = [...prices];
    updated[index].basePriceUZS = newPrice;
    setPrices(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveRegionalPrices(prices);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
            <Link href="/dashboard/dairy" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/dairy/orders" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
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
              Regional Supplier <span className="text-[#087a3c]">Pricing Configurator</span>
            </h1>
          </div>
          <Link
            href="/dashboard/dairy"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to Overview
          </Link>
        </header>

        {isSaved && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-900 text-sm font-semibold flex items-center justify-between">
            <span>✓ Regional spot rates updated successfully across platform market tickers!</span>
            <button onClick={() => setIsSaved(false)} className="text-xs underline font-bold">Dismiss</button>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#17352c] mb-2">
              Regional Farm-Gate Spot Rates (UZS / L)
            </h2>
            <p className="text-sm text-[#4d6a60] mb-6">
              Adjust base spot procurement rates by province. Higher spot rates incentivize smallholder farmers and cooperatives to allocate refrigerated tankers to your receiving facilities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {prices.map((p, idx) => (
                <div
                  key={p.region}
                  className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 flex flex-col justify-between gap-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-[#12303a]">{p.region}</span>
                    <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-0.5">
                      {p.liquidityDailyLiters.toLocaleString()} L/day
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Base Spot Rate (UZS / L)
                    </label>
                    <input
                      type="number"
                      step={10}
                      min={3500}
                      max={5500}
                      value={p.basePriceUZS}
                      onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-xl font-bold text-[#17352c] focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div className="text-xs text-[#4d6a60] space-y-1 border-t border-[#17352c]/10 pt-3">
                    <div>Grade A+ Rate: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#087a3c]">{(p.basePriceUZS + p.gradeAPlusBonusUZS).toLocaleString()} UZS</strong></div>
                    <div>Grade B Rate: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-red-700">{(p.basePriceUZS - p.gradeBDeductionUZS).toLocaleString()} UZS</strong></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex justify-end">
              <button
                type="submit"
                className="bg-[#12303a] text-white rounded-full px-8 min-h-[50px] font-bold text-base hover:bg-[#087a3c] transition shadow-md cursor-pointer"
              >
                Save & Broadcast Spot Rates →
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
