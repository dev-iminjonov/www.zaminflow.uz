"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";

export default function AdminSettingsPage() {
  // Farmer Trust Algorithm Weights (sum must = 100%)
  const [fQuality, setFQuality] = useState<number>(35);
  const [fVolume, setFVolume] = useState<number>(30);
  const [fPunctuality, setFPunctuality] = useState<number>(25);
  const [fDisputes, setFDisputes] = useState<number>(10);

  // Industry Trust Algorithm Weights (sum must = 100%)
  const [iPayment, setIPayment] = useState<number>(45);
  const [iFairness, setIFairness] = useState<number>(25);
  const [iPrefunding, setIPrefunding] = useState<number>(20);
  const [iHonor, setIHonor] = useState<number>(10);

  // Platform Fees & Penalties
  const [platformFeePct, setPlatformFeePct] = useState<number>(0.5);
  const [factoringFeePct, setFactoringFeePct] = useState<number>(1.5);
  const [disputePenaltyPts, setDisputePenaltyPts] = useState<number>(20);

  // Cold-Chain Thresholds
  const [maxTransitMins, setMaxTransitMins] = useState<number>(120);
  const [tempPenaltyThresholdC, setTempPenaltyThresholdC] = useState<number>(4.0);
  const [tempRejectThresholdC, setTempRejectThresholdC] = useState<number>(8.0);
  const [acidityRejectT, setAcidityRejectT] = useState<number>(21.0);

  // Regional Baseline Prices
  const [regionalBaselines, setRegionalBaselines] = useState([
    { region: "Tashkent Region", priceUZS: 4200, minFat: 3.60, minSnf: 8.50 },
    { region: "Sirdaryo Region", priceUZS: 4000, minFat: 3.60, minSnf: 8.50 },
    { region: "Samarkand Region", priceUZS: 4100, minFat: 3.60, minSnf: 8.50 },
    { region: "Jizzakh Region", priceUZS: 3950, minFat: 3.55, minSnf: 8.45 },
    { region: "Fergana Valley", priceUZS: 4050, minFat: 3.60, minSnf: 8.50 },
  ]);

  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const farmerSum = fQuality + fVolume + fPunctuality + fDisputes;
  const industrySum = iPayment + iFairness + iPrefunding + iHonor;
  const isFarmerValid = farmerSum === 100;
  const isIndustryValid = industrySum === 100;
  const isValid = isFarmerValid && isIndustryValid;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaveFeedback("✓ Platform parameters updated. Trust scoring coefficients recalculated across 42 active contracts.");
    setTimeout(() => setSaveFeedback(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            System parameters &amp; trust algorithm
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrate algorithmic scoring weights, regional milk price floors, and cold-chain safety cutoff rules.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={!isValid}
          onClick={handleSave}
        >
          Save All Parameters
        </Button>
      </div>

      {saveFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold">
          {saveFeedback}
        </div>
      )}

      {/* 1. Algorithmic Trust Score Coefficients */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            1. Algorithmic Trust Score Coefficients (Must sum to 100%)
          </h2>
          <p className="text-xs text-slate-500">
            Regulates dynamic counterparty credit ratings across 90-day rolling windows.
          </p>
        </div>

        {/* Farmer Trust Weights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">
              Farmer Trust Weights (S_farmer)
            </h3>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                isFarmerValid
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              Sum: {farmerSum}% {isFarmerValid ? "✓ VALID" : "✗ MUST EQUAL 100%"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">Quality Consistency (%)</label>
              <input
                type="number"
                value={fQuality}
                onChange={(e) => setFQuality(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Volume Accuracy (%)</label>
              <input
                type="number"
                value={fVolume}
                onChange={(e) => setFVolume(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Punctuality / Pickup (%)</label>
              <input
                type="number"
                value={fPunctuality}
                onChange={(e) => setFPunctuality(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Clean Dispute History (%)</label>
              <input
                type="number"
                value={fDisputes}
                onChange={(e) => setFDisputes(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Industry Trust Weights */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">
              Industry Processor Trust Weights (S_industry)
            </h3>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                isIndustryValid
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              Sum: {industrySum}% {isIndustryValid ? "✓ VALID" : "✗ MUST EQUAL 100%"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">Prompt Escrow Settlement (%)</label>
              <input
                type="number"
                value={iPayment}
                onChange={(e) => setIPayment(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Rejection Fairness (%)</label>
              <input
                type="number"
                value={iFairness}
                onChange={(e) => setIFairness(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Escrow Pre-Funding (%)</label>
              <input
                type="number"
                value={iPrefunding}
                onChange={(e) => setIPrefunding(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Contract Honor Rate (%)</label>
              <input
                type="number"
                value={iHonor}
                onChange={(e) => setIHonor(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Fees & Cold-Chain Safety Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Fees */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              2. Platform Fees &amp; Penalty Deductions
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Platform Escrow Settlement Fee (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={platformFeePct}
                onChange={(e) => setPlatformFeePct(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Baseline infrastructure fee (0.50%)</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Factoring Advance Discount Rate (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={factoringFeePct}
                onChange={(e) => setFactoringFeePct(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Instant bank liquidity discount (1.50%)</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Dispute Bad-Faith Trust Penalty (Points)
              </label>
              <input
                type="number"
                value={disputePenaltyPts}
                onChange={(e) => setDisputePenaltyPts(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-red-700"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Subtracted upon certified arbitration loss</span>
            </div>
          </div>
        </section>

        {/* Cold-Chain Rules */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              3. Cold-Chain Operational Cutoffs
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Max Tanker Transit Window (Minutes)
              </label>
              <input
                type="number"
                value={maxTransitMins}
                onChange={(e) => setMaxTransitMins(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">2-hour maximum farm-to-gate transit</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Temperature Penalty Threshold (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={tempPenaltyThresholdC}
                onChange={(e) => setTempPenaltyThresholdC(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Penalties apply above 4.0°C</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Absolute Temperature Rejection (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={tempRejectThresholdC}
                onChange={(e) => setTempRejectThresholdC(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono font-bold text-red-700"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Immediate batch rejection above 8.0°C</span>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Regional Baseline Milk Prices */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Regional Baseline Milk Price Floors (UZS/L)
            </h2>
            <p className="text-xs text-slate-500">
              Base reference rate used for contracts and escrow pre-funding calculation.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3 text-right">Floor Price (UZS/L)</th>
                <th className="px-4 py-3 text-right">Base Fat %</th>
                <th className="px-4 py-3 text-right">Base SNF %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {regionalBaselines.map((rb, idx) => (
                <tr key={rb.region} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-sans font-bold text-slate-900">{rb.region}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      value={rb.priceUZS}
                      onChange={(e) => {
                        const updated = [...regionalBaselines];
                        updated[idx].priceUZS = Number(e.target.value);
                        setRegionalBaselines(updated);
                      }}
                      className="w-28 h-8 rounded border border-slate-300 px-2 font-mono font-bold text-right text-slate-900 bg-white"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{rb.minFat.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right text-slate-700">{rb.minSnf.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
