"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { ThemeToggleButton, useTheme } from "@/context/ThemeContext";

function VerifyEmailContent() {
  const { themeMode, isDark } = useTheme();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"VERIFYING" | "SUCCESS" | "ERROR">("VERIFYING");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("ERROR");
        setErrorMsg("Havolada tasdiqlash tokeni topilmadi.");
        return;
      }

      try {
        const res = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Tasdiqlaş tokeni muddati ötgan yoki yaroqsiz.");
        }

        setStatus("SUCCESS");
      } catch (err: any) {
        setStatus("ERROR");
        setErrorMsg(err.message || "Emailni tasdiqlashda xatolik yuz berdi.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center py-10 px-4 relative overflow-hidden font-sans select-none transition-colors duration-300 ${
      isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f6fbf8] text-[#081c15]"
    }`}>
      {/* Ambient Auroras */}
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

      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00d3e0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Header */}
      <div className="w-full max-w-[920px] flex items-center justify-between mb-6 relative z-10 px-2">
        <Link href="/" className="inline-flex items-center transition-transform hover:scale-105">
          <ZaminFlowLogo mode={themeMode} size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggleButton size="sm" />
          <Link
            href="/sign-in"
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition ${
              isDark
                ? "text-white/70 hover:text-white bg-white/5 border-white/10 hover:bg-white/10"
                : "text-[#081c15] hover:text-emerald-700 bg-white border-[#b7e4c7] shadow-xs hover:bg-[#f6fbf8]"
            }`}
          >
            ← Kiriş sahifasiga
          </Link>
        </div>
      </div>

      {/* Central Card */}
      <div className={`relative z-10 max-w-[920px] w-full rounded-[36px] border overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px] ${
        isDark
          ? "bg-[#12161a] border-white/10 shadow-[0_25px_80px_rgba(0,153,255,0.22)]"
          : "bg-white/95 border-[#b7e4c7] shadow-[0_25px_80px_rgba(0,153,255,0.06)]"
      }`}>
        {/* Left Hero */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#00ffc8] to-[#00b4d8] text-[#070B14] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center text-2xl mb-6 shadow-sm">
              ✉️
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Email Verifikatsiyasi
            </h2>
            <p className="text-xs font-bold text-black/75 mt-3 leading-relaxed">
              Özbekiston Respublikasi elektron tijorat xavfsizlik protokollari böyiça tasdiqlaş.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center w-full py-2.5 px-6 rounded-full border-2 border-black text-black font-extrabold text-xs uppercase tracking-wider hover:bg-black hover:text-white transition"
            >
              Kiriş sahifasiga ötiş
            </Link>
          </div>
        </div>

        {/* Right Content */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center items-center text-center">
          {status === "VERIFYING" && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#00ffc8] border-t-transparent animate-spin mx-auto" />
              <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-[#081c15]"}`}>Havola tekşirilmoqda...</h3>
              <p className={`text-xs ${isDark ? "text-white/50" : "text-[#2d6a4f]"}`}>Iltimos, kuting, token haqiqiyligi tekşirilmoqda.</p>
            </div>
          )}

          {status === "SUCCESS" && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] text-2xl flex items-center justify-center mx-auto mb-2">
                ✓
              </div>
              <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-[#081c15]"}`}>Email tasdiqlandi!</h3>
              <p className={`text-xs leading-relaxed max-w-sm mx-auto ${isDark ? "text-white/60" : "text-[#2d6a4f]"}`}>
                Elektron poçta manzilingiz muvaffaqiyatli tasdiqlandi. Endi barça xizmatlardan foydalanişingiz mumkin.
              </p>
              <div className="pt-4">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition"
                >
                  Tizimga kiriş →
                </Link>
              </div>
            </div>
          )}

          {status === "ERROR" && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-2xl flex items-center justify-center mx-auto mb-2">
                ⚠️
              </div>
              <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-[#081c15]"}`}>Tasdiqlaşda xatolik</h3>
              <p className="text-xs text-red-400 leading-relaxed max-w-sm mx-auto">
                {errorMsg}
              </p>
              <div className="pt-4 flex gap-3">
                <Link
                  href="/sign-in"
                  className={`inline-flex items-center justify-center px-6 py-2.5 rounded-full border text-xs font-bold transition ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      : "border-[#b7e4c7] bg-white text-[#081c15] hover:bg-[#f6fbf8] shadow-xs"
                  }`}
                >
                  Kiriş sahifasiga
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1013]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
