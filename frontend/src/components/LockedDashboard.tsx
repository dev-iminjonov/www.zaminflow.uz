"use client";

import React, { useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";

interface LockedDashboardProps {
  role: "FARMER" | "INDUSTRY" | "BANK" | string;
  kybStatus: string;
  reviewNote?: string | null;
  percent: number;
  missing: string[];
  emailVerified?: boolean;
  profilePath?: string;
}

const ROLE_UNLOCKS: Record<string, { title: string; desc: string; icon: string }[]> = {
  FARMER: [
    { title: "Buyer Matching", desc: "Connect with verified commercial dairy processors", icon: "🤝" },
    { title: "Digital Contracts", desc: "Bank-backed forward supply agreements with escrow locks", icon: "📋" },
    { title: "Pickup QR Dispatch", desc: "Offline-resilient dynamic QR codes for farm gate handover", icon: "📱" },
    { title: "Instant Factoring", desc: "Immediate cash payout upon laboratory intake verification", icon: "⚡" },
  ],
  INDUSTRY: [
    { title: "Farmer Discovery", desc: "Map-based cold-chain supplier sourcing by driving time radius", icon: "🧭" },
    { title: "Supply Contracts", desc: "Draft digital contracts with custom quality payout matrix", icon: "📝" },
    { title: "Gate & Lab Terminal", desc: "Weighbridge reception and automated spectrometer lab interlock", icon: "🔬" },
    { title: "Team Accounts", desc: "Driver, lab technician, and gate receiver staff management", icon: "👥" },
  ],
  BANK: [
    { title: "KYB Underwriting", desc: "Review credit line applications and approve credit facilities", icon: "🛡️" },
    { title: "Credit Lines", desc: "Automate liquidity deployment and factoring disbursements", icon: "💳" },
    { title: "Escrow Ledger", desc: "Double-entry append-only transaction journal with ISO 20022", icon: "🏛️" },
    { title: "Portfolio Reports", desc: "Daily settlement exposure and counterparty risk audits", icon: "📊" },
  ],
};

export default function LockedDashboard({
  role,
  kybStatus,
  reviewNote,
  percent = 40,
  missing = [],
  emailVerified = false,
  profilePath = "/farmer/profile",
}: LockedDashboardProps) {
  const [resendCooldown, setResendCooldown] = useState(0);
  const unlocks = ROLE_UNLOCKS[role] || ROLE_UNLOCKS.FARMER;

  const handleResendEmail = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Status configuration per Section 9.5
  let title = "Complete your profile to unlock ZaminFlow.";
  let description = "Provide your required organization details and documents to unlock platform operations.";
  let actionText = "Complete profile";
  let actionHref = profilePath;

  if (kybStatus === "SUBMITTED") {
    title = "Your profile is under review.";
    description = "We will notify you here and by email once the compliance team completes verification.";
    actionText = "View submission";
  } else if (kybStatus === "REJECTED") {
    title = "Changes requested.";
    description = "Please update your submission based on compliance feedback.";
    actionText = "Edit and resubmit";
  } else if (kybStatus === "SUSPENDED") {
    title = "Your account is suspended.";
    description = "Please contact compliance support to resolve standing issues.";
    actionText = "Contact support";
    actionHref = "mailto:support@zaminflow.uz";
  }

  // Circular Completion Ring (64px)
  const radius = 26;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* 1. Email Banner (when unverified) */}
      {!emailVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span>✉️</span>
            <span>Verify your email to submit your profile.</span>
          </div>
          <button
            onClick={handleResendEmail}
            disabled={resendCooldown > 0}
            className="font-bold underline text-amber-950 disabled:opacity-50 cursor-pointer"
          >
            {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : "Resend email"}
          </button>
        </div>
      )}

      {/* 2. Status Card (dark navy, 20px radius, subtle dawn-arc glow in corner) */}
      <div className="rounded-[20px] bg-[#0F172A] border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-float">
        {/* Subtle Dawn Arc Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/15 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <StatusPill status={kybStatus} />

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {description}
            </p>

            {kybStatus === "REJECTED" && reviewNote && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-mono">
                Admin feedback: {reviewNote}
              </div>
            )}

            <div className="pt-2">
              <Link
                href={actionHref}
                className="inline-flex items-center justify-center h-11 px-6 rounded-[10px] bg-[#047857] hover:bg-[#065F46] text-white font-semibold text-xs shadow-xs transition active:scale-95"
              >
                {actionText} &rarr;
              </Link>
            </div>
          </div>

          {/* Completion Ring on Right */}
          <div className="flex flex-col items-center justify-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex-shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg width="80" height="80" className="transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="#334155"
                  strokeWidth={stroke}
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="#10B981"
                  strokeWidth={stroke}
                  fill="transparent"
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute font-mono font-black text-sm text-white">
                {percent}%
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase font-bold">
              Readiness
            </span>
          </div>
        </div>
      </div>

      {/* 3. Two Columns Below (Left Checklist, Right Unlocks with Teaser) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Checklist */}
        <div className="bg-white rounded-[14px] border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">Required Profile Details</h3>
            <span className="text-xs font-mono font-bold text-slate-500">{percent}% Complete</span>
          </div>

          <div className="space-y-2.5">
            {[
              { key: "tax_id", label: "State Tax Registry (STIR / INN)" },
              { key: "location", label: "Georeferenced GPS Location & Address" },
              { key: "bank_iban", label: "Bank Settlement Account (IBAN / MFO)" },
              { key: "capacity", label: "Facility Capacity & Herd Headcount" },
              { key: "documents", label: "Official State Registration Certificates" },
            ].map((item) => {
              const isDone = !missing.includes(item.key) && percent > 50;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs"
                >
                  <span className="text-slate-700 font-medium">{item.label}</span>
                  {isDone ? (
                    <span className="text-emerald-700 font-mono font-bold text-[11px] flex items-center gap-1">
                      <span>✓</span> Done
                    </span>
                  ) : (
                    <Link
                      href={profilePath}
                      className="text-amber-700 font-mono font-bold text-[11px] hover:underline"
                    >
                      Missing &rarr;
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: What Unlocks with Blurred Teaser Behind */}
        <div className="relative rounded-[14px] border border-slate-200 overflow-hidden shadow-xs p-6 bg-white flex flex-col justify-between">
          {/* Blurred Teaser Behind */}
          <div className="absolute inset-0 opacity-15 filter blur-[3px] select-none pointer-events-none p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 bg-slate-400 rounded-lg" />
              <div className="h-16 bg-slate-400 rounded-lg" />
            </div>
            <div className="h-24 bg-slate-300 rounded-lg" />
            <div className="h-16 bg-slate-200 rounded-lg" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🔒</span>
                <h3 className="font-extrabold text-sm text-slate-900">What Unlocks After Approval</h3>
              </div>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
                {role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unlocks.map((item) => (
                <div key={item.title} className="p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-extrabold text-xs text-slate-900">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500">
            Full capabilities activate automatically once verified by Central Bank & Ministry compliance.
          </div>
        </div>
      </div>
    </div>
  );
}
