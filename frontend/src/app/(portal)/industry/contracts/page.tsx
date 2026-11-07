"use client";

import React, { useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/ui/StatusPill";
import DataTable, { Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";

interface ContractRecord {
  id: string;
  farm: string;
  dailyVolumeL: number;
  basePriceUzs: number;
  period: string;
  paymentMode: "ESCROW" | "FACTORING";
  status: string;
  fundedAmountUzs: number;
  fatStandard: string;
  snfStandard: string;
  signedDate: string;
}

export default function IndustryContractsPage() {
  const [filter, setFilter] = useState<string>("All");
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);

  const contracts: ContractRecord[] = [
    {
      id: "CTR-2026-N0842",
      farm: "Baraka Dairy Farm",
      dailyVolumeL: 850,
      basePriceUzs: 5680,
      period: "Nov 01 – Dec 31, 2026",
      paymentMode: "FACTORING",
      status: "ACTIVE_FUNDED",
      fundedAmountUzs: 4675000,
      fatStandard: "3.60% (α=0.15)",
      snfStandard: "8.50% (β=0.10)",
      signedDate: "2026-11-01 08:30 UZT",
    },
    {
      id: "CTR-2026-N0843",
      farm: "Yangiyul Agromilk LLC",
      dailyVolumeL: 1200,
      basePriceUzs: 5620,
      period: "Nov 05 – Jan 05, 2027",
      paymentMode: "ESCROW",
      status: "ACTIVE_FUNDED",
      fundedAmountUzs: 6744000,
      fatStandard: "3.60% (α=0.15)",
      snfStandard: "8.50% (β=0.10)",
      signedDate: "2026-11-04 14:15 UZT",
    },
    {
      id: "CTR-2026-N0844",
      farm: "Zarafshon Sut Cooperative",
      dailyVolumeL: 600,
      basePriceUzs: 5500,
      period: "Nov 10 – Dec 10, 2026",
      paymentMode: "FACTORING",
      status: "AWAITING_BANK_LOCK",
      fundedAmountUzs: 3300000,
      fatStandard: "3.60% (α=0.15)",
      snfStandard: "8.50% (β=0.10)",
      signedDate: "2026-11-06 17:00 UZT",
    },
  ];

  const filtered = contracts.filter((c) => {
    if (filter === "All") return true;
    if (filter === "Draft") return c.status === "DRAFT";
    if (filter === "Awaiting bank lock") return c.status === "AWAITING_BANK_LOCK";
    if (filter === "Active") return c.status === "ACTIVE_FUNDED";
    if (filter === "Completed") return c.status === "COMPLETED";
    return true;
  });

  const columns: Column<ContractRecord>[] = [
    { key: "id", header: "Contract ID", isMono: true, render: (r) => <span className="font-bold text-slate-900">{r.id}</span> },
    { key: "farm", header: "Supplier Farm" },
    { key: "dailyVolumeL", header: "Daily Vol", align: "right", isMono: true, render: (r) => `${r.dailyVolumeL.toLocaleString()} L` },
    { key: "basePriceUzs", header: "Base Price", align: "right", isMono: true, render: (r) => `${r.basePriceUzs.toLocaleString()} UZS` },
    { key: "period", header: "Period", align: "center", isMono: true },
    {
      key: "paymentMode",
      header: "Payment Mode",
      align: "center",
      render: (r) => (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
          {r.paymentMode}
        </span>
      ),
    },
    { key: "status", header: "Status", align: "center", render: (r) => <StatusPill status={r.status} /> },
    {
      key: "fundedAmountUzs",
      header: "Funded Escrow",
      align: "right",
      isMono: true,
      render: (r) => <span className="font-bold text-emerald-700">{(r.fundedAmountUzs / 1000).toFixed(0)}k UZS</span>,
    },
  ];

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Title & Primary Action per Section 11.3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contracts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bilateral supply commitments with institutional bank escrow custody.
          </p>
        </div>

        <Link href="/industry/discover">
          <Button variant="primary" size="md">
            + Create supply contract &rarr;
          </Button>
        </Link>
      </div>

      {/* Segmented Filter (All, Draft, Awaiting bank lock, Active, Completed) */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold max-w-xl">
        {(["All", "Draft", "Awaiting bank lock", "Active", "Completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              filter === tab ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => setSelectedContract(row)}
      />

      {/* 480px Right Drawer on Row Click (Section 11.3) */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-[480px] bg-white h-full shadow-float border-l border-slate-200 flex flex-col justify-between overflow-y-auto p-6 space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-teal-700 uppercase font-bold block">
                    CONTRACT SPECIFICATION
                  </span>
                  <h2 className="text-lg font-black text-slate-900">{selectedContract.id}</h2>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Status & 4-Step Tracker per Section 11.3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Contract Lifecycle</span>
                  <StatusPill status={selectedContract.status} />
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  <span className="text-emerald-700 font-bold">1. DRAFT ✓</span>
                  <span className="text-emerald-700 font-bold">2. BANK LOCK ✓</span>
                  <span className="text-emerald-700 font-bold">3. ACTIVE ✓</span>
                  <span className="text-slate-400">4. COMPLETED</span>
                </div>
              </div>

              {/* Quality Matrix Snapshot */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Quality Matrix Snapshot
                </h4>
                <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs font-mono space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Price:</span>
                    <span className="text-white font-bold">{selectedContract.basePriceUzs.toLocaleString()} UZS/L</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Standard Fat:</span>
                    <span className="text-emerald-400 font-bold">{selectedContract.fatStandard}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Standard SNF:</span>
                    <span className="text-emerald-400 font-bold">{selectedContract.snfStandard}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1.5">
                    <span>Cold-Chain Threshold:</span>
                    <span className="text-teal-300 font-bold">Max 4.0 °C • Acidity &lt; 18.0 °T</span>
                  </div>
                </div>
              </div>

              {/* Recent Batches List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Recent Delivered Batches
                </h4>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">BATCH-0842-A (850 L)</span>
                      <span className="text-[10px] text-slate-500">Fat 4.02% • SNF 8.72%</span>
                    </div>
                    <span className="text-emerald-700 font-bold">SETTLED</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">BATCH-0841-B (840 L)</span>
                      <span className="text-[10px] text-slate-500">Fat 3.95% • SNF 8.65%</span>
                    </div>
                    <span className="text-emerald-700 font-bold">SETTLED</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => alert("Downloading legally binding contract PDF with cryptographic signatures.")}
              >
                Download PDF &rarr;
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedContract(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
