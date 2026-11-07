"use client";

import Link from "next/link";
import React, { useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import Button from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const [selectedCluster, setSelectedCluster] = useState<string>("Tashkent");

  const globalMetrics = [
    {
      eyebrow: "Platform-Wide GMV",
      figure: "8,245,200,000.00 UZS",
      context: "100% NUMERIC(19,4) Audited",
      delta: { value: "+14.8% MoM", positive: true },
      progress: 88,
    },
    {
      eyebrow: "Active Supply Contracts",
      figure: "42 Contracts",
      context: "128,500 L Daily Cold-Chain Volume",
      delta: { value: "100% Escrow Funded", positive: true },
      progress: 74,
    },
    {
      eyebrow: "Cumulative Fee Yield",
      figure: "123,678,000.00 UZS",
      context: "Factoring & Platform Commissions",
      delta: { value: "Zero Loss Write-Offs", positive: true },
      progress: 92,
    },
    {
      eyebrow: "KYB Review Queue",
      figure: "3 Dossiers",
      context: "Avg Underwrite Time: 3.8h",
      delta: { value: "SLA Compliant", positive: true },
      progress: 35,
    },
  ];

  const regionalClusters = [
    {
      id: "Tashkent",
      name: "Tashkent Region",
      supplyLiters: 32000,
      demandLiters: 41500,
      deficitLiters: -9500,
      activeContracts: 21,
      avgFat: 3.88,
      avgTrust: 92.4,
      status: "DEFICIT",
    },
    {
      id: "Sirdaryo",
      name: "Sirdaryo Region",
      supplyLiters: 24600,
      demandLiters: 22000,
      deficitLiters: 2600,
      activeContracts: 14,
      avgFat: 3.94,
      avgTrust: 94.8,
      status: "SURPLUS",
    },
    {
      id: "Samarkand",
      name: "Samarkand Region",
      supplyLiters: 28500,
      demandLiters: 31000,
      deficitLiters: -2500,
      activeContracts: 10,
      avgFat: 3.90,
      avgTrust: 93.1,
      status: "DEFICIT",
    },
    {
      id: "Jizzakh",
      name: "Jizzakh Region",
      supplyLiters: 12000,
      demandLiters: 17500,
      deficitLiters: -5500,
      activeContracts: 7,
      avgFat: 3.91,
      avgTrust: 91.2,
      status: "DEFICIT",
    },
    {
      id: "Fergana",
      name: "Fergana Valley",
      supplyLiters: 31400,
      demandLiters: 29000,
      deficitLiters: 2400,
      activeContracts: 12,
      avgFat: 3.85,
      avgTrust: 92.0,
      status: "SURPLUS",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Global command center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Macro cold-chain supply surveillance, national escrow settlement volume, and dispute arbitration logs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/disputes">
            <Button variant="danger" size="sm">
              Arbitration Console &bull; 1 Active
            </Button>
          </Link>
          <Link href="/admin/kyb-review">
            <Button variant="primary" size="sm">
              KYB Queue (3) &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Financial & Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {globalMetrics.map((kpi) => (
          <KpiCard
            key={kpi.eyebrow}
            eyebrow={kpi.eyebrow}
            figure={kpi.figure}
            context={kpi.context}
            delta={kpi.delta}
            progress={kpi.progress}
          />
        ))}
      </div>

      {/* Regional Supply & Demand Surveillance Map / Heatmap & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Regional Surveillance (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <span className="text-xs font-mono uppercase text-slate-500 font-bold block">
                PostGIS 3.4 Spatial Surveillance
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Uzbekistan Dairy Supply &amp; Deficit Heatmap
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                SURPLUS BASIN
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                DEMAND DEFICIT
              </span>
            </div>
          </div>

          {/* Stylized Visual Map of Uzbekistan Dairy Basins */}
          <div className="p-4 bg-navy-950 rounded-xl text-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-b border-navy-800 pb-2">
              <span className="text-slate-400">Select Basin Cluster to Inspect:</span>
              <div className="flex flex-wrap gap-1.5">
                {regionalClusters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCluster(c.id)}
                    className={`px-2.5 py-1 rounded text-[11px] transition font-bold ${
                      selectedCluster === c.id
                        ? "bg-emerald-600 text-white"
                        : "bg-navy-900 text-slate-300 hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Basin Details Card */}
            {(() => {
              const basin = regionalClusters.find((c) => c.id === selectedCluster) || regionalClusters[0];
              const netBalanceLiters = basin.supplyLiters - basin.demandLiters;
              const isSurplus = netBalanceLiters >= 0;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1 text-xs font-mono">
                  <div className="p-3 bg-navy-900 rounded-lg border border-navy-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Contracted Supply</span>
                    <span className="text-base font-bold text-white mt-0.5 block">
                      {basin.supplyLiters.toLocaleString()} L/day
                    </span>
                    <span className="text-[10px] text-slate-400">{basin.activeContracts} active contracts</span>
                  </div>

                  <div className="p-3 bg-navy-900 rounded-lg border border-navy-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Intake Demand</span>
                    <span className="text-base font-bold text-slate-300 mt-0.5 block">
                      {basin.demandLiters.toLocaleString()} L/day
                    </span>
                    <span className="text-[10px] text-slate-400">Processing capacity</span>
                  </div>

                  <div className="p-3 bg-navy-900 rounded-lg border border-navy-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Net Regional Balance</span>
                    <span className={`text-base font-bold mt-0.5 block ${isSurplus ? "text-emerald-400" : "text-amber-400"}`}>
                      {isSurplus ? "+" : ""}{netBalanceLiters.toLocaleString()} L/day
                    </span>
                    <span className="text-[10px] text-slate-400">{basin.status}</span>
                  </div>

                  <div className="p-3 bg-navy-900 rounded-lg border border-navy-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Avg Fat &bull; Trust</span>
                    <span className="text-base font-bold text-teal-300 mt-0.5 block">
                      {basin.avgFat.toFixed(2)}% Fat
                    </span>
                    <span className="text-[10px] text-emerald-400">Trust: {basin.avgTrust}/100</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right: Telemetry & Platform Health (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono uppercase text-slate-500 font-bold block">
              Infrastructure Telemetry
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Platform System Health
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Core API Latency</span>
              <span className="font-mono font-bold text-emerald-700">18 ms &bull; 99.99%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">DB Replication Lag</span>
              <span className="font-mono font-bold text-emerald-700">0.0 s &bull; Synchronous</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">PostGIS Routing Engine</span>
              <span className="font-mono font-bold text-emerald-700">Online &bull; 1.2s avg</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Bank HSM Signatures</span>
              <span className="font-mono font-bold text-teal-700">VALID &bull; 2,410 signed</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-mono space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <span>✓</span>
              <span>Double-Entry Invariant Audited</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Escrow vault total: 1,482,900,000 UZS. Zero ledger discrepancy across all 42 contracts.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Supply & Demand Balance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Regional Milk Supply &amp; Demand Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Identifies inter-region transport corridors and cold-chain route efficiencies.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
            POSTGIS 3.4 AUDITED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Basin Region</th>
                <th className="px-4 py-3 text-right">Contracted Supply</th>
                <th className="px-4 py-3 text-right">Intake Demand</th>
                <th className="px-4 py-3 text-center">Net Balance</th>
                <th className="px-4 py-3 text-center">Active Contracts</th>
                <th className="px-4 py-3 text-right">Avg Milk Fat %</th>
                <th className="px-4 py-3 text-center">Cluster Trust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {regionalClusters.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-sans font-bold text-slate-900">{r.name}</td>
                  <td className="px-4 py-3 text-right text-slate-700 font-bold">{r.supplyLiters.toLocaleString()} L/day</td>
                  <td className="px-4 py-3 text-right text-slate-700">{r.demandLiters.toLocaleString()} L/day</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        r.status === "SURPLUS"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {r.deficitLiters >= 0 ? "+" : ""}{r.deficitLiters.toLocaleString()} L ({r.status})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-900 font-bold">{r.activeContracts}</td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-bold">{r.avgFat.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-900">{r.avgTrust}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
