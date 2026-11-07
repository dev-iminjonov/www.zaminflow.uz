"use client";

import React, { useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import Button from "@/components/ui/Button";

interface Dossier {
  id: string;
  name: string;
  role: "FARMER" | "PROCESSOR";
  taxId: string;
  region: string;
  trustScore: number;
  requestedCreditUZS: number;
  proposedLimitUZS: number;
  factoringFeePct: number;
  reviewTenorDays: number;
  volume90d: string;
  fulfillmentRate: string;
  capacityText: string;
  riskTier: "TIER_A_PRIME" | "TIER_B_STANDARD";
  appliedHoursAgo: number;
  recentBatches: {
    batchId: string;
    date: string;
    volumeLiters: number;
    fatPct: number;
    snfPct: number;
    tempC: number;
    status: string;
  }[];
}

const DOSSIERS: Dossier[] = [
  {
    id: "APP-2026-081",
    name: "Baraka Dairy Farm LLC",
    role: "FARMER",
    taxId: "308119204",
    region: "Sirdaryo Region, Sayxunobod",
    trustScore: 98.4,
    requestedCreditUZS: 120000000,
    proposedLimitUZS: 120000000,
    factoringFeePct: 1.5,
    reviewTenorDays: 90,
    volume90d: "91,400 L",
    fulfillmentRate: "100.0%",
    capacityText: "8,500 L Tank (Dual Compressor)",
    riskTier: "TIER_A_PRIME",
    appliedHoursAgo: 2.4,
    recentBatches: [
      { batchId: "BATCH-8821", date: "Nov 06", volumeLiters: 1000, fatPct: 4.05, snfPct: 8.72, tempC: 3.2, status: "SETTLED" },
      { batchId: "BATCH-8815", date: "Nov 05", volumeLiters: 980, fatPct: 3.98, snfPct: 8.68, tempC: 3.4, status: "SETTLED" },
      { batchId: "BATCH-8809", date: "Nov 04", volumeLiters: 1020, fatPct: 4.10, snfPct: 8.75, tempC: 3.1, status: "SETTLED" },
      { batchId: "BATCH-8802", date: "Nov 03", volumeLiters: 995, fatPct: 4.02, snfPct: 8.70, tempC: 3.3, status: "SETTLED" },
      { batchId: "BATCH-8796", date: "Nov 02", volumeLiters: 1010, fatPct: 4.08, snfPct: 8.74, tempC: 3.0, status: "SETTLED" },
    ],
  },
  {
    id: "APP-2026-082",
    name: "Toshkent Premium Dairy JSC",
    role: "PROCESSOR",
    taxId: "309482110",
    region: "Tashkent Region, Zangiota",
    trustScore: 96.8,
    requestedCreditUZS: 500000000,
    proposedLimitUZS: 480000000,
    factoringFeePct: 1.5,
    reviewTenorDays: 180,
    volume90d: "450,000 L",
    fulfillmentRate: "100.0%",
    capacityText: "60,000 L / day Pasteurization",
    riskTier: "TIER_A_PRIME",
    appliedHoursAgo: 4.2,
    recentBatches: [
      { batchId: "BATCH-8820", date: "Nov 06", volumeLiters: 14200, fatPct: 3.95, snfPct: 8.65, tempC: 3.6, status: "SETTLED" },
      { batchId: "BATCH-8814", date: "Nov 05", volumeLiters: 13800, fatPct: 3.92, snfPct: 8.62, tempC: 3.5, status: "SETTLED" },
      { batchId: "BATCH-8808", date: "Nov 04", volumeLiters: 14500, fatPct: 4.01, snfPct: 8.68, tempC: 3.4, status: "SETTLED" },
      { batchId: "BATCH-8801", date: "Nov 03", volumeLiters: 14100, fatPct: 3.96, snfPct: 8.64, tempC: 3.6, status: "SETTLED" },
      { batchId: "BATCH-8795", date: "Nov 02", volumeLiters: 14300, fatPct: 3.98, snfPct: 8.66, tempC: 3.5, status: "SETTLED" },
    ],
  },
  {
    id: "APP-2026-083",
    name: "Chinoz Golden Meadow Cooperative",
    role: "FARMER",
    taxId: "307441992",
    region: "Tashkent Region, Chinoz",
    trustScore: 94.2,
    requestedCreditUZS: 80000000,
    proposedLimitUZS: 80000000,
    factoringFeePct: 1.75,
    reviewTenorDays: 90,
    volume90d: "72,800 L",
    fulfillmentRate: "98.8%",
    capacityText: "6,000 L Cooling Chamber",
    riskTier: "TIER_B_STANDARD",
    appliedHoursAgo: 6.8,
    recentBatches: [
      { batchId: "BATCH-8818", date: "Nov 06", volumeLiters: 800, fatPct: 3.82, snfPct: 8.52, tempC: 3.8, status: "SETTLED" },
      { batchId: "BATCH-8812", date: "Nov 05", volumeLiters: 820, fatPct: 3.85, snfPct: 8.55, tempC: 3.6, status: "SETTLED" },
      { batchId: "BATCH-8806", date: "Nov 04", volumeLiters: 790, fatPct: 3.80, snfPct: 8.50, tempC: 3.7, status: "SETTLED" },
      { batchId: "BATCH-8800", date: "Nov 03", volumeLiters: 810, fatPct: 3.84, snfPct: 8.53, tempC: 3.9, status: "SETTLED" },
      { batchId: "BATCH-8794", date: "Nov 02", volumeLiters: 805, fatPct: 3.81, snfPct: 8.51, tempC: 3.8, status: "SETTLED" },
    ],
  },
];

export default function BankUnderwritingPage() {
  const [selectedId, setSelectedId] = useState<string>("APP-2026-081");
  const [proposedLimit, setProposedLimit] = useState<number>(120000000);
  const [feeRate, setFeeRate] = useState<number>(1.5);
  const [tenorDays, setTenorDays] = useState<number>(90);
  const [rationale, setRationale] = useState<string>(
    "Underwriter review: 100% 90-day clean delivery record, milk fat averages 4.04% exceeding 3.60% standard. Verified refrigerated bulk milk cooling unit on site."
  );
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  const selectedDossier = DOSSIERS.find((d) => d.id === selectedId) || DOSSIERS[0];

  const handleSelect = (d: Dossier) => {
    setSelectedId(d.id);
    setProposedLimit(d.proposedLimitUZS);
    setFeeRate(d.factoringFeePct);
    setTenorDays(d.reviewTenorDays);
  };

  const handleApprove = () => {
    setDecisionFeedback(
      `✓ APPROVED: Revolving credit facility of ${proposedLimit.toLocaleString()} UZS at ${feeRate.toFixed(2)}% fee locked for ${selectedDossier.name}. Facility active on double-entry ledger.`
    );
    setTimeout(() => setDecisionFeedback(null), 5000);
  };

  const handleDecline = () => {
    setDecisionFeedback(
      `✕ DECLINED: Application ${selectedDossier.id} declined. Underwriter feedback logged: "${rationale}".`
    );
    setTimeout(() => setDecisionFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Credit Underwriting &amp; Facility Approvals
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Algorithmic scoring backed by 90-day cold-chain records, physical cooling assets, and zero-dispute verification.
        </p>
      </div>

      {decisionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold">
          {decisionFeedback}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          eyebrow="Awaiting Underwriting"
          figure="3 Applications"
          context="Queue SLA: 12 Hours"
          progress={75}
        />
        <KpiCard
          eyebrow="Requested Limits"
          figure="700,000,000.00 UZS"
          context="Revolving Trade Credit"
          progress={55}
        />
        <KpiCard
          eyebrow="Median Trust Score"
          figure="96.3 / 100"
          context="Prime Risk Cohort"
          delta={{ value: "Low Risk", positive: true }}
          progress={96}
        />
        <KpiCard
          eyebrow="Oldest In Queue"
          figure="4.2 Hours"
          context="Target: < 24.0 Hours"
          progress={18}
        />
      </div>

      {/* Split Layout: Left Queue & Right Dossier Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Queue (4 columns on lg) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">
              Review Queue (3 Pending)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Sorted by SLA</span>
          </div>

          {DOSSIERS.map((d) => {
            const isSelected = d.id === selectedId;
            return (
              <div
                key={d.id}
                onClick={() => handleSelect(d)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-white border-emerald-600 shadow-md ring-1 ring-emerald-500"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {d.id} &bull; {d.appliedHoursAgo}h ago
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      d.riskTier === "TIER_A_PRIME"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-blue-50 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {d.riskTier}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="text-sm font-bold text-slate-900">{d.name}</h3>
                  <span className="text-[11px] text-slate-500 block">{d.region}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Requested Limit</span>
                    <span className="font-bold text-slate-900">
                      {(d.requestedCreditUZS / 1000000).toFixed(1)}M UZS
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Trust Score</span>
                    <span className="font-bold text-emerald-700">{d.trustScore} / 100</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Dossier (7 columns on lg) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  KYB VERIFIED
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200">
                  FARM PASS VALID
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                  GPS VERIFIED
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {selectedDossier.name}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                STIR / INN: {selectedDossier.taxId} &bull; {selectedDossier.region}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Underwriting Score</span>
              <span className="font-mono text-2xl font-black text-emerald-700">
                {selectedDossier.trustScore}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </span>
            </div>
          </div>

          {/* 3 Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans">90-Day Delivery Volume</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {selectedDossier.volume90d}
              </span>
              <span className="text-[10px] text-emerald-700 font-sans">Consistent Daily Yield</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans">Fulfillment Success Rate</span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                {selectedDossier.fulfillmentRate}
              </span>
              <span className="text-[10px] text-slate-500 font-sans">0 Rejection Claims</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans">On-Site Cooling Assets</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                {selectedDossier.capacityText}
              </span>
              <span className="text-[10px] text-slate-500 font-sans">Telemetric Temperature</span>
            </div>
          </div>

          {/* 5 Recent Batches Table */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-slate-500 font-bold block">
              Recent Batch Inspection Log
            </span>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Batch</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2 text-right">Liters</th>
                    <th className="px-3 py-2 text-right">Fat %</th>
                    <th className="px-3 py-2 text-right">SNF %</th>
                    <th className="px-3 py-2 text-right">Temp</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {selectedDossier.recentBatches.map((b) => (
                    <tr key={b.batchId} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-bold text-slate-900">{b.batchId}</td>
                      <td className="px-3 py-2 text-slate-600">{b.date}</td>
                      <td className="px-3 py-2 text-right text-slate-900 font-bold">{b.volumeLiters.toLocaleString()} L</td>
                      <td className="px-3 py-2 text-right text-emerald-700">{b.fatPct.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right text-emerald-700">{b.snfPct.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right text-slate-600">{b.tempC.toFixed(1)}°C</td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Credit Decision Console */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
              Underwriting Decision &bull; Credit Facility Terms
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Revolving Credit Limit (UZS)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={proposedLimit}
                  onChange={(e) => setProposedLimit(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Factoring Advance Fee (%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  inputMode="decimal"
                  value={feeRate}
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Review Period (Tenor)
                </label>
                <select
                  value={tenorDays}
                  onChange={(e) => setTenorDays(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-slate-300 px-3 font-mono text-xs font-bold text-slate-900 bg-white"
                >
                  <option value={30}>30 Days (Standard)</option>
                  <option value={90}>90 Days (Quarterly)</option>
                  <option value={180}>180 Days (Semi-Annual)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Underwriter Audit Rationale &bull; Permanent Compliance Log
              </label>
              <textarea
                rows={2}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <Button
                variant="danger"
                size="md"
                onClick={handleDecline}
              >
                Decline Application
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleApprove}
              >
                Approve &amp; Lock Revolving Facility
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
