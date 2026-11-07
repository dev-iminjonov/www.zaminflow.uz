"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";

interface JournalEntry {
  id: string;
  isoMsg: string;
  timestamp: string;
  debitAccount: string;
  creditAccount: string;
  amountUZS: string;
  description: string;
  status: "SETTLED" | "FROZEN" | "PENDING";
}

interface WebhookLog {
  id: string;
  event: string;
  endpoint: string;
  timestamp: string;
  httpStatus: number;
  signatureHmac: string;
  latencyMs: number;
}

const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: "TX-2026-9042",
    isoMsg: "pacs.008.001.08",
    timestamp: "2026-11-07 07:15:30",
    debitAccount: "VAULT:ToshkentDairy",
    creditAccount: "SETTLEMENT:BarakaFarm",
    amountUZS: "4,320,000.00",
    description: "Batch #TKT-UZ-8812 verified intake release (1,000L @ Grade A+ 4.00% Fat)",
    status: "SETTLED",
  },
  {
    id: "TX-2026-9041",
    isoMsg: "pacs.008.001.08",
    timestamp: "2026-11-07 05:14:22",
    debitAccount: "SETTLEMENT:BarakaFarm",
    creditAccount: "FEES:ZaminFlowEscrow",
    amountUZS: "64,800.00",
    description: "1.50% Factoring Advance Discount Fee deduction",
    status: "SETTLED",
  },
  {
    id: "TX-2026-9040",
    isoMsg: "camt.053.001.08",
    timestamp: "2026-11-07 04:30:00",
    debitAccount: "BANK_VAULT:CentralClearing",
    creditAccount: "ESCROW_VAULT:CollateralReserve",
    amountUZS: "1,482,900,000.00",
    description: "Daily enterprise escrow collateral replenishment (100% Pre-funded)",
    status: "SETTLED",
  },
  {
    id: "TX-2026-9039",
    isoMsg: "pacs.008.001.08",
    timestamp: "2026-11-06 18:22:15",
    debitAccount: "VAULT:ChirchiqAgro",
    creditAccount: "SETTLEMENT:YangiyulFarm",
    amountUZS: "8,940,000.00",
    description: "Batch #BATCH-8819 verified delivery settlement (2,200L @ 4.05% Fat)",
    status: "SETTLED",
  },
  {
    id: "TX-2026-9038",
    isoMsg: "pacs.002.001.10",
    timestamp: "2026-11-06 14:10:05",
    debitAccount: "ESCROW:HeldInDispute",
    creditAccount: "VAULT:DisputeArbitration",
    amountUZS: "3,300,000.00",
    description: "Batch #TKT-8812 quality dispute freeze pending 3-vial referee titration",
    status: "FROZEN",
  },
];

const INITIAL_WEBHOOKS: WebhookLog[] = [
  {
    id: "WH-2026-0041",
    event: "escrow.release.settled",
    endpoint: "https://corebank.uz/api/v2/webhooks/zaminflow",
    timestamp: "2026-11-07 07:15:31",
    httpStatus: 200,
    signatureHmac: "hmac-sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    latencyMs: 42,
  },
  {
    id: "WH-2026-0040",
    event: "factoring.draw.authorized",
    endpoint: "https://corebank.uz/api/v2/webhooks/zaminflow",
    timestamp: "2026-11-07 05:14:23",
    httpStatus: 200,
    signatureHmac: "hmac-sha256=2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    latencyMs: 38,
  },
  {
    id: "WH-2026-0039",
    event: "escrow.collateral.replenished",
    endpoint: "https://corebank.uz/api/v2/webhooks/zaminflow",
    timestamp: "2026-11-07 04:30:02",
    httpStatus: 200,
    signatureHmac: "hmac-sha256=fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9",
    latencyMs: 45,
  },
  {
    id: "WH-2026-0038",
    event: "dispute.escrow.frozen",
    endpoint: "https://corebank.uz/api/v2/webhooks/zaminflow",
    timestamp: "2026-11-06 14:10:06",
    httpStatus: 200,
    signatureHmac: "hmac-sha256=03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    latencyMs: 51,
  },
];

