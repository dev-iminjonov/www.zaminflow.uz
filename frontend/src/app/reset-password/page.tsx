"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { ThemeToggleButton } from "@/context/ThemeContext";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

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
      setErrorMsg("Parol kamida 10 ta belgi, harf va raqamdan iborat boʻlishi kerak.");
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
        throw new Error(err.detail || "Tiklash tokeni yaroqsiz yoki muddati oʻtgan.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/signin");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Parolni yangilashda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1013] text-white flex flex-col justify-center items-center py-10 px-4 relative overflow-hidden font-sans select-none">
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

      {/* Central Card */}
      <div className="relative z-10 max-w-[920px] w-full bg-[#12161a] rounded-[36px] shadow-[0_25px_80px_rgba(0,153,255,0.22)] border border-white/10 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
        {/* Left Hero */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#00ffc8] to-[#00b4d8] text-[#070B14] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center text-2xl mb-6 shadow-sm">
              🛡️
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Yangi Parol Oʻrnatish
            </h2>
            <p className="text-xs font-bold text-black/75 mt-3 leading-relaxed">
              Kamida 10 ta belgidan iborat, harf va raqam qatnashgan kuchli parol tanlang.
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

        {/* Right Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] text-2xl flex items-center justify-center mx-auto mb-2">
                ✓
              </div>
              <h3 className="text-xl font-black text-white">Parol yangilandi!</h3>
              <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                Yangi parolingiz muvaffaqiyatli saqlandi. Kirish sahifasiga yoʻnaltirilmoqdasiz...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Parolni oʻzgartirish
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Yangi xavfsiz parolni kiriting va tasdiqlang
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">Yangi parol</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:border-[#00ffc8] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white"
                  >
                    {showPassword ? "Yashirish" : "Koʻrish"}
                  </button>
                </div>
                {/* Strength meter */}
                <div className="flex gap-1 pt-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        step <= strengthScore ? "bg-[#00ffc8]" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">Parolni tasdiqlang</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:border-[#00ffc8] outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#00b4d8] hover:opacity-95 text-[#070B14] font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,255,200,0.3)] transition cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? "Saqlanmoqda..." : "Parolni Saqlash →"}
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
