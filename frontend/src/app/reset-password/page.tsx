"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { ThemeToggleButton, useTheme } from "@/context/ThemeContext";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { themeMode, isDark } = useTheme();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasLength = password.length >= 10;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const strengthScore = [hasLength, hasLetter, hasDigit, password.length >= 12].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hasLength || !hasLetter || !hasDigit) {
      setErrorMsg("Parol kamida 10 ta belgi, harf va raqamdan iborat bölişi kerak.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Parollar bir-biriga mos kelmadi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Tiklaş tokeni yaroqsiz yoki muddati ötgan.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/sign-in");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Parolni yangilashda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center py-10 px-4 relative overflow-hidden font-sans select-none transition-colors duration-300 ${
      isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f4fbfe] text-[#03045e]"
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
                : "text-[#03045e] hover:text-emerald-700 bg-white border-[#ade8f4] shadow-xs hover:bg-[#f4fbfe]"
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
          : "bg-white/95 border-[#ade8f4] shadow-[0_25px_80px_rgba(0,153,255,0.06)]"
      }`}>
        {/* Left Hero */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#00ffc8] to-[#00b4d8] text-[#070B14] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center text-2xl mb-6 shadow-sm">
              🛡️
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Yangi Parol Örnatiş
            </h2>
            <p className="text-xs font-bold text-black/75 mt-3 leading-relaxed">
              Kamida 10 ta belgidan iborat, harf va raqam qatnaşgan kuçli parol tanlang.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center w-full py-2.5 px-6 rounded-full border-2 border-black text-black font-extrabold text-xs uppercase tracking-wider hover:bg-black hover:text-white transition"
            >
              Kiriş sahifasiga qaytiş
            </Link>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] text-2xl flex items-center justify-center mx-auto mb-2">
                ✓
              </div>
              <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-[#03045e]"}`}>Parol yangilandi!</h3>
              <p className={`text-xs leading-relaxed max-w-sm mx-auto ${isDark ? "text-white/60" : "text-[#0077b6]"}`}>
                Yangi parolingiz muvaffaqiyatli saqlandi. Kiriş sahifasiga yönaltirilmoqdasiz...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-[#03045e]"}`}>
                  Parolni özgartiş
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-white/50" : "text-[#0077b6]"}`}>
                  Yangi xavfsiz parolni kiriting va tasdiqlang
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className={`text-xs font-bold block ${isDark ? "text-white/70" : "text-[#03045e]"}`}>Yangi parol</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition ${
                      isDark
                        ? "bg-black/40 border-white/10 text-white placeholder-white/30 focus:border-[#00ffc8]"
                        : "bg-[#f4fbfe] border-[#ade8f4] text-[#03045e] placeholder-slate-400 focus:border-[#00d3e0]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-white/50 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}
                  >
                    {showPassword ? "Yaşiriş" : "Köriş"}
                  </button>
                </div>
                {/* Strength meter */}
                <div className="flex gap-1 pt-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        step <= strengthScore
                          ? isDark ? "bg-[#00ffc8]" : "bg-emerald-500"
                          : isDark ? "bg-white/10" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold block ${isDark ? "text-white/70" : "text-[#03045e]"}`}>Parolni tasdiqlang</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition ${
                    isDark
                      ? "bg-black/40 border-white/10 text-white placeholder-white/30 focus:border-[#00ffc8]"
                      : "bg-[#f4fbfe] border-[#ade8f4] text-[#03045e] placeholder-slate-400 focus:border-[#00d3e0]"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 text-[#070B14] font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,255,200,0.3)] transition cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? "Saqlanmoqda..." : "Parolni Saqlaş →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1013]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
