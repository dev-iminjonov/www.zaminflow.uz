import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none text-center">
      {/* Background Dawn Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Dawn Horizon Arc */}
      <div className="relative mb-6">
        <svg width="240" height="120" viewBox="0 0 240 120" className="opacity-70 mx-auto">
          <defs>
            <linearGradient id="nfArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#F5B971" />
            </linearGradient>
          </defs>
          <path
            d="M 20 110 A 100 100 0 0 1 220 110"
            fill="none"
            stroke="url(#nfArc)"
            strokeWidth="3"
            strokeDasharray="4 6"
          />
        </svg>
        <span className="font-mono text-5xl font-black text-white block -mt-10 tracking-tight">
          404
        </span>
      </div>

      <div className="max-w-md space-y-3 relative z-10">
        <h1 className="text-xl font-extrabold text-white">We could not find that page.</h1>
        <p className="text-xs text-slate-400">
          The requested route does not exist or has been relocated to another workspace partition.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-6 rounded-[10px] bg-white text-[#0F172A] font-extrabold text-xs shadow-float hover:bg-slate-100 transition active:scale-95"
          >
            Go to dashboard &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
