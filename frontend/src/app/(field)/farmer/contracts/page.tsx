"use client";

import React, { useState } from "react";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";

export default function FarmerContractsPage() {
  const [activeTab, setActiveTab] = useState<"Active" | "Offers" | "Completed">("Active");
  const [paymentMode, setPaymentMode] = useState<"ESCROW" | "FACTORING">("FACTORING");
  const [showSignModal, setShowSignModal] = useState(false);
  const [offerSigned, setOfferSigned] = useState(false);

  // Illustrative Factoring calculation per Section 10.2:
  // 842 L x 5,680 = 4,782,560; fee 71,738; net 4,710,822 UZS
  const volumeL = 842;
  const basePriceUzs = 5680;
  const grossUzs = volumeL * basePriceUzs; // 4,782,560
  const feeUzs = Math.round(grossUzs * 0.015); // 71,738
  const netUzs = grossUzs - feeUzs; // 4,710,822

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Supply Contracts & Factoring</h1>
        <p className="text-xs text-slate-500">
          Bank-backed forward delivery agreements with guaranteed escrow settlement.
        </p>
      </div>

      {/* Segmented Control (Active, Offers, Completed) */}
      <div className="flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
        {(["Active", "Offers", "Completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab} {tab === "Offers" && !offerSigned && <span className="text-emerald-700 ml-1 font-mono">(2)</span>}
          </button>
        ))}
      </div>

      {/* 1. ACTIVE CONTRACT TAB */}
      {activeTab === "Active" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  CTR-2026-N0842
                </span>
                <h3 className="font-extrabold text-base text-slate-900">Toshkent Dairy JSC</h3>
              </div>
              <StatusPill status="ACTIVE_FUNDED" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Daily Commitment</span>
                <span className="font-bold text-slate-900 text-sm">850 L / day</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Base Price</span>
                <span className="font-bold text-slate-900 text-sm">5,680 UZS / L</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Funded Escrow</span>
                <span className="font-bold text-emerald-700 text-sm">4,675,000 UZS</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Quality Specs</span>
                <span className="font-bold text-slate-900 text-xs">Fat 3.60% • SNF 8.50%</span>
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 text-xs flex justify-between items-center">
              <span className="text-teal-900">Cold-chain threshold: Max 4.0 °C, 18.0 °T</span>
              <a href="#" className="font-bold text-teal-800 underline">View formula</a>
            </div>

            {/* How would you like to be paid? (Section 10.2) */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                How would you like to be paid?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Standard Escrow */}
                <button
                  type="button"
                  onClick={() => setPaymentMode("ESCROW")}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    paymentMode === "ESCROW"
                      ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-slate-900">Standard Escrow</span>
                    {paymentMode === "ESCROW" && <span className="text-emerald-700 font-bold">✓</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    No factoring fee. Released after gate weighbridge & standard clearance.
                  </p>
                </button>

                {/* Instant Bank Factoring */}
                <button
                  type="button"
                  onClick={() => setPaymentMode("FACTORING")}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    paymentMode === "FACTORING"
                      ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-slate-900">Instant Bank Factoring</span>
                    {paymentMode === "FACTORING" && <span className="text-emerald-700 font-bold">✓</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Fee 1.50%. Paid directly to your IBAN the moment lab intake passes.
                  </p>
                </button>
              </div>

              {/* Factoring illustrative breakdown per Section 10.2 */}
              {paymentMode === "FACTORING" && (
                <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2 font-mono text-xs shadow-sm">
                  <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                    Illustrative Daily Settlement Calculation
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Gross ({volumeL} L × {basePriceUzs.toLocaleString()} UZS):</span>
                    <span>{grossUzs.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>Factoring Fee (1.50%):</span>
                    <span>-{feeUzs.toLocaleString()} UZS</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-white">
                    <span>Estimated Net Payout:</span>
                    <span className="text-emerald-400 text-sm font-black">{netUzs.toLocaleString()} UZS</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans pt-1">
                    Note: Final payout follows accepted volume and laboratory spectrometry adjustments.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="primary" size="sm" className="flex-1">
                  Confirm instant factoring
                </Button>
                <Button variant="secondary" size="sm">
                  Download contract PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OFFERS TAB */}
      {activeTab === "Offers" && (
        <div className="space-y-4">
          {!offerSigned ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-mono font-bold">
                    NEW OFFER
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">Yangiyul Agromilk LLC</h3>
                  <p className="text-xs text-slate-500">60-day supply contract • 500 L daily</p>
                </div>
                <span className="font-mono text-emerald-700 font-bold text-base">5,620 UZS/L</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Commitment:</span>
                  <span className="font-bold text-slate-800">30,000 Liters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Partner Bank:</span>
                  <span className="font-bold text-slate-800">Joint Stock Commercial Bank</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowSignModal(true)}
                >
                  Review and sign &rarr;
                </Button>
                <Button variant="secondary" size="sm">
                  Decline
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-emerald-200 p-5 shadow-xs space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mx-auto">
                ✓
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Contract Signed!</h3>
              <p className="text-xs text-slate-600">
                Awaiting partner bank lock to transition to ACTIVE_FUNDED.
              </p>
              {/* Three-step tracker: Signed -> Bank Lock -> Active */}
              <div className="flex items-center justify-center gap-2 pt-2 font-mono text-xs">
                <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">1. Signed ✓</span>
                <span>&rarr;</span>
                <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold animate-pulse">2. Bank Lock...</span>
                <span>&rarr;</span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-400">3. Active</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. COMPLETED TAB */}
      {activeTab === "Completed" && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <span>📜</span>
          <p>No historical completed contracts for this harvest cycle.</p>
        </div>
      )}

      {/* Sign Offer Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-float">
            <h3 className="text-lg font-black text-slate-900">Review & Execute Contract</h3>
            <p className="text-xs text-slate-600">
              By confirming, you agree to supply 500 L/day to Yangiyul Agromilk LLC backed by bank escrow.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono space-y-1">
              <div>Counterparty: Yangiyul Agromilk LLC</div>
              <div>Base Price: 5,620 UZS/L</div>
              <div>Escrow Funding: 100% pre-locked</div>
            </div>
            <div className="pt-2 flex gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => {
                  setShowSignModal(false);
                  setOfferSigned(true);
                }}
              >
                Sign Contract &rarr;
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowSignModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
