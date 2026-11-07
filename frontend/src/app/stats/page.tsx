"use client";

import Link from "next/link";
import React, { useState } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import ActiveTradeMetrics from "@/components/ActiveTradeMetrics";

export default function StatsPage() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const isDark = themeMode === "dark";

  return (
    <div
      className={`min-h-screen font-sans selection:bg-[#00C853]/25 overflow-x-hidden relative transition-colors duration-500 scroll-smooth flex flex-col justify-between ${
        isDark ? "text-[#E8F1F2]" : "text-[#1A362D]"
      }`}
      style={{
        background: isDark
          ? "linear-gradient(160deg, #13293D 0%, #0A1926 100%)"
          : "linear-gradient(160deg, #f6f9f8 0%, #e4f6ec 100%)",
      }}
    >
      {/* FLOATING PILL-SHAPED TOP NAVIGATION BAR */}
      <header className="sticky top-4 inset-x-0 z-50 flex justify-center px-4 w-full">
        <nav
          className={`w-[90%] max-w-[1200px] h-16 rounded-full px-5 sm:px-7 flex items-center justify-between transition-all duration-300 ${
            isDark
              ? "bg-[#13293D]/80 backdrop-blur-xl border border-[#247BA0]/40 shadow-[0_8px_32px_rgba(0,0,0,0.35)] text-[#E8F1F2]"
              : "bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(16,42,56,0.06)] text-[#1A362D]"
          }`}
        >
          {/* Logo "Zaminflow" */}
          <Link href="/" className="flex items-center">
            <ZaminFlowLogo mode={themeMode} size="md" />
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-tight">
            <Link
              href="/#company"
              className={`transition hover:underline underline-offset-4 ${
                isDark ? "text-[#E8F1F2]/80 hover:text-white" : "text-[#1A362D]/85 hover:text-[#00C853]"
              }`}
            >
              Our Company
            </Link>
            <Link
              href="/#team"
              className={`transition hover:underline underline-offset-4 ${
                isDark ? "text-[#E8F1F2]/80 hover:text-white" : "text-[#1A362D]/85 hover:text-[#00C853]"
              }`}
            >
              Our Team
            </Link>
            <Link
              href="/#stats"
              className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5 transition font-bold"
            >
              Live statistics
            </Link>
            <Link
              href="/#contact"
              className={`transition hover:underline underline-offset-4 ${
                isDark ? "text-[#E8F1F2]/80 hover:text-white" : "text-[#1A362D]/85 hover:text-[#00C853]"
              }`}
            >
              Contact us
            </Link>
          </div>

          {/* Right Actions: Dark Mode Toggle + Dark Navy Blue "Sign up" Button */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition border ${
                isDark
                  ? "bg-[#006494]/50 border-[#247BA0] text-[#1B98E0] hover:bg-[#247BA0]/40"
                  : "bg-white/90 border-[#E2E8F0] text-[#1A362D] hover:bg-white shadow-xs"
              }`}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Dark Navy Blue "Sign up" Button */}
            <Link
              href="/sign-up"
              className={`px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-95 flex items-center gap-1.5 ${
                isDark
                  ? "bg-[#1B98E0] text-[#13293D] hover:bg-white"
                  : "bg-[#102A38] text-white hover:bg-[#184E77]"
              }`}
            >
              <span>Sign up</span>
              <span className="text-xs">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* MAIN ACTIVE TRADE METRICS CONTENT */}
      <main className="flex-1">
        <ActiveTradeMetrics isDark={isDark} />
      </main>

      {/* MINIMAL CLEAN FOOTER */}
      <footer
        className={`relative z-10 border-t py-6 px-6 text-center text-xs transition-colors ${
          isDark
            ? "border-[#247BA0]/30 bg-[#0B1A24]/60 backdrop-blur-md text-[#E8F1F2]/60"
            : "border-[#1A362D]/10 bg-white/60 backdrop-blur-md text-[#1A362D]/70"
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ZaminFlowLogo mode={themeMode} size="sm" />
          </div>

          <div className="text-[11px] font-mono opacity-80">
            &copy; 2026 ZaminFlow Technologies. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
