"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getDairyShipments, submitGateLabTest, DairyShipment } from "@/lib/dairyStore";

function ReceiveBatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBatch = searchParams.get("batch") || "ZF-0409";

  const [shipments, setShipments] = useState<DairyShipment[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>(initialBatch);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Lab Inputs
  const [meterLiters, setMeterLiters] = useState<number>(950);
  const [intakeTempC, setIntakeTempC] = useState<number>(3.6);
  const [fatPercent, setFatPercent] = useState<number>(4.1);
  const [snfPercent, setSnfPercent] = useState<number>(8.7);
  const [acidityT, setAcidityT] = useState<number>(16.5);
  const [density, setDensity] = useState<number>(1.028);
  const [alcoholTest, setAlcoholTest] = useState<string>("pass");

  const [isApproved, setIsApproved] = useState(false);
  const [txReference, setTxReference] = useState("");

  useEffect(() => {
    setShipments(getDairyShipments());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const activeShipment = shipments.find((s) => s.batchNumber === selectedBatch) || shipments[1] || shipments[0];

  // Grade calculation
  const isGradeAPlus = fatPercent >= 4.0 && snfPercent >= 8.6 && acidityT <= 17;
  const isGradeA = !isGradeAPlus && fatPercent >= 3.6 && snfPercent >= 8.4 && acidityT <= 19;
  const grade: "A+" | "A" | "B" = isGradeAPlus ? "A+" : isGradeA ? "A" : "B";
  const ratePerLiter = isGradeAPlus ? 4380 : isGradeA ? 4150 : 3800;
  const totalSettlement = meterLiters * ratePerLiter;

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    submitGateLabTest(selectedBatch, { fatPercent, snfPercent, acidityT });
    setTxReference(`AGRO-SETTLE-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsApproved(true);
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
            <Link href="/dashboard/dairy/orders" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Orders
            </Link>
            <Link href="/dashboard/dairy/shipments" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
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
              Gate Receiving & <span className="text-[#087a3c]">Titration Analysis</span>
            </h1>
          </div>
          <Link
            href="/dashboard/dairy/shipments"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to Shipments Fleet
          </Link>
        </header>

        {isApproved ? (
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-8 sm:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#d9f7e5] text-[#087a3c] flex items-center justify-center text-3xl font-extrabold">
              ✓
            </div>
            <h2 className="text-3xl font-extrabold text-[#17352c]">
              Batch {selectedBatch} Accepted & Escrow Disbursed!
            </h2>
            <p className="text-base text-[#4d6a60] max-w-md">
              Laboratory test passed at <strong>Grade {grade}</strong>. Escrow payout of <strong>{totalSettlement.toLocaleString()} UZS</strong> has been automatically disbursed directly to the farmer cooperative IBAN.
            </p>
            <div className="bg-white/90 rounded-2xl p-4 w-full border border-[#17352c]/10 text-left space-y-1 text-sm font-medium">
              <div>Settlement Reference: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">{txReference}</strong></div>
              <div>Certified Grade: <strong className="text-[#087a3c]">Grade {grade} ({fatPercent}% Fat, {snfPercent}% SNF)</strong></div>
              <div>Net Paid to Farmer: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#087a3c]">{totalSettlement.toLocaleString()} UZS</strong></div>
              <div>Intake Tank: <strong>Silo #4 (Raw Milk Refrigerated Storage)</strong></div>
            </div>
            <div className="pt-4 flex gap-4">
              <Link
                href="/dashboard/dairy/shipments"
                className="bg-[#12303a] text-white rounded-full px-6 min-h-[48px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#087a3c] transition shadow-md"
              >
                Return to Fleet Logistics →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApprove} className="flex flex-wrap gap-7">
            
            {/* Left Column: Intake Verification & Lab Spectrometer inputs */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1.6_1_520px] flex flex-col gap-6 box-border">
              
              <div>
                <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                  Arrived Tanker Batch
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 text-sm font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                >
                  {shipments.map((s) => (
                    <option key={s.id} value={s.batchNumber}>
                      {s.batchNumber} — {s.route} ({s.volumeLiters} L)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanker Gate Meter Reading */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-3">
                  1. Gate Intake & Sensor Verification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Intake Flow Meter (L)
                    </label>
                    <input
                      type="number"
                      value={meterLiters}
                      onChange={(e) => setMeterLiters(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Intake Manifold Temp (°C)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      value={intakeTempC}
                      onChange={(e) => setIntakeTempC(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Lab Titration & Spectrometer */}
              <div className="pt-4 border-t border-[#17352c]/10">
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-3">
                  2. Gate Laboratory Spectrometer Results
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Fat Content (%)
                    </label>
                    <input
                      type="number"
                      step={0.1}
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
                      value={acidityT}
                      onChange={(e) => setAcidityT(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-lg font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Density (g/cm³)
                    </label>
                    <input
                      type="number"
                      step={0.001}
                      value={density}
                      onChange={(e) => setDensity(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-base font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Alcohol Precipitation Test (72% Ethanol)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAlcoholTest("pass")}
                        className={`flex-1 h-12 rounded-xl text-xs font-bold transition ${
                          alcoholTest === "pass"
                            ? "bg-[#087a3c] text-white"
                            : "bg-white border border-[#17352c]/20 text-[#17352c]"
                        }`}
                      >
                        ✓ Negative (Pass)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlcoholTest("fail")}
                        className={`flex-1 h-12 rounded-xl text-xs font-bold transition ${
                          alcoholTest === "fail"
                            ? "bg-red-700 text-white"
                            : "bg-white border border-[#17352c]/20 text-[#17352c]"
                        }`}
                      >
                        ✗ Coagulated (Fail)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Calculated Grade & Escrow Disbursement CTA */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1_1_340px] flex flex-col justify-between gap-6 box-border">
              <div>
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  Quality Audit Pass
                </div>
                <h3 className="text-2xl font-bold text-[#17352c] mt-1 mb-4">
                  Automated Grade Index
                </h3>

                <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[#4d6a60]">Calculated Grade:</span>
                    <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-3 py-1">
                      Grade {grade}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4d6a60]">Effective Rate:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                      {ratePerLiter.toLocaleString()} UZS / L
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4d6a60]">Accepted Litres:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                      {meterLiters.toLocaleString()} L
                    </span>
                  </div>

                  <div className="border-t border-[#17352c]/10 pt-3 flex justify-between items-center">
                    <span className="font-bold text-[#12303a]">Escrow Payout:</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-lg text-[#087a3c]">
                      {totalSettlement.toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-xs font-bold text-[#4d6a60] uppercase tracking-wider mb-1">
                    Direct Bank Transfer to Farmer
                  </div>
                  <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-extrabold text-3xl sm:text-4xl text-[#087a3c]">
                    {totalSettlement.toLocaleString()} <span className="text-base text-[#17352c]">UZS</span>
                  </div>
                  <p className="text-xs text-[#4d6a60] mt-2">
                    Submitting this certification signs the laboratory release and triggers an instant Agrobank IBAN disbursement.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#087a3c] text-white rounded-full min-h-[52px] font-bold text-base hover:bg-[#065f2f] transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Accept Milk & Disburse Escrow</span>
                <span>✓</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

export default function ReceiveBatchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold">Loading gate intake...</div>}>
      <ReceiveBatchContent />
    </Suspense>
  );
}
