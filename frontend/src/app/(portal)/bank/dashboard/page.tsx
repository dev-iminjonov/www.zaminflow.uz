"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";

export default function BankDashboardPage() {
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  // 12-Day Settlement History Data
  const settlementDays = [
    { day: "Oct 27", volumeLiters: 92400, amountUZS: 369600000 },
    { day: "Oct 28", volumeLiters: 104200, amountUZS: 416800000 },
    { day: "Oct 29", volumeLiters: 98100, amountUZS: 392400000 },
    { day: "Oct 30", volumeLiters: 112500, amountUZS: 450000000 },
    { day: "Oct 31", volumeLiters: 108400, amountUZS: 433600000 },
    { day: "Nov 01", volumeLiters: 115000, amountUZS: 460000000 },
    { day: "Nov 02", volumeLiters: 119200, amountUZS: 476800000 },
    { day: "Nov 03", volumeLiters: 122800, amountUZS: 491200000 },
    { day: "Nov 04", volumeLiters: 125400, amountUZS: 501600000 },
    { day: "Nov 05", volumeLiters: 127100, amountUZS: 508400000 },
    { day: "Nov 06", volumeLiters: 128500, amountUZS: 514000000 },
    { day: "Today", volumeLiters: 131200, amountUZS: 524800000 },
  ];

  const maxVolume = Math.max(...settlementDays.map((d) => d.volumeLiters));

  // Top Counterparty Exposures
  const exposures = [
    {
      id: "ORG-IND-01",
      name: "Toshkent Dairy JSC",
      role: "PROCESSOR",
      contracts: 18,
      escrowLocked: "720,000,000.00 UZS",
      creditDrawn: "260,000,000.00 UZS",
      facilityLimit: "350,000,000.00 UZS",
      utilizationPct: 74.3,
      trustScore: 98.2,
      tier: "PRIME_TIER_A",
      status: "SOLVENT",
    },
    {
      id: "ORG-IND-02",
      name: "Chirchiq Agro Processing LLC",
      role: "PROCESSOR",
      contracts: 12,
      escrowLocked: "440,000,000.00 UZS",
      creditDrawn: "180,000,000.00 UZS",
      facilityLimit: "250,000,000.00 UZS",
      utilizationPct: 72.0,
      trustScore: 95.8,
      tier: "PRIME_TIER_A",
      status: "SOLVENT",
    },
    {
      id: "ORG-IND-03",
      name: "Yangiyul Milk Industry JV",
      role: "PROCESSOR",
      contracts: 8,
      escrowLocked: "322,900,000.00 UZS",
      creditDrawn: "102,000,000.00 UZS",
      facilityLimit: "150,000,000.00 UZS",
      utilizationPct: 68.0,
      trustScore: 94.0,
      tier: "STANDARD_TIER_B",
      status: "SOLVENT",
    },
  ];

  const handleExport = () => {
    setReportFeedback("Generating portfolio exposure & credit solvency report (PDF & CSV)... Download initiated.");
    setTimeout(() => setReportFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Liquidity and exposure
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional escrow vault solvency, factoring facility deployment, and credit risk surveillance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
          >
            Export portfolio report
          </Button>
          <Link href="/bank/underwriting">
            <Button variant="primary" size="sm">
              Underwriting queue &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {reportFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold">
          ✓ {reportFeedback}
        </div>
      )}

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          eyebrow="Total Escrow Locked"
          figure="1,482,900,000.00 UZS"
          context="100% Backed by Factory Pre-Funding"
          delta={{ value: "+12.4% MoM", positive: true }}
          progress={100}
        />
        <KpiCard
          eyebrow="Factoring Credit Deployed"
          figure="542,000,000.00 UZS"
          context="72.3% of 750M UZS Bank Facility"
          delta={{ value: "24 Active Advances", positive: true }}
          progress={72.3}
        />
        <KpiCard
          eyebrow="Repayments Due This Week"
          figure="118,400,000.00 UZS"
          context="14 Scheduled Factory Deliveries"
          delta={{ value: "Avg 4.8 Days Cycle", positive: true }}
          progress={42}
        />
        <KpiCard
          eyebrow="Default Loss Ratio"
          figure="0.00%"
          context="Zero Non-Performing Trade Lines"
          delta={{ value: "3-Vial Custody Backed", positive: true }}
          progress={0}
        />
      </div>

      {/* Amber Disputed Escrow Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
            !
          </div>
          <div>
            <span className="text-xs font-bold block">
              3,300,000.00 UZS Disputed Escrow Collateral Locked
            </span>
            <p className="text-[11px] text-amber-800 font-mono">
              Batch #TKT-2026-UZ-8812 &bull; Toshkent Dairy vs Baraka Farm &bull; 72h Reference Sample Arbitration in progress.
            </p>
          </div>
        </div>
        <Link
          href="/bank/ledger"
          className="text-xs font-bold text-amber-900 underline hover:text-amber-950 font-mono shrink-0"
        >
          View Ledger Freeze &rarr;
        </Link>
      </div>

      {/* 12-Bar Daily Settlement Volume Chart & Revolving Credit Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 12-Bar Chart Column */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <span className="text-xs font-mono uppercase text-slate-500 font-bold block">
                12-Day Daily Settlement Volume
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Verified Milk Deliveries &bull; Liters Disbursed
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded bg-teal-200 inline-block" />
                Previous Days
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" />
                Today (Current Cycle)
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {settlementDays.map((item, idx) => {
              const heightPct = Math.max(15, Math.round((item.volumeLiters / maxVolume) * 100));
              const isToday = idx === settlementDays.length - 1;

              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-1.5 group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-navy-950 text-white text-[10px] font-mono py-1 px-2 rounded shadow-float whitespace-nowrap z-10">
                    {item.volumeLiters.toLocaleString()} L &bull; {(item.amountUZS / 1000000).toFixed(1)}M UZS
                  </div>

                  <div className="w-full h-36 flex items-end justify-center">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        isToday
                          ? "bg-emerald-600 shadow-glowEmerald"
                          : "bg-teal-200 hover:bg-teal-300"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-mono ${isToday ? "font-bold text-emerald-800" : "text-slate-500"}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 gap-2">
            <span>12-Day Volume: <strong className="text-slate-900">1,389,900 L</strong></span>
            <span>Total Value: <strong className="text-slate-900">5,559,600,000 UZS</strong></span>
            <span>Avg Settlement Time: <strong className="text-emerald-700">&lt; 1.8 seconds</strong></span>
          </div>
        </div>

        {/* Revolving Credit Utilization Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono uppercase text-slate-500 font-bold block">
              Credit Facility Solvency
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Revolving Line Utilization
            </h2>
          </div>

          <div className="p-4 bg-navy-950 text-white rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Active Facility Deployment
            </span>
            <div className="font-mono text-2xl font-black text-white">
              542.0M <span className="text-xs font-normal text-emerald-400">/ 750.0M UZS</span>
            </div>
            <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">
              <div
                style={{ width: "72.3%" }}
                className="h-full bg-emerald-500 rounded-full transition-all"
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>Deployed: 72.3%</span>
              <span className="text-emerald-400">Available: 208.0M UZS</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Facility Maturity:</span>
              <span className="font-mono font-bold text-slate-900">Dec 31, 2027</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100">
              <span className="text-slate-500">Baseline Advance Fee:</span>
              <span className="font-mono font-bold text-emerald-700">1.50% (Net 30d)</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100">
              <span className="text-slate-500">Collateral Coverage Ratio:</span>
              <span className="font-mono font-bold text-slate-900">100.0% Vault-Backed</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100">
              <span className="text-slate-500">Automated Repayment:</span>
              <span className="font-mono font-bold text-slate-900">Gate Lab Auto-Debit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Counterparty Exposures Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Top Counterparty Credit Exposures
            </h2>
            <p className="text-xs text-slate-500">
              Audited trade lines, pre-funded escrow vaults, and risk classification.
            </p>
          </div>
          <Link href="/bank/underwriting">
            <Button variant="secondary" size="sm">
              Review Underwriting Dossiers &rarr;
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Counterparty</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Escrow Locked</th>
                <th className="px-4 py-3 text-right">Credit Drawn</th>
                <th className="px-4 py-3 text-right">Facility Limit</th>
                <th className="px-4 py-3 text-right">Utilization</th>
                <th className="px-4 py-3 text-center">Trust Score</th>
                <th className="px-4 py-3 text-center">Solvency Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exposures.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{exp.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{exp.id} &bull; {exp.contracts} Contracts</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {exp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {exp.escrowLocked}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                    {exp.creditDrawn}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {exp.facilityLimit}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {exp.utilizationPct}%
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      {exp.trustScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
