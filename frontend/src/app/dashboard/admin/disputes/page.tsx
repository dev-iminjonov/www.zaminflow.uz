"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getDisputeCases, resolveDispute, DisputeCase } from "@/lib/adminStore";

export default function AdminDisputesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<DisputeCase[]>([]);
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setCases(getDisputeCases());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const handleResolve = (caseId: string, resolution: "settled_farmer" | "settled_split" | "settled_dairy") => {
    resolveDispute(caseId, resolution);
    setCases(getDisputeCases());
    const label =
      resolution === "settled_farmer"
        ? "Ruled in favor of Farmer (100% Escrow Released to Farmer IBAN)"
        : resolution === "settled_split"
        ? "Ruled 50/50 Compromise Settlement"
        : "Ruled in favor of Dairy Industry (Deduction Applied)";
    setResolutionNotice(`Arbitration judgment finalized for case: ${label}`);
    setTimeout(() => setResolutionNotice(null), 4000);
  };

  const totalFrozenEscrow = cases.reduce((acc, curr) => acc + curr.frozenEscrowUZS, 0);

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/admin" className="text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/admin" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/admin/users" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Users
            </Link>
            <Link href="/dashboard/admin/verification" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Verification
            </Link>
            <Link href="/dashboard/admin/disputes" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              Disputes
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              Admin
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
              Disputes Arbitration <span className="text-[#087a3c]">Tribunal</span>
            </h1>
          </div>
          <Link
            href="/dashboard/admin"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to Overview
          </Link>
        </header>

        {resolutionNotice && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-900 text-sm font-semibold flex items-center justify-between">
            <span>⚖ {resolutionNotice}</span>
            <button onClick={() => setResolutionNotice(null)} className="text-xs underline font-bold">Dismiss</button>
          </div>
        )}

        {/* Dispute Metrics */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Open Disputes
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                3
              </span>
              <span className="text-xs font-bold bg-[#fdf0d2] text-[#7a4b00] rounded-lg px-2 py-1">
                ● Needs review
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Total Frozen Escrow
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#b45309]">
                {totalFrozenEscrow.toLocaleString()}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                UZS
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Arbitration Authority
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[26px] font-bold text-[#087a3c]">
                State Vet Lab
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                Certified
              </span>
            </div>
          </div>
        </section>

        {/* Dispute Cases Cards */}
        <section className="flex flex-col gap-5">
          {cases.map((c) => {
            const isOpen = c.status === "open";

            return (
              <div
                key={c.id}
                className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex flex-col gap-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#17352c]/10">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-xl font-bold text-[#12303a]">
                        {c.caseNumber}
                      </span>
                      <span className="text-xs font-bold bg-[#fdf0d2] text-[#7a4b00] rounded-lg px-2.5 py-0.5">
                        Batch {c.batchNumber}
                      </span>
                      <span className="text-xs text-[#4d6a60]">{c.filedDate}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#17352c]">
                      Claimant: <span className="text-[#087a3c]">{c.claimantName}</span> vs. Respondent: <span className="text-[#12303a]">{c.respondentName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#4d6a60]">Frozen Escrow Capital</div>
                    <div className="font-[family-name:var(--font-jetbrains-mono,monospace)] font-extrabold text-2xl text-[#b45309]">
                      {c.frozenEscrowUZS.toLocaleString()} UZS
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-[#17352c]/10 text-sm">
                  <div className="text-xs font-bold text-[#087a3c] uppercase tracking-wider mb-1">
                    Dispute Grounds & Evidence
                  </div>
                  <p className="text-[#17352c] leading-relaxed">
                    {c.reason}
                  </p>
                </div>

                {isOpen ? (
                  <div className="pt-2 flex flex-wrap gap-3 items-center justify-end">
                    <button
                      onClick={() => handleResolve(c.id, "settled_farmer")}
                      className="bg-[#087a3c] text-white rounded-full px-5 min-h-[44px] font-bold text-xs hover:bg-[#065f2f] transition shadow-sm cursor-pointer"
                    >
                      Release 100% Escrow to Farmer (Lab Overruled)
                    </button>
                    <button
                      onClick={() => handleResolve(c.id, "settled_split")}
                      className="bg-[#12303a] text-white rounded-full px-5 min-h-[44px] font-bold text-xs hover:bg-black transition shadow-sm cursor-pointer"
                    >
                      Split 50/50 Compromise
                    </button>
                    <button
                      onClick={() => handleResolve(c.id, "settled_dairy")}
                      className="bg-white text-red-700 border border-red-300 rounded-full px-5 min-h-[44px] font-bold text-xs hover:bg-red-50 transition cursor-pointer"
                    >
                      Uphold Dairy Deduction
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between">
                    <span>✓ Judgment Executed & Funds Disbursed: {c.status}</span>
                    <span className="font-[family-name:var(--font-jetbrains-mono,monospace)]">Closed</span>
                  </div>
                )}
              </div>
            );
          })}
        </section>

      </div>
    </div>
  );
}
