"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { signIn, signUp } from "@/lib/auth";
import { RoleKey, PUBLIC_SIGNUP_ROLES, sanitizeNextRedirect } from "@/lib/roles";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, ThemeToggleButton } from "@/context/ThemeContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export interface SlidingAuthCardProps {
  initialMode?: "signin" | "signup";
}

export default function SlidingAuthCard({ initialMode = "signin" }: SlidingAuthCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const { locale, setLocale, authT: t } = useLanguage();
  const { themeMode, isDark } = useTheme();

  // Mode state: false = Sign In (State A), true = Sign Up (State B / right-panel-active)
  const [isSignUp, setIsSignUp] = useState<boolean>(
    pathname?.includes("sign-up") || pathname?.includes("signup") || initialMode === "signup"
  );

  // Sync mode if URL changes
  useEffect(() => {
    if (pathname?.includes("sign-up") || pathname?.includes("signup")) {
      setIsSignUp(true);
    } else if (pathname?.includes("sign-in") || pathname?.includes("signin")) {
      setIsSignUp(false);
    }
  }, [pathname]);

  const setPanelMode = (signUpActive: boolean) => {
    setIsSignUp(signUpActive);
    setServerError(null);
    setFieldErrors({});

    const newPath = signUpActive ? "/sign-up" : "/sign-in";
    if (window.history.pushState) {
      window.history.pushState(null, "", newPath);
    }
  };

  // Sign In Form States
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  // Sign Up Form States
  const [signUpRole, setSignUpRole] = useState<RoleKey>("farmer");
  const [signUpName, setSignUpName] = useState("");
  const [signUpIdentifier, setSignUpIdentifier] = useState("");
  const [signUpOrgName, setSignUpOrgName] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Status & Validation
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [socialToast, setSocialToast] = useState<string | null>(null);

  const handleSocialClick = (provider: string) => {
    setSocialToast(`${provider} orqali ulanmoqda...`);
    setTimeout(() => setSocialToast(null), 2500);
  };

  // Handle Sign In submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errors: Record<string, string> = {};

    if (!signInIdentifier.trim()) {
      errors.signInIdentifier = "Email yoki telefon raqamingizni kiriting.";
    }
    if (!signInPassword) {
      errors.signInPassword = "Parolingizni kiriting.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const session = await signIn(signInIdentifier, signInPassword, keepSignedIn);
      const targetDestination = sanitizeNextRedirect(nextParam, session.canonicalRole);
      router.push(targetDestination);
    } catch (err: any) {
      setServerError("Telefon/email yoki parol notöğri. Qayta urinib köring.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errors: Record<string, string> = {};

    if (!signUpName.trim()) {
      errors.signUpName = "Töliq ismingizni kiriting.";
    }
    if (!signUpIdentifier.trim()) {
      errors.signUpIdentifier = "Email yoki telefon kiriting.";
    }
    if (!signUpPassword) {
      errors.signUpPassword = "Parol kiriting.";
    } else if (signUpPassword.length < 8) {
      errors.signUpPassword = "Kamida 8 ta belgi bölişi lozim.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const session = await signUp({
        role: signUpRole,
        fullName: signUpName,
        phone: signUpIdentifier.startsWith("+") ? signUpIdentifier : "+998 90 123 45 67",
        email: signUpIdentifier.includes("@") ? signUpIdentifier : `${signUpName.toLowerCase().replace(/\s+/g, "")}@zaminflow.uz`,
        region: "tashkent",
        password: signUpPassword,
        roleSpecificField: signUpOrgName || "ZaminFlow Agro Hamkor",
      });
      const targetDestination = sanitizeNextRedirect(nextParam, session.canonicalRole);
      router.push(targetDestination);
    } catch (err: any) {
      setServerError("Ushbu ma'lumotlar bilan akkaunt allaqachon mavjud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 select-none relative font-sans overflow-x-hidden transition-colors duration-300 ${
      isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f4fbfe] text-[#03045e]"
    }`}>
      
      {/* 1. CREATIVE TURQUOISE DREAMLAND BACKGROUND AURORAS */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-25 animate-pulse"
          style={{
            background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 40%, transparent 70%)",
          }}
        />
      </div>

      <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-25 animate-pulse"
          style={{
            background: "radial-gradient(circle, #00d3e0 0%, #0099ff 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Subtle Grid Canvas Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00d3e0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* 2. TOP FLOATING NAVIGATION BAR */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between mb-8 z-30">
        <Link href="/" className="inline-flex items-center gap-2 transition-transform hover:scale-105">
          <ZaminFlowLogo mode={themeMode} size="sm" />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <div className={`flex rounded-full p-1 border text-xs font-bold backdrop-blur-md ${
            isDark ? "bg-white/5 border-white/10" : "bg-white border-[#ade8f4] shadow-xs"
          }`}>
            {(["uz", "ru", "en"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`px-3 py-1 rounded-full uppercase transition-all ${
                  locale === loc
                    ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black shadow-md"
                    : isDark ? "text-white/60 hover:text-white" : "text-[#0077b6] hover:text-[#03045e]"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Theme Mode Toggle Button */}
          <ThemeToggleButton size="sm" />

          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isDark
                ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                : "border-[#ade8f4] bg-white hover:bg-[#ade8f4]/20 text-[#03045e] shadow-xs"
            }`}
          >
            <span>←</span>
            <span className="hidden sm:inline">Bosh sahifa</span>
          </Link>
        </div>
      </header>

      {/* Social Toast Notification */}
      {socialToast && (
        <div className="fixed top-20 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] text-xs font-black shadow-2xl animate-in fade-in">
          {socialToast}
        </div>
      )}

      {/* =========================================================================
          3. MASTER LUXURY SLIDING AUTH CARD (Accurate Double-Transform Architecture)
         ========================================================================= */}
      <div
        className={`relative w-full max-w-[840px] min-h-[520px] rounded-[32px] overflow-hidden border z-10 transition-all ${
          isDark
            ? "bg-[#14181d] border-white/10 shadow-[0_25px_80px_rgba(0,153,255,0.22)]"
            : "bg-white border-[#ade8f4] shadow-[0_10px_35px_rgba(0,153,255,0.08)]"
        } ${isSignUp ? "right-panel-active" : ""}`}
      >
        
        {/* =======================================================================
            FORM 1: SIGN IN CONTAINER (Desktop Left Half, moves right on slide)
           ======================================================================= */}
        <div
          className={`absolute top-0 left-0 w-full md:w-1/2 h-full z-10 transition-all duration-700 ease-in-out p-8 sm:p-11 flex flex-col justify-center items-center text-center ${
            isSignUp
              ? "md:translate-x-full opacity-0 pointer-events-none"
              : "translate-x-0 opacity-100 pointer-events-auto"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(.68,-0.05,.27,1.05)" }}
        >
          <div className="w-full max-w-sm flex flex-col items-center">
            <h1 className={`text-3xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              Tizimga Kirish
            </h1>

            {/* Social Icons (Google & Telegram only - exact official vector SVG icons) */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => handleSocialClick("Google")}
                title="Google orqali kirish"
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white hover:border-[#00d3e0] hover:shadow-[0_0_15px_rgba(0,211,224,0.3)]"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-xs"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick("Telegram")}
                title="Telegram orqali kirish"
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  isDark
                    ? "border-white/10 bg-white/5 text-[#00d3e0] hover:text-[#00ffc8] hover:border-[#00d3e0] hover:shadow-[0_0_15px_rgba(0,211,224,0.3)]"
                    : "border-slate-200 bg-slate-50 text-sky-600 hover:bg-slate-100 shadow-xs"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.17 3.35-1.37 3.72-1.38.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
                </svg>
              </button>
            </div>

            <p className={`text-[11px] mb-5 font-medium ${isDark ? "text-white/50" : "text-slate-500"}`}>
              yoki telefon / email orqali kiring
            </p>

            {serverError && !isSignUp && (
              <div className="w-full mb-3 p-2.5 text-xs rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-semibold">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSignInSubmit} className="w-full flex flex-col gap-3">
              <div>
                <input
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="Telefon yoki Email"
                  className={`w-full h-11 px-4 rounded-xl border text-xs sm:text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                {fieldErrors.signInIdentifier && !isSignUp && (
                  <span className={`text-[10px] font-bold block text-left mt-0.5 ${isDark ? "text-[#00ffc8]" : "text-emerald-700"}`}>
                    {fieldErrors.signInIdentifier}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showSignInPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Parol"
                  className={`w-full h-11 px-4 pr-10 rounded-xl border text-xs sm:text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}
                >
                  {showSignInPassword ? "🙈" : "👁"}
                </button>
                {fieldErrors.signInPassword && !isSignUp && (
                  <span className={`text-[10px] font-bold block text-left mt-0.5 ${isDark ? "text-[#00ffc8]" : "text-emerald-700"}`}>
                    {fieldErrors.signInPassword}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs mt-1">
                <label className={`flex items-center gap-2 cursor-pointer ${isDark ? "text-white/60" : "text-slate-600"}`}>
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm accent-emerald-500"
                  />
                  <span>Eslab qolish</span>
                </label>
                <Link
                  href="/forgot-password"
                  className={`font-semibold hover:underline ${isDark ? "text-[#00d3e0] hover:text-[#00ffc8]" : "text-emerald-700 hover:text-emerald-800"}`}
                >
                  Parolni unutdingizmi?
                </Link>
              </div>

              {/* Primary Turquoise Dreamland Pill */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-98 text-[#070B14] font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(0,211,224,0.35)] transition-all mt-2 cursor-pointer"
              >
                {isLoading ? "Kirilmoqda..." : "KIRISH →"}
              </button>
            </form>

            {/* Mobile Toggle Link */}
            <div className={`md:hidden mt-6 text-xs ${isDark ? "text-white/60" : "text-slate-600"}`}>
              Hisobingiz yo'qmi?{" "}
              <button
                type="button"
                onClick={() => setPanelMode(true)}
                className={`font-black underline ${isDark ? "text-[#00ffc8]" : "text-emerald-700"}`}
              >
                Ro'yxatdan o'tish
              </button>
            </div>
          </div>
        </div>

        {/* =======================================================================
            FORM 2: SIGN UP CONTAINER (Slides into right half on active)
           ======================================================================= */}
        <div
          className={`absolute top-0 left-0 w-full md:w-1/2 h-full z-10 transition-all duration-700 ease-in-out p-8 sm:p-10 flex flex-col justify-center items-center text-center ${
            isSignUp
              ? "md:translate-x-full opacity-100 pointer-events-auto z-20"
              : "translate-x-0 opacity-0 pointer-events-none z-0"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(.68,-0.05,.27,1.05)" }}
        >
          <div className="w-full max-w-sm flex flex-col items-center">
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              Hisob Yaratish
            </h2>

            {/* Role Selector Chips (Centered 3 equal items filling the pill with equal flex) */}
            <div className={`w-full max-w-[340px] mx-auto mb-4 p-1 rounded-full border shadow-inner flex items-center justify-center gap-1 ${
              isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
            }`}>
              {PUBLIC_SIGNUP_ROLES.map((cfg) => {
                const r = cfg.key;
                const isSelected = signUpRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSignUpRole(r)}
                    className={`flex-1 py-1.5 px-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-200 text-center flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] shadow-md font-black"
                        : isDark ? "text-white/60 hover:text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {r === "farmer" ? "Fermer" : r === "dairy" ? "Zavod" : "Haydovchi"}
                  </button>
                );
              })}
            </div>

            {serverError && isSignUp && (
              <div className="w-full mb-3 p-2 text-xs rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-semibold">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="w-full flex flex-col gap-2.5">
              <div>
                <input
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="To'liq ism (F.I.SH)"
                  className={`w-full h-10 px-3.5 rounded-xl border text-xs sm:text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                {fieldErrors.signUpName && isSignUp && (
                  <span className={`text-[10px] font-bold block text-left mt-0.5 ${isDark ? "text-[#00ffc8]" : "text-emerald-700"}`}>
                    {fieldErrors.signUpName}
                  </span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={signUpOrgName}
                  onChange={(e) => setSignUpOrgName(e.target.value)}
                  placeholder={
                    signUpRole === "farmer"
                      ? "Ferma yoki Kooperativ nomi"
                      : signUpRole === "dairy"
                      ? "Sut zavodi nomi"
                      : signUpRole === "driver"
                      ? "Tanker davlat raqami"
                      : "Bank bo'limi"
                  }
                  className={`w-full h-10 px-3.5 rounded-xl border text-xs sm:text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
              </div>

              <div>
                <input
                  type="text"
                  value={signUpIdentifier}
                  onChange={(e) => setSignUpIdentifier(e.target.value)}
                  placeholder="Telefon yoki Email"
                  className={`w-full h-10 px-3.5 rounded-xl border text-xs sm:text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                {fieldErrors.signUpIdentifier && isSignUp && (
                  <span className={`text-[10px] font-bold block text-left mt-0.5 ${isDark ? "text-[#00ffc8]" : "text-emerald-700"}`}>
                    {fieldErrors.signUpIdentifier}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showSignUpPassword ? "text" : "password"}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Parol (kamida 8 ta belgi)"
                  className={`w-full h-10 px-3.5 pr-10 rounded-xl border text-xs sm:text-sm font-medium outline-hidden transition-all ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}
                >
                  {showSignUpPassword ? "🙈" : "👁"}
                </button>
                {fieldErrors.signUpPassword && isSignUp && (
                  <span className={`text-[10px] font-bold block text-left mt-0.5 ${isDark ? "text-[#00ffc8]" : "text-emerald-700"}`}>
                    {fieldErrors.signUpPassword}
                  </span>
                )}
              </div>

              {/* Primary Turquoise Dreamland Pill */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-98 text-[#070B14] font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(0,211,224,0.35)] transition-all mt-1 cursor-pointer"
              >
                {isLoading ? "Yaratilmoqda..." : "RO'YXATDAN O'TISH →"}
              </button>
            </form>

            {/* Mobile Toggle Link */}
            <div className={`md:hidden mt-4 text-xs ${isDark ? "text-white/60" : "text-slate-600"}`}>
              Hisobingiz bormi?{" "}
              <button
                type="button"
                onClick={() => setPanelMode(false)}
                className={`font-black underline ${isDark ? "text-[#00ffc8]" : "text-emerald-700"}`}
              >
                Kirish
              </button>
            </div>
          </div>
        </div>

        {/* =======================================================================
            OVERLAY CONTAINER (Accurate 50% width sliding frame with 200% inner overlay)
           ======================================================================= */}
        <div
          className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-30 ${
            isSignUp ? "-translate-x-full" : "translate-x-0"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(.68,-0.05,.27,1.05)" }}
        >
          {/* Inner 200% wide Turquoise Dreamland Gradient Surface */}
          <div
            className={`relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out text-[#070B14] ${
              isSignUp ? "translate-x-1/2" : "translate-x-0"
            }`}
            style={{
              background: "linear-gradient(135deg, #00ffc8 0%, #00d3e0 45%, #0099ff 100%)",
              transitionTimingFunction: "cubic-bezier(.68,-0.05,.27,1.05)",
            }}
          >
            {/* Ambient Particle Mesh & Waves */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10 pointer-events-none" />

            {/* -------------------------------------------------------------
                OVERLAY LEFT (Visible when panel moves to Left / Sign Up mode)
               ------------------------------------------------------------- */}
            <div
              className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-center text-center px-10 transition-transform duration-700 ease-in-out ${
                isSignUp ? "translate-x-0" : "-translate-x-[20%]"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(.68,-0.05,.27,1.05)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#070B14]/15 border border-[#070B14]/20 flex items-center justify-center text-2xl mb-4 shadow-inner">
                🥛
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight mb-2">
                Qaytganingiz
                <br />
                Bilan!
              </h2>
              <p className="text-xs text-[#070B14]/80 leading-relaxed font-semibold max-w-xs mb-8">
                ZaminFlow orqali sut savdosi, IoT logistika va bank eskrou operatsiyalarini davom ettiring.
              </p>
              <button
                type="button"
                onClick={() => setPanelMode(false)}
                className="px-8 py-3 rounded-full border-2 border-[#070B14] bg-transparent hover:bg-[#070B14] hover:text-white active:scale-95 text-[#070B14] font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg"
              >
                KIRISH
              </button>
            </div>

            {/* -------------------------------------------------------------
                OVERLAY RIGHT (Visible when panel is on Right / Sign In mode)
               ------------------------------------------------------------- */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-center text-center px-10 transition-transform duration-700 ease-in-out ${
                isSignUp ? "translate-x-[20%]" : "translate-x-0"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(.68,-0.05,.27,1.05)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#070B14]/15 border border-[#070B14]/20 flex items-center justify-center text-2xl mb-4 shadow-inner">
                ⚡
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight mb-2">
                ZaminFlow'ga
                <br />
                Qo'shiling!
              </h2>
              <p className="text-xs text-[#070B14]/80 leading-relaxed font-semibold max-w-xs mb-8">
                450+ fermer va sut zavodlari bilan to'g'ridan-to'g'ri bog'laning va bepul ro'yxatdan o'ting.
              </p>
              <button
                type="button"
                onClick={() => setPanelMode(true)}
                className="px-8 py-3 rounded-full border-2 border-[#070B14] bg-transparent hover:bg-[#070B14] hover:text-white active:scale-95 text-[#070B14] font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg"
              >
                RO'YXATDAN O'TISH
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 4. FOOTER NOTE */}
      <footer className="mt-8 text-xs text-white/40 text-center font-medium">
        © {new Date().getFullYear()} ZaminFlow Technologies LLC. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
