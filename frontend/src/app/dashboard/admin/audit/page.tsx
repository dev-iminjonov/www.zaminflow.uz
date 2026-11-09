"use client";

import React, { useState } from "react";
import Link from "next/link";

const AUDIT_LOGS = [
  {
    id: "AUD-9921",
    event: "KYC Dossier Approved",
    actor: "Super Admin (Muhammadaziz)",
    target: "Oqdaryo Agro Coop (STIR 308112940)",
    sha256: "8f7a2d1e...9c4b",
    timestamp: "2026-11-08 17:42:10 UTC",
    status: "Verified",
  },
  {
    id: "AUD-9920",
    event: "ISO 20022 pacs.008 Clearing Executed",
    actor: "AgroBank Custody Engine",
    target: "Batch ZF-0412 Payout (4,818,000 UZS)",
    sha256: "e4b109c8...2f11",
    timestamp: "2026-11-08 16:30:05 UTC",
    status: "Immutable",
  },
  {
    id: "AUD-9919",
    event: "Cold-Chain Integrity Check Passed",
    actor: "IoT Telemetry Daemon",
    target: "Truck 01 | 777 ZAM (3.2°C Locked)",
    sha256: "3d99a01f...77aa",
    timestamp: "2026-11-08 15:12:44 UTC",
    status: "Verified",
  },
  {
    id: "AUD-9918",
    event: "Smart Contract Escrow Locked",
    actor: "Samarqand Sut Zavodi #4",
    target: "Contract #ZF-ORD-8812 (48,500,000 UZS)",
    sha256: "1a88cf02...5b33",
    timestamp: "2026-11-08 14:05:19 UTC",
    status: "Immutable",
  },
  {
    id: "AUD-9917",
    event: "Central Bank (CBU) Regulatory Sync",
    actor: "CBU Automated Gateway",
    target: "Ledger State #UZ-CBU-2026",
    sha256: "7c11ff49...00dd",
    timestamp: "2026-11-08 12:00:00 UTC",
    status: "Audited",
  },
];

export default function AdminAuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = AUDIT_LOGS.filter(
    (l) =>
      l.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            IMMUTABLE SECURITY & AUDIT VAULT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Audit Jurnali &{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Kriptografik Reyestr
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Markaziy Bank va Soliq.uz talablari asosida yuritiluvchi oʻzgarmas SHA-256 tranzaksiyalar zanjiri
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:border-white/20 text-xs font-bold text-white/70 hover:text-white transition"
        >
          ← Umumiy Koʻrinishga Qaytish
        </Link>
      </header>

      {/* METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-white/50">Jami Audit Yozuvlari</span>
          <div className="text-3xl font-black font-mono text-white mt-1">14,892</div>
          <span className="text-[10px] text-[#00ffc8] font-mono mt-1">✓ 100% Kriptografik yaxlitlik</span>
        </div>
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-white/50">CBU Regulyativ Sinxron</span>
          <div className="text-3xl font-black font-mono text-[#00ffc8] mt-1">Faol</div>
          <span className="text-[10px] text-white/40 font-mono mt-1">Har 15 daqiqada avto-audit</span>
        </div>
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-white/50">Shifrlash Protokoli</span>
          <div className="text-xl font-black font-mono text-white mt-1">RSA-4096 / SHA-256</div>
          <span className="text-[10px] text-white/40 font-mono mt-1">Oʻzbekiston DSt standarti</span>
        </div>
      </section>

      {/* TABLE */}
      <div className="bg-white/[0.03] rounded-[28px] p-6 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Soʻnggi Audit Voqealari</h3>
          <input
            type="text"
            placeholder="Voqea yoki aktyor boʻyicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:border-[#00d3e0] outline-none"
          />
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase font-mono text-[10px]">
                <th className="py-3 px-3">ID / Vaqt</th>
                <th className="py-3 px-3">Voqea</th>
                <th className="py-3 px-3">Aktyor</th>
                <th className="py-3 px-3">Ob'ekt</th>
                <th className="py-3 px-3">SHA-256 Hash</th>
                <th className="py-3 px-3 text-right">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{log.id}</span>
                    <span className="text-[10px] text-white/40">{log.timestamp}</span>
                  </td>
                  <td className="py-3 px-3 font-sans font-bold text-white">{log.event}</td>
                  <td className="py-3 px-3 text-white/70">{log.actor}</td>
                  <td className="py-3 px-3 text-white/60">{log.target}</td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleCopy(log.id, log.sha256)}
                      className="text-[#00ffc8] hover:underline cursor-pointer"
                    >
                      {copiedId === log.id ? "✓ Nusxalandi" : log.sha256}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8]">
                      {log.status}
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
