"use client";

import Link from "next/link";
import React from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1013] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none text-center font-sans">
      {/* 1. AMBIENT TURQUOISE DREAMLAND BACKDROP AURORAS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[160px] opacity-25 animate-pulse"
          style={{ background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 40%, #0099ff 70%, transparent 80%)" }}
        />
      </div>

      {/* Subtle Dot Grid Canvas Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00d3e0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating Glass Container */}
      <div className="relative z-10 max-w-lg w-full bg-[#14181d]/90 backdrop-blur-2xl rounded-[36px] shadow-[0_25px_80px_rgba(0,153,255,0.2)] border border-white/10 p-8 sm:p-10 flex flex-col items-center text-center">
        {/* Brand Logo */}
        <Link href="/" className="mb-6 transition-transform hover:scale-105">
          <ZaminFlowLogo mode="dark" size="md" />
        </Link>

        {/* Glowing Horizon Arc & 404 Digit */}
        <div className="relative mb-4 flex flex-col items-center">
          <svg width="220" height="110" viewBox="0 0 240 120" className="opacity-80">
            <defs>
              <linearGradient id="nfArcCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ffc8" />
                <stop offset="50%" stopColor="#00d3e0" />
                <stop offset="100%" stopColor="#0099ff" />
              </linearGradient>
            </defs>
            <path
              d="M 20 110 A 100 100 0 0 1 220 110"
              fill="none"
              stroke="url(#nfArcCyan)"
              strokeWidth="4"
              strokeDasharray="4 6"
            />
          </svg>
          <span className="font-mono text-6xl font-black bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent block -mt-12 tracking-tight">
            404
          </span>
        </div>

        {/* Heading & Subtext */}
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
          Sahifa topilmadi
        </h1>
        <p className="text-xs text-white/50 mt-2 max-w-sm leading-relaxed">
          Siz qidirayotgan manzil mavjud emas yoki boshqa yoʻnalishga koʻchirilgan.
        </p>

        {/* Primary and Secondary CTA Buttons */}
        <div className="pt-6 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 text-[#070B14] font-black text-xs shadow-[0_10px_25px_rgba(0,211,224,0.35)] transition active:scale-95 uppercase tracking-wider"
          >
            Bosh sahifa →
          </Link>
          <Link
            href="/signin"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition"
          >
            Tizimga kirish
          </Link>
        </div>

        {/* Direct Role Portals Shortcut Pills */}
        <div className="pt-6 border-t border-white/10 w-full mt-6">
          <span className="text-[10px] uppercase font-mono text-white/40 block mb-2.5">
            Toʻgʻridan-toʻgʻri portallar
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/dashboard/farmer"
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#00ffc8]/50 text-white/70 hover:text-[#00ffc8] transition"
            >
              Fermer
            </Link>
            <Link
              href="/dashboard/dairy"
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#00ffc8]/50 text-white/70 hover:text-[#00ffc8] transition"
            >
              Zavod
            </Link>
            <Link
              href="/dashboard/driver"
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#00ffc8]/50 text-white/70 hover:text-[#00ffc8] transition"
            >
              Haydovchi
            </Link>
            <Link
              href="/dashboard/bank"
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#00ffc8]/50 text-white/70 hover:text-[#00ffc8] transition"
            >
              Bank
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
