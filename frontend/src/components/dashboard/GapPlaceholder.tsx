"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleKey, ROLES } from "@/lib/roles";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";

interface GapPlaceholderProps {
  gapId: string;
  title: string;
  role: RoleKey;
  description: string;
  neededInputs?: string[];
  defaultProposal?: string;
  backHref?: string;
}

export default function GapPlaceholder({
  gapId,
  title,
  role,
  description,
  neededInputs = [],
  defaultProposal,
  backHref = `/dashboard/${role}`,
}: GapPlaceholderProps) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const roleConfig = ROLES[role];

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 py-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href={`/dashboard/${role}`} className="text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href={`/dashboard/${role}`} className="text-[#17352c] hover:text-[#087a3c] transition">
              ← Back to Overview
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              {roleConfig.label}
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

        {/* Placeholder Main Card */}
        <div className="bg-[rgba(255,255,255,0.76)] backdrop-blur-md border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-8 sm:p-12 flex flex-col gap-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#fdf0d2] text-[#7a4b00] border border-[#f59e0b]/30">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
              <span>Not designed yet — {gapId}</span>
            </div>
            <span className="text-xs font-bold text-[#087a3c] tracking-[0.08em] uppercase">
              Gaps Protocol • Pending User Decisions
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#17352c] mb-2">
              {title}
            </h1>
            <p className="text-base text-[#4d6a60] leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>

          {neededInputs.length > 0 && (
            <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 flex flex-col gap-3">
              <h2 className="text-xs font-bold text-[#087a3c] tracking-[0.08em] uppercase">
                What is required to complete this screen:
              </h2>
              <ul className="list-disc list-inside text-sm text-[#17352c] space-y-1">
                {neededInputs.map((input, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="font-semibold">{input}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {defaultProposal && (
            <div className="bg-[#e6ecea]/60 rounded-2xl p-5 border border-[#17352c]/10 flex flex-col gap-2">
              <h3 className="text-xs font-bold text-[#33473f] tracking-[0.08em] uppercase">
                Proposed Default Solution:
              </h3>
              <p className="text-sm text-[#4d6a60] leading-relaxed font-[family-name:var(--font-jetbrains-mono,monospace)]">
                {defaultProposal}
              </p>
            </div>
          )}

          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <Link
              href={backHref}
              className="inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-6 min-h-[48px] font-bold text-[15px] hover:bg-[#087a3c] transition shadow-md"
            >
              Return to {roleConfig.label} Overview →
            </Link>
            <Link
              href={`/dashboard/${role}#stats`}
              className="inline-flex items-center justify-center bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[48px] font-bold text-[15px] hover:bg-[#e6ecea] transition"
            >
              View Active Telemetry
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
