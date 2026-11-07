"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getFarmerBatches, fileBatchDispute, MilkBatch } from "@/lib/farmerStore";

function DisputeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBatch = searchParams.get("batch") || "ZF-0409";

  const [batches, setBatches] = useState<MilkBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>(initialBatch);
  const [disputeReason, setDisputeReason] = useState<string>("acidity_discrepancy");
  const [comments, setComments] = useState<string>("");
  const [evidenceName, setEvidenceName] = useState<string>("Farm_Bulk_Tank_Spectrometer_Report.pdf");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [caseNumber, setCaseNumber] = useState<string>("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setBatches(getFarmerBatches());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const currentBatch = batches.find((b) => b.batchNumber === selectedBatch) || batches[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fileBatchDispute(selectedBatch, `${disputeReason}: ${comments}`);
    setCaseNumber(`DSP-2026-${Math.floor(100 + Math.random() * 900)}`);
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
              Contest Lab <span className="text-[#087a3c]">Quality Titration</span>
            </h1>
          </div>
          <Link
            href="/dashboard/farmer/deliveries"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to Deliveries
          </Link>
        </header>

        {isSubmitted ? (
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-8 sm:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#fdf0d2] text-[#7a4b00] flex items-center justify-center text-3xl font-extrabold">
              ⚖
            </div>
            <h2 className="text-3xl font-extrabold text-[#17352c]">
              Dispute Case {caseNumber} Filed
            </h2>
            <p className="text-base text-[#4d6a60] max-w-md">
              Bank escrow payout for batch <strong>{selectedBatch}</strong> has been frozen. The dossier has been routed to the Platform Arbitration Tribunal for independent re-titration.
            </p>
            <div className="bg-white/90 rounded-2xl p-4 w-full border border-[#17352c]/10 text-left space-y-1 text-sm font-medium">
              <div>Batch Number: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">{selectedBatch}</strong></div>
              <div>Dispute Grounds: <strong className="text-[#b45309]">{disputeReason}</strong></div>
              <div>Escrow Status: <strong className="text-red-700">Frozen in Bank Vault (No deduction applied)</strong></div>
              <div>Review SLA: <strong>4 business hours</strong></div>
            </div>
            <div className="pt-4 flex gap-4">
              <Link
                href="/dashboard/farmer/deliveries"
                className="bg-[#12303a] text-white rounded-full px-6 min-h-[48px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#087a3c] transition shadow-md"
              >
                Return to Deliveries →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-7">
            
            {/* Left Column: Evidence & Grounds */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1.6_1_520px] flex flex-col gap-6 box-border">
              
              <div>
                <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                  Select Milk Batch Under Contest
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 text-sm font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.batchNumber}>
                      {b.batchNumber} — {b.destinationPlant} ({b.volumeLiters} L)
                    </option>
                  ))}
                </select>
              </div>

              {/* Side-by-Side Comparison: Farm vs Plant */}
              <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10">
                <h3 className="text-xs font-bold text-[#087a3c] uppercase tracking-wider mb-3">
                  Laboratory Test Variance Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                    <div className="text-xs font-bold text-green-900 mb-1">Farm Handover Reading</div>
                    <div className="space-y-1 text-xs">
                      <div>Fat: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-green-900">4.1%</strong></div>
                      <div>SNF: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-green-900">8.7%</strong></div>
                      <div>Acidity: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-green-900">16.5°T (Grade A+)</strong></div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <div className="text-xs font-bold text-amber-900 mb-1">Plant Receiving Lab Claim</div>
                    <div className="space-y-1 text-xs">
                      <div>Fat: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-amber-900">3.8% (-0.3%)</strong></div>
                      <div>SNF: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-amber-900">8.4% (-0.3%)</strong></div>
                      <div>Acidity: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-amber-900">19.5°T (Grade B Penalty)</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                  Primary Dispute Grounds
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 text-sm font-semibold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                >
                  <option value="acidity_discrepancy">Titratable Acidity (°T) Mismatch between Farm & Plant</option>
                  <option value="fat_content_variance">Butterfat Content Variance Exceeds Permitted 0.15% Margin</option>
                  <option value="temperature_breach_transit">Transit Cold-Chain Spike Attributable to Tanker Refrigeration</option>
                  <option value="meter_volume_shortfall">Gate Meter Flow Shortfall Exceeds Permitted Transfer Tolerance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                  Detailed Explanation & Lab Calibration Notes
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide calibration serial of farm ultrasonic milk analyzer, time of chilling, and request for third-party veterinary testing..."
                  className="w-full rounded-xl border border-[#17352c]/20 p-4 text-sm text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                  Supporting Laboratory Evidence (PDF / Scan)
                </label>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#17352c]/20">
                  <span className="text-xl">📄</span>
                  <span className="text-sm font-semibold text-[#17352c] flex-1 truncate">{evidenceName}</span>
                  <span className="text-xs text-[#087a3c] font-bold">Attached</span>
                </div>
              </div>

            </div>

            {/* Right Column: Escrow Freeze & Policy Box */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1_1_340px] flex flex-col justify-between gap-6 box-border">
              <div>
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Arbitration Safeguard
                </div>
                <h3 className="text-2xl font-bold text-[#17352c] mt-1 mb-4">
                  Escrow Protection Policy
                </h3>

                <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#087a3c]">
                    <span>🔒</span>
                    <span>100% Escrow Freeze Active</span>
                  </div>
                  <p className="text-xs text-[#4d6a60] leading-relaxed">
                    Under ZaminFlow Rule GAP-24, filing a dispute instantly freezes the contract escrow funds in partner bank custody. The dairy cannot apply punitive deductions while the case is in arbitration.
                  </p>
                  <div className="border-t border-[#17352c]/10 pt-3 text-xs space-y-1">
                    <div>Contested Batch: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">{selectedBatch}</strong></div>
                    <div>Protected Capital: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#12303a]">{currentBatch?.totalEstimatedPayout.toLocaleString()} UZS</strong></div>
                    <div>Arbitration Authority: <strong>Uzbekistan State Veterinary Committee</strong></div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#b45309] text-white rounded-full min-h-[52px] font-bold text-base hover:bg-[#92400e] transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Freeze Escrow & Submit Dispute</span>
                <span>⚖</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

export default function DisputePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold">Loading dispute center...</div>}>
      <DisputeContent />
    </Suspense>
  );
}
