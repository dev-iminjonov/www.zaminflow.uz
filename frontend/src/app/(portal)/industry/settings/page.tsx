"use client";

import React, { useState } from "react";

export default function IndustrySettingsPage() {
  const [stdFat, setStdFat] = useState("3.60");
  const [stdSnf, setStdSnf] = useState("8.50");
  const [alphaCoeff, setAlphaCoeff] = useState("0.1500");
  const [betaCoeff, setBetaCoeff] = useState("0.1000");
  const [optimalTemp, setOptimalTemp] = useState("4.00");
  const [rejectionTemp, setRejectionTemp] = useState("8.00");
  const [maxAcidity, setMaxAcidity] = useState("18.00");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Counterparty Trust Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#10182B] text-white p-5 rounded-card shadow-card">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-mono font-semibold block">
            Public Processor Rating (R_industry)
          </span>
          <h1 className="text-xl font-bold mt-1">
            Factory Profile & Quality Matrix Benchmarks
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fairness weighting: Payment Speed (45%) + Intake Speed (25%) + Lab Accuracy (20%) + Supplier Retention (10%)
          </p>
        </div>
        <div className="bg-[#059B72] px-4 py-2.5 rounded-lg text-center shrink-0">
          <span className="text-2xl font-mono font-bold block">96.40</span>
          <span className="text-[10px] uppercase font-mono tracking-wider">Industry Trust Score</span>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-card border border-[#E5EAF0] p-6 shadow-card space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Dynamic Quality-Linked Pricing Formula (NUMERIC 19,4)
            </h2>
            <p className="text-xs text-[#64748B]">
              Standard mathematical parameters used during intake titration to compute farmer settlement payouts.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-[#E5EAF0]">
            SRS §3.2 COMPLIANT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111827]">
              Standard Fat Benchmark (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={stdFat}
              onChange={(e) => setStdFat(e.target.value)}
              className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
            />
            <span className="text-[10px] text-[#64748B] mt-0.5 block">Standard baseline across Uzbekistan: 3.60%</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827]">
              Standard SNF (Solids-Not-Fat) Benchmark (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={stdSnf}
              onChange={(e) => setStdSnf(e.target.value)}
              className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
            />
            <span className="text-[10px] text-[#64748B] mt-0.5 block">Standard baseline: 8.50%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#111827]">
              Fat Premium Sensitivity (α)
            </label>
            <input
              type="number"
              step="0.0001"
              value={alphaCoeff}
              onChange={(e) => setAlphaCoeff(e.target.value)}
              className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
            />
            <span className="text-[10px] text-[#64748B] mt-0.5 block">Default 0.1500 (+1.5% payout per +0.1% fat)</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827]">
              SNF Premium Sensitivity (β)
            </label>
            <input
              type="number"
              step="0.0001"
              value={betaCoeff}
              onChange={(e) => setBetaCoeff(e.target.value)}
              className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
            />
            <span className="text-[10px] text-[#64748B] mt-0.5 block">Default 0.1000 (+1.0% payout per +0.1% SNF)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#E5EAF0]">
          <div>
            <label className="block text-xs font-semibold text-[#111827]">
              Optimal Cold-Chain Temp (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={optimalTemp}
              onChange={(e) => setOptimalTemp(e.target.value)}
              className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
            />
            <span className="text-[10px] text-[#64748B] mt-0.5 block">Standard: &le; 4.0 °C</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827]">
              Rejection Threshold Temp (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={rejectionTemp}
              onChange={(e) => setRejectionTemp(e.target.value)}
              className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
            />
            <span className="text-[10px] text-red-600 mt-0.5 block">Automatic Dispute: &gt; 8.0 °C</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827]">
              Max Acidity Limit (°T)
            </label>
            <input
              type="number"
              step="0.1"
              value={maxAcidity}
              onChange={(e) => setMaxAcidity(e.target.value)}
              className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
            />
            <span className="text-[10px] text-red-600 mt-0.5 block">Turner Limit: &le; 18.0 °T</span>
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-950">
            ✓ Quality Pricing Matrix successfully updated and committed to active contract templates.
          </div>
        )}

        <div className="pt-3 border-t border-[#E5EAF0] flex items-center justify-between">
          <span className="text-xs text-[#64748B]">Changes apply to future digital supply contracts.</span>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#059B72] hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm transition"
          >
            Save Quality Matrix Benchmarks
          </button>
        </div>
      </form>
    </div>
  );
}
