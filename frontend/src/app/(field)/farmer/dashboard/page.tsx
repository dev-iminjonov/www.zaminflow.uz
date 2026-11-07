"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import LockedDashboard from "@/components/LockedDashboard";
import StatusPill from "@/components/ui/StatusPill";

export default function FarmerDashboardPage() {
  const [me, setMe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((res) => res.json())
      .then((data) => {
        setMe(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-xs text-slate-500 font-mono">Loading farmer workspace...</div>
      </div>
    );
  }

  const kybStatus = me?.organization?.kyb_status || "INCOMPLETE";

  // Role Gating: Unverified farmers see Locked Dashboard per Section 9.5
  if (kybStatus !== "VERIFIED") {
    return (
      <LockedDashboard
        role="FARMER"
        kybStatus={kybStatus}
        reviewNote={me?.organization?.kyb_review_note}
        percent={me?.completion?.percent || 40}
        missing={me?.completion?.missing || ["tax_id", "location", "bank_iban"]}
        emailVerified={me?.user?.email_verified}
        profilePath="/farmer/profile"
      />
    );
  }

  // Verified Farmer Dashboard (Section 10.1)
  const farmName = me?.organization?.legal_name || "BARAKA DAIRY FARM";
  const farmerName = me?.user?.full_name?.split(" ")[0] || "Yusuf";

  return (
    <div className="space-y-4 pb-6">
      {/* Header & Greeting */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
          FRIDAY, 06 NOVEMBER • {farmName.toUpperCase()}
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Good morning, {farmerName}.
        </h1>
      </div>

      {/* 1. Wallet Card (dark navy, emerald glow edge per Section 10.1) */}
      <div className="rounded-[20px] bg-[#0F172A] border border-slate-800 text-white p-5 shadow-float relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 blur-[40px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              SETTLED BALANCE / UZS
            </span>
            <div className="font-mono text-3xl font-black text-white tracking-tight mt-0.5">
              12,480,000 <span className="text-xs font-semibold text-emerald-400">UZS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Locked in Escrow
              </span>
              <span className="text-emerald-400 font-bold text-sm">4,675,000 UZS</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Available for Instant Factoring
              </span>
              <span className="text-teal-300 font-bold text-sm">3,200,000 UZS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Pickup Card (Section 10.1) */}
      <div className="rounded-[16px] bg-white border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusPill status="EN_ROUTE" />
            <span className="text-xs font-bold text-slate-700">Arriving at 09:05</span>
          </div>
          <span className="font-mono font-black text-lg text-slate-900">23 min</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
              Expected Collection
            </span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">
              850 L • 3.2 °C
            </span>
          </div>

          {/* Driver Row: initials avatar, name, tanker plate, round call button */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
              JA
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 block leading-tight">Jasur Aliyev</span>
              <span className="font-mono text-[10px] text-slate-500 block">01 734 BC</span>
            </div>
            <a
              href="tel:+998901234567"
              className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm shadow-xs hover:bg-emerald-100"
            >
              📞
            </a>
          </div>
        </div>

        <Link
          href="/farmer/qr-pickup"
          className="w-full h-11 bg-[#047857] hover:bg-[#065F46] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
        >
          <span>📱</span>
          <span>Generate pickup QR &rarr;</span>
        </Link>
      </div>

      {/* Small row: Pending offers: 2 */}
      <Link
        href="/farmer/contracts?tab=Offers"
        className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold hover:bg-teal-100/70 transition"
      >
        <div className="flex items-center gap-2">
          <span>📋</span>
          <span>Pending offers: 2 commercial contracts awaiting signature</span>
        </div>
        <span className="font-mono text-teal-700">&rarr;</span>
      </Link>

      {/* 3. AI Suggested Buyers (Section 10.1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            AI Suggested Buyers
          </h2>
          <span className="text-xs text-teal-700 cursor-pointer font-bold">Filter ⚙️</span>
        </div>

        {[
          {
            name: "Toshkent Dairy JSC",
            match: "98% MATCH",
            price: "5,680 UZS/L",
            timeDistance: "28 min • 18.4 km",
            id: "BUYER-01",
          },
          {
            name: "Yangiyul Agromilk LLC",
            match: "94% MATCH",
            price: "5,620 UZS/L",
            timeDistance: "42 min • 31.0 km",
            id: "BUYER-02",
          },
          {
            name: "Chirchiq Sanoat Sut",
            match: "91% MATCH",
            price: "5,550 UZS/L",
            timeDistance: "55 min • 44.2 km",
            id: "BUYER-03",
          },
        ].map((buyer) => (
          <div
            key={buyer.id}
            className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">{buyer.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                {buyer.match}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="font-mono text-base font-black text-emerald-700">
                  {buyer.price}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Estimated after quality adjustment
                </span>
              </div>
              <span className="font-mono text-xs text-slate-500 font-medium">
                {buyer.timeDistance}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Link
                href="/farmer/contracts"
                className="text-xs font-bold text-teal-700 hover:text-teal-900 transition"
              >
                View buyer and terms &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
