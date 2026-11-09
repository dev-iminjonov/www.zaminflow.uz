"use client";

import Link from "next/link";
import React, { useState } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { ThemeToggleButton } from "@/context/ThemeContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Ignored per security rules: always display the confirmation message
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1013] text-white flex flex-col justify-center items-center py-10 px-4 relative overflow-hidden font-sans select-none">
      {/* 1. AMBIENT TURQUOISE DREAMLAND BACKDROP AURORAS */}
      <div className="absolute top-10 -left-40 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-25 animate-pulse"
          style={{ background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 40%, transparent 70%)" }}
        />
      </div>
      <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle, #00d3e0 0%, #0099ff 50%, transparent 70%)" }}
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

      {/* Top Floating Header with Logo & Theme Toggle */}
      <div className="w-full max-w-[920px] flex items-center justify-between mb-6 relative z-10 px-2">
        <Link href="/" className="inline-flex items-center transition-transform hover:scale-105">
          <ZaminFlowLogo mode="dark" size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggleButton size="sm" />
          <Link
            href="/signin"
            className="text-xs font-bold text-white/70 hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            ← Kirish sahifasiga
          </Link>
        </div>
      </div>

      {/* Central Auth Card Container */}
      <div className="relative z-10 max-w-[920px] w-full bg-[#12161a] rounded-[36px] shadow-[0_25px_80px_rgba(0,153,255,0.22)] border border-white/10 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
        
        {/* Left Vibrant Turquoise Hero Banner (cols 5) */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#00ffc8] to-[#00b4d8] text-[#070B14] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center text-2xl mb-6 shadow-sm">
              🔑
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Parolni Tiklash
            </h2>
            <p className="text-xs font-bold text-black/75 mt-3 leading-relaxed">
              Hisobingiz xavfsizligini ta'minlash uchun parolni qayta tiklash havolasi xavfsiz kanallar orqali yuboriladi.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center w-full py-2.5 px-6 rounded-full border-2 border-black text-black font-extrabold text-xs uppercase tracking-wider hover:bg-black hover:text-white transition"
            >
              Kirish sahifasiga qaytish
            </Link>
          </div>
        </div>

        {/* Right Form Area (cols 7) */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] text-2xl flex items-center justify-center mx-auto mb-2">
                ✓
              </div>
              <h3 className="text-xl font-black text-white">Havola yuborildi</h3>
              <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                Agar koʻrsatilgan email tizimda mavjud boʻlsa, parolni tiklash yoʻriqnomasi yuborildi. Token 15 daqiqa davomida amal qiladi.
              </p>
              <div className="pt-4">
                <Link
                  href="/signin"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#00b4d8] text-[#070B14] font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition"
                >
                  Kirish sahifasiga oʻtish
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Elektron pochtangizni kiriting
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Roʻyxatdan oʻtgan elektron pochta manzilingizni kiriting
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">
                  Elektron pochta (Email)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@ferma.uz"
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:border-[#00ffc8] focus:ring-1 focus:ring-[#00ffc8] outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#00b4d8] hover:opacity-95 text-[#070B14] font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,255,200,0.3)] transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Yuborilmoqda...</span>
                ) : (
                  <>
                    <span>Tiklash havolasini yuborish</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

      <div className="mt-8 text-center text-xs text-white/40 font-mono relative z-10">
        © 2026 ZaminFlow LLC &bull; Kriptografik Xavfsizlik
      </div>
    </div>
  );
}
