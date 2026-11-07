"use client";

import React, { useState } from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function DairyEscrowPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(48500000);
  const [lockedCapital, setLockedCapital] = useState<number>(32400000);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(20000000);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const availableCapital = balance - lockedCapital;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setBalance((prev) => prev + depositAmount);
    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setIsDepositOpen(false);
    }, 2000);
  };

  const transactions = [
    {
      id: "tx-1",
      date: "Today, 13:42",
      type: "disbursement",
      description: "Auto-release upon gate titration pass • Batch ZF-0405",
      amount: -4818000,
      beneficiary: "Sayxunobod Smallholder Coop (Agrobank IBAN)",
      status: "Settled",
    },
    {
      id: "tx-2",
      date: "Today, 08:30",
      type: "lock",
      description: "Escrow prefunding locked • Order ORD-2026-081",
      amount: -185240000,
      beneficiary: "Secured Platform Clearing Vault",
      status: "Held in Vault",
    },
    {
      id: "tx-3",
      date: "Yesterday, 16:15",
      type: "deposit",
      description: "Corporate bank wire deposit via Agrobank B2B API",
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
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/dairy" className="flex items-center shrink-0">
            <ZaminFlowLogo mode="light" size="md" />
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/dairy" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/dairy/orders" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Orders
            </Link>
            <Link href="/dashboard/dairy/shipments" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Shipments
            </Link>
            <Link href="/dashboard/dairy/escrow" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              Escrow
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              Dairy Industry
            </span>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-[15px] hover:bg-[#12303a] hover:text-white transition cursor-pointer"
            >
              {isSigningOut ? "..." : "Sign out"}
            </button>
          </div>
        </nav>

        {/* Header Row */}
        <header className="flex flex-wrap items-end justify-between gap-5 pt-4">
          <div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Secured Escrow <span className="text-[#087a3c]">Treasury Account</span>
            </h1>
          </div>
          <button
            onClick={() => setIsDepositOpen(true)}
            className="inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-7 min-h-[48px] font-bold text-base hover:bg-[#087a3c] transition shadow-sm cursor-pointer"
          >
            + Top-Up Escrow Capital
          </button>
        </header>

        {/* Treasury Cards */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Total Prefunded Escrow
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                {balance.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Locked in Active Tankers
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#b45309]">
                {lockedCapital.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS
              </span>
              <span className="text-xs font-bold bg-[#fdf0d2] text-[#7a4b00] rounded-lg px-2 py-1">
                Awaiting Lab Pass
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Available Working Capital
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#087a3c]">
                {availableCapital.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                Ready for Orders
              </span>
            </div>
          </div>
        </section>

        {/* Deposit Modal */}
        {isDepositOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] max-w-lg w-full p-8 shadow-2xl border border-white/80 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-extrabold text-[#12303a]">
                  Top-Up Escrow Vault
                </h3>
                <button
                  onClick={() => setIsDepositOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              {depositSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#d9f7e5] text-[#087a3c] mx-auto flex items-center justify-center text-3xl font-extrabold mb-3">
                    ✓
                  </div>
                  <h4 className="text-xl font-bold text-[#17352c]">
                    Deposit Confirmed & Cleared!
                  </h4>
                  <p className="text-sm text-[#4d6a60] mt-1">
                    Your escrow account balance has been updated via Central Clearing.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                      Deposit Amount (UZS)
                    </label>
                    <input
                      type="number"
                      step={1000000}
                      min={5000000}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] text-xl font-bold text-[#17352c] focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-1 text-[#4d6a60]">
                    <div>Servicing Bank: <strong>Agrobank Corporate Settlement</strong></div>
                    <div>Account IBAN: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">UZ89 AGRO 0000 9876 5432 1000</strong></div>
                    <div>Wire reference: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">ZF-ESCROW-TOPUP-2026</strong></div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-[#12303a] text-white rounded-full min-h-[48px] font-bold text-sm hover:bg-[#087a3c] transition cursor-pointer"
                    >
                      Authorize Wire Transfer →
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDepositOpen(false)}
                      className="px-5 rounded-full border border-gray-300 font-bold text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Escrow Audit Ledger Table */}
        <section className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8">
          <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-1">
            Audit Ledger
          </div>
          <h2 className="text-2xl font-bold text-[#17352c] mb-6">
            Escrow Transaction Ledger
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#17352c]/10 text-xs text-[#4d6a60] uppercase tracking-wider">
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Transaction Details</th>
                  <th className="py-3 px-4">Counterparty / Beneficiary</th>
                  <th className="py-3 px-4 text-right">Amount (UZS)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17352c]/10">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/50 transition">
                    <td className="py-4 px-4 text-xs font-[family-name:var(--font-jetbrains-mono,monospace)] text-[#4d6a60]">
                      {tx.date}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#17352c]">
                      {tx.description}
                    </td>
                    <td className="py-4 px-4 text-xs text-[#4d6a60]">
                      {tx.beneficiary}
                    </td>
                    <td className={`py-4 px-4 text-right font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-base ${
                      tx.amount > 0 ? "text-[#087a3c]" : "text-[#12303a]"
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} UZS
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2.5 py-1 whitespace-nowrap">
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
    </div>
  );
}
