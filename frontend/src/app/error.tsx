"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ZaminFlow App Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6">
        <div className="flex justify-center mb-2">
          <ZaminFlowLogo size="md" mode="dark" />
        </div>

        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center text-3xl mx-auto">
          ⚠️
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Kutilmagan xatolik yuz berdi
        </h1>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          Tizimda texnik uzilish yuz berdi. Dasturchilarimiz muammoni bartaraf etish ustida ishlamoqda.
        </p>

        {error.digest && (
          <p className="text-[11px] font-mono text-white/40">
            Xatolik kodi: {error.digest}
          </p>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            Qaytadan urinish
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm transition active:scale-95"
          >
            Bosh sahifaga &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