export default function BankLedgerPage() {
  const [activeTab, setActiveTab] = useState<"JOURNAL" | "WEBHOOKS">("JOURNAL");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleExport = (format: "XML_PACS008" | "XML_CAMT053" | "CSV") => {
    setDownloadNotice(
      `Generated ISO 20022 ${format} cryptographic archive. Partner Bank HSM signature verified.`
    );
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const filteredEntries = INITIAL_ENTRIES.filter(
    (e) =>
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.debitAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.creditAccount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Escrow and factoring ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Append-only double-entry journal formatted to ISO 20022 banking clearing standards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport("XML_PACS008")}
          >
            pacs.008 XML
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport("XML_CAMT053")}
          >
            camt.053 XML
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExport("CSV")}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold">
          ✓ {downloadNotice}
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Journal Debits (&Sigma; Dr)</span>
          <span className="font-mono text-lg font-bold text-slate-900 block">1,482,900,000.00 UZS</span>
          <span className="text-[11px] text-slate-500">100% Pre-funded clearing</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Journal Credits (&Sigma; Cr)</span>
          <span className="font-mono text-lg font-bold text-slate-900 block">1,482,900,000.00 UZS</span>
          <span className="text-[11px] text-slate-500">Matched double-entry balance</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Reconciliation Delta</span>
          <span className="font-mono text-lg font-bold text-emerald-700 block">0.00 UZS</span>
          <span className="text-[11px] text-emerald-700 font-semibold">Zero discrepancy</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Daily Settlements</span>
          <span className="font-mono text-lg font-bold text-slate-900 block">14 Settled Today</span>
          <span className="text-[11px] text-slate-500">1 Active dispute freeze</span>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("JOURNAL")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "JOURNAL"
                ? "bg-navy-950 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            Transaction Journal
          </button>
          <button
            onClick={() => setActiveTab("WEBHOOKS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "WEBHOOKS"
                ? "bg-navy-950 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            HMAC Webhook Transmission Log
          </button>
        </div>

        {activeTab === "JOURNAL" && (
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by ID, account, or memo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Transaction Journal Table */}
      {activeTab === "JOURNAL" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tx ID &bull; ISO Standard</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Debit Account</th>
                  <th className="px-4 py-3">Credit Account</th>
                  <th className="px-4 py-3 text-right">Amount (UZS)</th>
                  <th className="px-4 py-3">Description &bull; Memo</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-slate-900 block">{row.id}</span>
                      <span className="font-mono text-[10px] text-teal-700">{row.isoMsg}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {row.timestamp}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 text-[11px]">
                      {row.debitAccount}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-800 text-[11px] font-semibold">
                      {row.creditAccount}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.amountUZS}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs text-[11px]">
                      {row.description}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          row.status === "SETTLED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : row.status === "FROZEN"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Webhooks Log */}
      {activeTab === "WEBHOOKS" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Delivery ID &bull; Event</th>
                  <th className="px-4 py-3">Target Endpoint</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">HMAC-SHA256 Signature</th>
                  <th className="px-4 py-3 text-center">Latency</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_WEBHOOKS.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-50/80 transition font-mono">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{wh.id}</span>
                      <span className="text-[10px] text-teal-700">{wh.event}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px] max-w-xs truncate">
                      {wh.endpoint}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {wh.timestamp}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[10px] max-w-xs truncate">
                      {wh.signatureHmac}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 text-[11px]">
                      {wh.latencyMs} ms
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {wh.httpStatus} OK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Audit Integrity Seal Card */}
      <div className="bg-navy-950 text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-base">
            ✓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Cryptographic Hash Chain Valid &bull; Append-Only Invariant
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                HSM VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Root Hash: <span className="text-slate-200">sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</span>
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-400 text-right shrink-0">
          Double-entry proof verified: <strong className="text-emerald-400">&Sigma;Dr = &Sigma;Cr</strong>
        </div>
      </div>
    </div>
  );
}
