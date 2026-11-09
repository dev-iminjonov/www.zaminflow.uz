"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getFarmerBatches, MilkBatch } from "@/lib/farmerStore";

export default function PayoutsPage() {
  const [batches, setBatches] = useState<MilkBatch[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<MilkBatch | null>(null);

  useEffect(() => {
    setBatches(getFarmerBatches());
  }, []);

  const handleExport = () => {
    setExportNotice("Bank solishtirma dalolatnomasi yuklab olindi (ZaminFlow_Reconciliation_Nov2026.xlsx)");
    setTimeout(() => setExportNotice(null), 4000);
  };

  const releasedBatches = batches.filter((b) => b.status === "released");
  const totalSettled = releasedBatches.reduce((acc, curr) => acc + curr.totalEstimatedPayout, 0);

  const lockedBatches = batches.filter((b) => b.status === "in_transit" || b.status === "testing");
  const totalLocked = lockedBatches.reduce((acc, curr) => acc + curr.totalEstimatedPayout, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            FINTECH & ESKROU HISOB-KITOBI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Eskrou To'lovlari &{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Bank Tranzaksiyalari
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            O'zbekiston Markaziy Banki kafolatlangan avtomatik eskrou kliringi
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#00d3e0] text-white hover:text-[#00ffc8] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span>📥 Solishtirma Dalolatnomasi (Excel)</span>
        </button>
      </header>

      {/* Export notification */}
      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-[#00ffc8]/10 border border-[#00ffc8]/30 text-[#00ffc8] text-xs font-bold flex items-center gap-2">
          <span>✓</span>
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. TOP KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Settled */}
        <div className="rounded-[28px] p-6 bg-gradient-to-br from-[#0c2e28] via-[#093a38] to-[#081a28] border border-[#00ffc8]/30 text-white shadow-[0_15px_45px_rgba(0,255,200,0.15)] flex flex-col justify-between min-h-[160px] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#00ffc8]/15 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-[#00ffc8] font-mono font-bold">
            <span>YAKUNIY TO'LANGAN</span>
            <span>🏛️ CBU</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
              {totalSettled.toLocaleString()}{" "}
              <span className="text-sm font-normal text-[#00ffc8]">UZS</span>
            </div>
            <div className="text-[11px] text-white/60 mt-1">
              Bank kartasi / hisob raqamiga to'liq o'tkazilgan
            </div>
          </div>
        </div>

        {/* Card 2: Locked in Escrow */}
        <div className="rounded-[28px] p-6 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between text-xs text-[#00d3e0] font-mono font-bold">
            <span>HOZIRDA BLOKLANGAN ESKROU</span>
            <span>🔒 FAOL</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
              {totalLocked.toLocaleString()}{" "}
              <span className="text-sm font-normal text-[#00d3e0]">UZS</span>
            </div>
            <div className="text-[11px] text-white/50 mt-1">
              Laboratoriya tekshiruvi yakunlangach avtomatik yechiladi
            </div>
          </div>
        </div>

        {/* Card 3: Clearing Standard */}
        <div className="rounded-[28px] p-6 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between text-xs text-white/50 font-mono font-bold">
            <span>KLIRING PROTOKOLI</span>
            <span className="text-xs">⚡</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold text-white">
              ISO 20022 / pacs.008
            </div>
            <div className="text-xs text-white/50 mt-1">
              Kafolatlangan bir lahzali bank kliringi
            </div>
          </div>
          <div className="text-[11px] text-[#00ffc8] font-mono">
            ● Tranzaksiya tezligi: &lt; 2.4 soniya
          </div>
        </div>
      </section>

      {/* 3. SETTLEMENT LEDGER TABLE */}
      <section className="rounded-[28px] bg-white/[0.03] border border-white/10 p-6 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Tranzaksiyalar Jurnali
          </h2>
          <span className="text-xs text-white/50 font-mono">
            Jami: {releasedBatches.length} ta yechilgan partiya
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase font-mono text-[10px]">
                <th className="py-3 px-3">Partiya</th>
                <th className="py-3 px-3">Zavod</th>
                <th className="py-3 px-3">Hajm</th>
                <th className="py-3 px-3">Sifat</th>
                <th className="py-3 px-3">To'langan Summa</th>
                <th className="py-3 px-3">Holat</th>
                <th className="py-3 px-3 text-right">Kvitansiya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {releasedBatches.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    {b.batchNumber}
                  </td>
                  <td className="py-3.5 px-3 text-white/80">
                    {b.destinationPlant}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-white/90">
                    {b.volumeLiters.toLocaleString()} L
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30">
                      Sinf {b.qualityGrade}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#00ffc8]">
                    {b.totalEstimatedPayout.toLocaleString()} UZS
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-bold text-[#00d3e0] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00d3e0]" />
                      Kliring Bajarildi
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(b)}
                      className="px-3 py-1 rounded-full border border-white/10 hover:border-[#00d3e0] text-[11px] font-semibold text-white/70 hover:text-white transition cursor-pointer"
                    >
                      Kvitansiya ↓
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* AGROBANK ISO 20022 ELECTRONIC CLEARING RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12161a] border border-[#00d3e0]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ffc8] animate-ping" />
                <h3 className="text-base font-black text-white">Elektron Kliring Kvitansiyasi</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-white/40">Partiya №:</span>
                <span className="font-bold text-[#00ffc8]">{selectedReceipt.batchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Qabul Qiluvchi Zavod:</span>
                <span className="text-white font-medium">{selectedReceipt.destinationPlant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Xom Sut Hajmi:</span>
                <span className="text-white font-bold">{selectedReceipt.volumeLiters.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Sifat Sinfi:</span>
                <span className="text-[#00d3e0] font-bold">Oliy A+ ({selectedReceipt.qualityGrade})</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold">
                <span className="text-white/70">To'lov Summasi:</span>
                <span className="text-[#00ffc8]">{selectedReceipt.totalEstimatedPayout.toLocaleString()} UZS</span>
              </div>
              <div className="flex justify-between text-[11px] text-white/50 pt-1">
                <span>Kliring Protokoli:</span>
                <span>ISO 20022 pacs.008</span>
              </div>
              <div className="flex justify-between text-[11px] text-white/50">
                <span>Bank:</span>
                <span>AgroBank Eskrou Depozitariysi</span>
              </div>
              <div className="flex justify-between text-[11px] text-white/40 text-[9px] pt-1 border-t border-white/5 break-all">
                <span>Hash:</span>
                <span>#UZ-AGRO-{selectedReceipt.id.slice(0, 12)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([
                    `ZAMINFLOW & AGROBANK ELEKTRON KLIRING KVITANSIYASI\n` +
                    `====================================================\n` +
                    `Partiya: ${selectedReceipt.batchNumber}\n` +
                    `Zavod: ${selectedReceipt.destinationPlant}\n` +
                    `Hajm: ${selectedReceipt.volumeLiters} Litr\n` +
                    `Sifat Sinfi: ${selectedReceipt.qualityGrade}\n` +
                    `Summa: ${selectedReceipt.totalEstimatedPayout} UZS\n` +
                    `Holati: 100% Kliring Bajarildi\n` +
                    `Protokol: ISO 20022 pacs.008\n` +
                    `Eskrou Litsenziyasi: CBU #412\n` +
                    `Sana: ${new Date().toISOString()}\n`
                  ], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Kvitansiya_${selectedReceipt.batchNumber}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>↓ Kvitansiyani Yuklab Olish (TXT / Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
