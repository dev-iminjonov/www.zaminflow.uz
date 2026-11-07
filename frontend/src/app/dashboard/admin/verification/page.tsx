"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getKybDossiers, KybDossier } from "@/lib/adminStore";

export default function AdminVerificationPage() {
  const router = useRouter();
  const [dossiers, setDossiers] = useState<KybDossier[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setDossiers(getKybDossiers());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

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
            <Link href="/dashboard/admin/verification" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              Verification
            </Link>
            <Link href="/dashboard/admin/disputes" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
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
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-1">
              KYB Compliance & Entity Onboarding • Gap #20 Built
            </div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              KYB Verification <span className="text-[#087a3c]">Priority Queue</span>
            </h1>
          </div>
          <Link
            href="/dashboard/admin"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to Overview
          </Link>
        </header>

        {/* Queue Metrics */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Pending Verification
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#17352c]">
                9
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[13px] font-medium text-[#4d6a60]">
                dossiers
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Soliq.uz TIN Validation
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#087a3c]">
                100%
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                ✓ Auto-Verified
              </span>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 box-border">
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              Bank IBAN Clearance
            </div>
            <div className="flex items-baseline flex-wrap gap-2 mt-3">
              <span className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-[34px] font-bold text-[#087a3c]">
                Agrobank API
              </span>
              <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* Dossiers List */}
        <section className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex flex-col gap-5">
          <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
            Awaiting Operator Review
          </div>
          <h2 className="text-2xl font-bold text-[#17352c] -mt-3">
            Submitted KYB Applications
          </h2>

          <div className="flex flex-col gap-4">
            {dossiers.map((dossier) => (
              <div
                key={dossier.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 border border-[#17352c]/10 hover:shadow-md transition"
              >
                <div className="flex-[1_1_280px]">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg text-[#12303a]">
                      {dossier.organizationName}
                    </span>
                    <span className="text-xs font-bold bg-[#e6ecea] text-[#33473f] rounded-lg px-2.5 py-0.5">
                      {dossier.role}
                    </span>
                  </div>
                  <div className="text-xs text-[#4d6a60]">
                    Region: <strong>{dossier.region}</strong> • TIN: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">{dossier.taxId}</strong>
                  </div>
                  <div className="text-xs text-[#4d6a60] mt-0.5">
                    {dossier.submittedTimeAgo}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-[#4d6a60]">Director: <strong className="text-[#17352c]">{dossier.directorName}</strong></div>
                    <div className="text-[#4d6a60]">Documents: <strong>{dossier.documents.length} verified attachments</strong></div>
                  </div>

                  <div>
                    <span
                      className={`font-bold px-3 py-1.5 rounded-lg text-xs ${
                        dossier.status === "approved"
                          ? "bg-[#d9f7e5] text-[#087a3c]"
                          : "bg-[#fdf0d2] text-[#7a4b00]"
                      }`}
                    >
                      {dossier.status === "approved" ? "✓ Approved" : "● Needs Review"}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/admin/verification/${dossier.applicantKey}`}
                    className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-6 min-h-[44px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#12303a] hover:text-white transition shadow-sm"
                  >
                    Inspect Dossier →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
