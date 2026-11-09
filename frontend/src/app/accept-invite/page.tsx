"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { ThemeToggleButton, useTheme } from "@/context/ThemeContext";

function AcceptInviteContent() {
  const { themeMode, isDark } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Iltimos, töliq ism-şarifingizni kiriting.");
      return;
    }

    if (password.length < 10 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg("Parol kamida 10 ta belgi, harf va raqamdan iborat bölişi kerak.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Parollar bir-biriga mos kelmadi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, full_name: fullName, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Taklifnoma tokeni muddati ötgan yoki yaroqsiz.");
      }

      const data = await res.json();
      const role = data.organization?.role;
      const subRole = data.user?.sub_role;

      if (subRole === "DRIVER") {
        router.push("/dashboard/driver");
      } else if (role === "INDUSTRY") {
        router.push("/dashboard/dairy");
      } else if (role === "BANK") {
        router.push("/dashboard/bank");
      } else if (role === "ADMIN") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/farmer");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Taklifnomani qabul qilishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

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
            href="/signin"
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition ${
              isDark
                ? "text-white/70 hover:text-white bg-white/5 border-white/10 hover:bg-white/10"
                : "text-[#081c15] bg-white border-[#b7e4c7] shadow-xs hover:bg-[#b7e4c7]/20"
            }`}
          >
            ← Kirish sahifasiga
          </Link>
        </div>
      </div>

      {/* Central Card */}
      <div className={`relative z-10 max-w-[920px] w-full rounded-[36px] border overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px] ${
        isDark
          ? "bg-[#14181d] border-white/10 shadow-[0_25px_80px_rgba(0,153,255,0.22)]"
          : "bg-white border-[#b7e4c7] shadow-[0_10px_35px_rgba(0,153,255,0.06)]"
      }`}>
        {/* Left Hero */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#00ffc8] to-[#00b4d8] text-[#070B14] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center text-2xl mb-6 shadow-sm">
              🤝
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Taklifnomani Qabul Qilish
            </h2>
            <p className="text-xs font-bold text-black/75 mt-3 leading-relaxed">
              ZaminFlow raqamli sut savdosi va eskoru ekotizimiga rasman xush kelibsiz.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center w-full py-2.5 px-6 rounded-full border-2 border-black text-black font-extrabold text-xs uppercase tracking-wider hover:bg-black hover:text-white transition"
            >
              Mavjud hisobga kirish
            </Link>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Hisobingizni sozlang
              </h3>
              <p className={`text-xs mt-1 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                F.I.SH va xavfsiz parolingizni belgilang
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className={`text-xs font-bold block ${isDark ? "text-white/70" : "text-slate-700"}`}>Töliq ism-şarifingiz</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Abdulla Qodiriy"
                className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder-white/30 focus:border-[#00ffc8]"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold block ${isDark ? "text-white/70" : "text-slate-700"}`}>Parol (kamida 10 ta belgi)</label>
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
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-white/50 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}
                >
                  {showPassword ? "Yashirish" : "Köriş"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold block ${isDark ? "text-white/70" : "text-slate-700"}`}>Parolni tasdiqlang</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition ${
                  isDark
                    ? "bg-black/40 border-white/10 text-white placeholder-white/30 focus:border-[#00ffc8]"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#00b4d8] hover:opacity-95 text-[#070B14] font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,255,200,0.3)] transition cursor-pointer uppercase tracking-wider mt-2"
            >
              {isLoading ? "Faollashtirilmoqda..." : "Taklifnomani Faollashtirish →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1013]" />}>
      <AcceptInviteContent />
    </Suspense>
  );
}
