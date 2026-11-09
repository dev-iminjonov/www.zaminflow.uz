"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { ThemeToggleButton } from "@/context/ThemeContext";

function AcceptInviteContent() {
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
      setErrorMsg("Iltimos, toʻliq ism-sharifingizni kiriting.");
      return;
    }

    if (password.length < 10 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg("Parol kamida 10 ta belgi, harf va raqamdan iborat boʻlishi kerak.");
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
        throw new Error(err.detail || "Taklifnoma tokeni muddati oʻtgan yoki yaroqsiz.");
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
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Hisobingizni sozlang
              </h3>
              <p className="text-xs text-white/50 mt-1">
                F.I.SH va xavfsiz parolingizni belgilang
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/70 block">Toʻliq ism-sharifingiz</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Abdulla Qodiriy"
                className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:border-[#00ffc8] outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/70 block">Parol (kamida 10 ta belgi)</label>
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
