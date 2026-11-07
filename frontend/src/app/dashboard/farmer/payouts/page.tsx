"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getFarmerBatches, MilkBatch } from "@/lib/farmerStore";

export default function PayoutsPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<MilkBatch[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    setBatches(getFarmerBatches());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const handleExport = () => {
    setExportNotice("Reconciliation statement exported to Excel (ZaminFlow_Tax_Statement_Nov2026.xlsx)");
    setTimeout(() => setExportNotice(null), 4000);
  };

  const releasedBatches = batches.filter((b) => b.status === "released");
  const totalSettled = releasedBatches.reduce((acc, curr) => acc + curr.totalEstimatedPayout, 0);

  const lockedBatches = batches.filter((b) => b.status === "in_transit" || b.status === "testing");
  const totalLocked = lockedBatches.reduce((acc, curr) => acc + curr.totalEstimatedPayout, 0);

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
            <Link href="/dashboard/farmer/deliveries" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Deliveries
            </Link>
            <Link href="/dashboard/farmer/payouts" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
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
              Secured Escrow Ledger • Gap #3 Built
            </div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Bank Payouts & <span className="text-[#087a3c]">Escrow Ledger</span>
            </h1>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-6 min-h-[48px] font-bold text-sm hover:bg-[#12303a] hover:text-white transition shadow-sm cursor-pointer"
          >
            Export tax statement (XLSX)
          </button>
        </header>

        {exportNotice && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-900 text-sm font-semibold flex items-center justify-between">
            <span>{exportNotice}</span>
            <button onClick={() => setExportNotice(null)} className="text-xs underline font-bold">Dismiss</button>
          </div>
        )}

        {/* Financial KPI Cards */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Settled to Bank (This Month)
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {totalSettled.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                ✓ 100% Paid
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Locked in Escrow (Pending Lab)
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {totalLocked.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS
              </span>
              <span className="text-xs font-bold bg-[#fdf0d2] text-[#7a4b00] rounded-lg px-2 py-1">
                Auto-releases upon titration
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Linked Bank Account (IBAN)
            </div>
            <div className="mt-3">
              <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-base text-[#12303a]">
                UZ24 AGRO 0000 1234 5678 9012
              </div>
              <div className="text-xs text-[#4d6a60] mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22d36b]" />
                Agrobank Uzbekistan • Verified KYB
              </div>
            </div>
          </div>
        </section>

        {/* Itemized Payout Breakdown Table */}
        <section className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8">
          <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-1">
            Itemized Settlements
          </div>
          <h2 className="text-2xl font-bold text-[#17352c] mb-6">
            Detailed Milk Batch Calculations
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#17352c]/10 text-xs text-[#4d6a60] uppercase tracking-wider">
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Litres</th>
                  <th className="py-3 px-4">Base Rate</th>
                  <th className="py-3 px-4">Quality Premium</th>
                  <th className="py-3 px-4">Effective Rate</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17352c]/10">
                {batches.map((batch) => {
                  const baseRate = 4100;
                  const premium = batch.pricePerLiter - baseRate;
                  const isReleased = batch.status === "released";

                  return (
                    <tr key={batch.id} className="hover:bg-white/50 transition">
                      <td className="py-4 px-4">
                        <Link
                          href={`/dashboard/farmer/batches/${batch.batchNumber}`}
                          className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#12303a] hover:text-[#087a3c]"
                        >
                          {batch.batchNumber}
                        </Link>
                        <div className="text-xs text-[#4d6a60]">{batch.destinationPlant}</div>
                      </td>
                      <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] font-semibold text-[#17352c]">
                        {batch.volumeLiters.toLocaleString()} L
                      </td>
                      <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#4d6a60]">
                        {baseRate.toLocaleString()} UZS
                      </td>
                      <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#087a3c] font-semibold">
                        +{premium.toLocaleString()} UZS (Grade {batch.qualityGrade})
                      </td>
                      <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                        {batch.pricePerLiter.toLocaleString()} UZS/L
                      </td>
                      <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-base text-[#12303a]">
                        {batch.totalEstimatedPayout.toLocaleString()} UZS
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 whitespace-nowrap inline-block ${
                            isReleased
                              ? "bg-[#d9f7e5] text-[#087a3c]"
                              : "bg-[#fdf0d2] text-[#7a4b00]"
                          }`}
                        >
                          {isReleased ? "✓ Paid to IBAN" : "● Locked in Vault"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
