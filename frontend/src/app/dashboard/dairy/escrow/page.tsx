"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  date: string;
  type: "deposit" | "disbursement" | "refund";
  description: string;
  amount: number;
  beneficiary: string;
  status: "Cleared" | "Locked" | "Settled";
}

export default function DairyEscrowPage() {
  const [balance, setBalance] = useState<number>(450000000);
  const [lockedCapital] = useState<number>(142800000);
  const availableCapital = balance - lockedCapital;

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(50000000);
  const [depositSuccess, setDepositSuccess] = useState(false);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setBalance((prev) => prev + depositAmount);
    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setIsDepositOpen(false);
    }, 2000);
  };

  const transactions: Transaction[] = [
    {
      id: "tx-1",
      date: "07 Nov, 09:30",
      type: "disbursement",
      description: "Auto-release upon gate titration pass • Batch ZF-0412",
      amount: -4818000,
      beneficiary: "Baraka Agro Cooperative",
      status: "Settled",
    },
    {
      id: "tx-2",
      date: "06 Nov, 14:15",
      type: "disbursement",
      description: "Auto-release upon gate titration pass • Batch ZF-0402",
      amount: -12800000,
      beneficiary: "Zomin Chorva LLC",
      status: "Settled",
    },
    {
      id: "tx-3",
      date: "05 Nov, 10:00",
      type: "deposit",
      description: "Wire transfer top-up from Agrobank corporate account",
      amount: 250000000,
      beneficiary: "ZaminFlow Dairy Settlement Account",
      status: "Cleared",
    },
    {
      id: "tx-4",
      date: "04 Nov, 11:20",
      type: "disbursement",
      description: "Auto-release upon gate titration pass • Batch ZF-0398",
      amount: -5120000,
      beneficiary: "Fergana Cooperative No. 4",
      status: "Settled",
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            G'AZNA VA ESKROU BALANSI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Kafolatlangan Eskrou{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              G'azna Hisobi
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Markaziy Bank hamkorligidagi depozitlar, avtomatik to'lovlar va kliring jurnali
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDepositOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 text-[#070B14] font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,211,224,0.35)] transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <span className="text-base leading-none font-black">+</span>
          <span>Eskrou Depozit Qilish</span>
        </button>
      </header>

      {/* 2. TREASURY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[28px] p-6 bg-gradient-to-br from-[#0c2e28] via-[#093a38] to-[#081a28] border border-[#00ffc8]/30 shadow-[0_15px_45px_rgba(0,255,200,0.15)] flex flex-col justify-between min-h-[160px] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#00ffc8]/15 blur-xl pointer-events-none" />
          <div className="text-[11px] font-bold tracking-wider text-[#00ffc8] uppercase font-mono">
            JAMI DEPOZIT QILINGAN ESKROU
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-black text-white">
              {balance.toLocaleString()}{" "}
              <span className="text-sm font-normal text-[#00ffc8]">UZS</span>
            </div>
            <div className="text-xs text-white/60 mt-1">
              Markaziy Bank kafolati ostida
            </div>
          </div>
        </div>

        <div className="rounded-[28px] p-6 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between min-h-[160px]">
          <div className="text-[11px] font-bold tracking-wider text-amber-300 uppercase font-mono flex items-center justify-between">
            <span>FAOL TANKERLARDA BLOKLANGAN</span>
            <span className="text-xs">🔒</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-black text-white">
              {lockedCapital.toLocaleString()}{" "}
              <span className="text-sm font-normal text-amber-300">UZS</span>
            </div>
            <div className="text-xs text-white/50 mt-1">
              Zavod qabulxonasida sinovdan o'tgach yechiladi
            </div>
          </div>
        </div>

        <div className="rounded-[28px] p-6 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between min-h-[160px]">
          <div className="text-[11px] font-bold tracking-wider text-[#00d3e0] uppercase font-mono flex items-center justify-between">
            <span>BÖŞ MABLAĞ (BUYURTMA UÇUN)</span>
            <span className="text-xs">⚡</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-3xl font-black text-[#00d3e0]">
              {availableCapital.toLocaleString()}{" "}
              <span className="text-sm font-normal text-white/60">UZS</span>
            </div>
            <div className="text-xs text-white/50 mt-1">
              Yangi partiyalar sotib olishga tayyor
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEPOSIT MODAL */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14181d] rounded-[32px] max-w-lg w-full p-7 sm:p-8 shadow-2xl border border-white/15 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-white">
                Eskrou G'aznasini To'ldirish
              </h3>
              <button
                type="button"
                onClick={() => setIsDepositOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {depositSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/40 mx-auto flex items-center justify-center text-2xl font-black mb-3">
                  ✓
                </div>
                <h4 className="text-lg font-bold text-white">
                  Depozit Qabul Qilindi & Kliringdan O'tdi!
                </h4>
                <p className="text-xs text-white/60 mt-1">
                  Eskrou hisobingiz balansi Markaziy Kliring orqali yangilandi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase mb-1.5">
                    Depozit Summasi (UZS)
                  </label>
                  <input
                    type="number"
                    step={1000000}
                    min={5000000}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-white/10 px-4 font-mono text-lg font-bold text-white bg-white/5 focus:border-[#00d3e0] outline-none"
                    required
                  />
                </div>

                <div className="bg-white/5 p-4 rounded-xl text-xs space-y-1.5 text-white/70 border border-white/10">
                  <div>Xizmat körsatuvçi bank: <strong className="text-white">Agrobank Korporativ Filiali</strong></div>
                  <div>Hisob raqami (IBAN): <strong className="font-mono text-white">UZ89 AGRO 0000 9876 5432 1000</strong></div>
                  <div>Tölov maqsadi: <strong className="font-mono text-[#00ffc8]">ZF-ESCROW-TOPUP-2026</strong></div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] rounded-full font-black text-xs uppercase tracking-wider hover:opacity-95 transition cursor-pointer"
                  >
                    Bank O'tkazmasini Tasdiqlash →
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDepositOpen(false)}
                    className="px-5 rounded-full border border-white/10 hover:bg-white/5 text-xs font-bold text-white/70"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. ESCROW TRANSACTION LEDGER */}
      <section className="rounded-[28px] bg-white/[0.03] border border-white/10 p-6 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Eskrou Tranzaksiyalar Jurnali
          </h2>
          <span className="text-xs text-white/50 font-mono">
            ISO 20022 Audit Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase font-mono text-[10px]">
                <th className="py-3 px-3">Sana / Vaqt</th>
                <th className="py-3 px-3">Tafsilotlar</th>
                <th className="py-3 px-3">Qarshi Tomon / Benefisiar</th>
                <th className="py-3 px-3 text-right">Summa (UZS)</th>
                <th className="py-3 px-3 text-center">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-3 font-mono text-white/50">
                    {tx.date}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-white">
                    {tx.description}
                  </td>
                  <td className="py-3.5 px-3 text-white/70">
                    {tx.beneficiary}
                  </td>
                  <td
                    className={`py-3.5 px-3 text-right font-mono font-bold text-sm ${
                      tx.amount > 0 ? "text-[#00ffc8]" : "text-white"
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} UZS
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="text-[10px] font-bold bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
