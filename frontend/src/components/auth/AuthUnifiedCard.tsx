"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { signIn, signUp, sendSmsOtp, verifySmsOtp } from "@/lib/auth";
import { RoleKey, PUBLIC_SIGNUP_ROLES, sanitizeNextRedirect } from "@/lib/roles";
import { useLanguage } from "@/context/LanguageContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export interface AuthUnifiedCardProps {
  initialMode?: "signin" | "signup";
}

export default function AuthUnifiedCard({ initialMode = "signin" }: AuthUnifiedCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const { locale, setLocale, authT: t } = useLanguage();

  // Mode state: "signin" | "signup"
  const [mode, setMode] = useState<"signin" | "signup">(
    pathname?.includes("sign-up") || pathname?.includes("signup") || initialMode === "signup"
      ? "signup"
      : "signin"
  );

  // Sync mode if URL changes
  useEffect(() => {
    if (pathname?.includes("sign-up") || pathname?.includes("signup")) {
      setMode("signup");
    } else if (pathname?.includes("sign-in") || pathname?.includes("signin")) {
      setMode("signin");
    }
  }, [pathname]);

  const toggleMode = (targetMode: "signin" | "signup") => {
    setMode(targetMode);
    setServerError(null);
    setFieldErrors({});

    const newPath = targetMode === "signup" ? "/sign-up" : "/sign-in";
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
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & Validation
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // SMS Verification Modal States
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [smsPhone, setSmsPhone] = useState("+998 ");
  const [smsStep, setSmsStep] = useState<"phone" | "code">("phone");
  const [smsCode, setSmsCode] = useState("");
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsCountdown, setSmsCountdown] = useState(0);

  useEffect(() => {
    if (smsCountdown <= 0) return;
    const timer = setInterval(() => setSmsCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [smsCountdown]);

  // Handle Sign In submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errors: Record<string, string> = {};

    if (!signInIdentifier.trim()) {
      errors.signInIdentifier = t.errors?.phoneOrEmailRequired || "Telefon yoki email manzilingizni kiriting.";
    }
    if (!signInPassword) {
      errors.signInPassword = t.errors?.passwordRequired || "Parolingizni kiriting.";
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
      setServerError(t.errors?.genericAuthFailed || "Telefon/email yoki parol noto'g'ri. Qayta urinib ko'ring.");
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
      errors.signUpName = t.errors?.fullNameRequired || "To'liq ismingizni kiriting.";
    }
    if (!signUpIdentifier.trim()) {
      errors.signUpIdentifier = t.errors?.phoneOrEmailRequired || "Telefon yoki email manzilingizni kiriting.";
    }
    if (!signUpPassword) {
      errors.signUpPassword = t.errors?.passwordRequired || "Parol kiriting.";
    } else if (signUpPassword.length < 8) {
      errors.signUpPassword = t.errors?.passwordTooShort || "Parol kamida 8 ta belgidan iborat bo'lishi kerak.";
    }
    if (!agreeTerms) {
      errors.agreeTerms = t.errors?.termsRequired || "Foydalanish shartlariga rozilik bildirishingiz kerak.";
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
        roleSpecificField: signUpOrgName || "ZaminFlow Agro Partner",
      });
      const targetDestination = sanitizeNextRedirect(nextParam, session.canonicalRole);
      router.push(targetDestination);
    } catch (err: any) {
      setServerError(t.errors?.alreadyRegistered || "Ushbu ma'lumotlar bilan akkaunt allaqachon mavjud.");
    } finally {
      setIsLoading(false);
    }
  };

  // SMS Flow Handlers
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError(null);
    if (!smsPhone || smsPhone.trim().length < 9) {
      setSmsError("Iltimos, to'liq telefon raqamingizni kiriting.");
      return;
    }

    setSmsLoading(true);
    try {
      await sendSmsOtp(smsPhone);
      setSmsStep("code");
      setSmsCountdown(60);
    } catch (err: any) {
      setSmsError("SMS kod yuborishda xatolik yuz berdi.");
    } finally {
      setSmsLoading(false);
    }
  };

  const handleVerifySms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError(null);
    if (smsCode.trim().length < 6) {
      setSmsError("6 xonali tasdiqlash kodini kiriting.");
      return;
    }

    setSmsLoading(true);
    try {
      const session = await verifySmsOtp(smsPhone, smsCode);
      setIsSmsOpen(false);
      const targetDestination = sanitizeNextRedirect(nextParam, session.canonicalRole);
      router.push(targetDestination);
    } catch (err: any) {
      setSmsError("SMS kodi noto'g'ri yoki muddati o'tgan.");
    } finally {
      setSmsLoading(false);
    }
  };

  const isSignUp = mode === "signup";

  return (
    <div className="min-h-screen w-full bg-[#0d1013] text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 select-none relative font-sans overflow-x-hidden">
      
      {/* 1. TURQUOISE DREAMLAND AMBIENT AURORAS */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[140px] opacity-25"
          style={{
            background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 40%, #0099ff 70%, transparent 100%)",
          }}
        />
      </div>

      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[130px] opacity-20"
          style={{
            background: "radial-gradient(circle, #00d3e0 0%, #0099ff 50%, transparent 100%)",
          }}
        />
      </div>

      {/* 2. TOP FLOATING NAVIGATION BAR */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between mb-8 z-20">
        <Link href="/" className="inline-flex items-center transition-transform hover:scale-105">
          <ZaminFlowLogo mode="dark" size="md" />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <div className="flex rounded-full bg-white/5 p-1 border border-white/10 text-xs font-bold backdrop-blur-md">
            {(["uz", "ru", "en"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`px-3 py-1 rounded-full uppercase transition-all ${
                  locale === loc
                    ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          <Link
            href="/"
            className="px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>←</span>
            <span className="hidden sm:inline">Bosh sahifa</span>
          </Link>
        </div>
      </header>

      {/* 3. MAIN LUXURY BENTO AUTH CARD */}
      <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden bg-[#14181d]/90 backdrop-blur-2xl border border-white/10 shadow-[0_24px_80px_rgba(0,153,255,0.18)] z-10 grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* =========================================================================
            LEFT COLUMN (7 cols): The Interactive Form Area
           ========================================================================= */}
        <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-between">
          
          <div>
            {/* Top Indicator Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/25 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] animate-pulse" />
              <span>MILLIY AGRO & FINTECH PORTALI</span>
            </div>

            {/* Seamless Segmented Pill Switcher (Kirish / Ro'yxatdan o'tish) */}
            <div className="flex p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-8 max-w-md">
              <button
                type="button"
                onClick={() => toggleMode("signin")}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
                  !isSignUp
                    ? "bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] text-[#070B14] shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Kirish
              </button>
              <button
                type="button"
                onClick={() => toggleMode("signup")}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
                  isSignUp
                    ? "bg-gradient-to-r from-[#00d3e0] to-[#0099ff] text-[#070B14] shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Ro'yxatdan o'tish
              </button>
            </div>

            {/* Heading & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                {!isSignUp ? (
                  <>
                    ZaminFlow'ga{" "}
                    <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
                      Xush Kelibsiz!
                    </span>
                  </>
                ) : (
                  <>
                    Yangi Hisob{" "}
                    <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
                      Yarating
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-white/65 mt-2">
                {!isSignUp
                  ? "B2B sut shartnomalari, telematika va kafolatlangan eskrou boshqaruviga kiring."
                  : "O'zbekistonning 450+ fermer va zavodlari bilan bepul savdoni boshlang."}
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-3.5 mb-5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2.5">
                <span>⚠️</span>
                <span>{serverError}</span>
              </div>
            )}

            {/* =======================
                FORM: SIGN IN
               ======================= */}
            {!isSignUp ? (
              <form onSubmit={handleSignInSubmit} className="flex flex-col gap-4 max-w-md">
                
                {/* Identifier (Phone or Email) */}
                <div>
                  <label className="text-xs font-bold text-white/80 mb-1.5 block">
                    Telefon yoki Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      placeholder="+998 90 123 45 67 yoki nom@kompaniya.uz"
                      className="w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm font-medium outline-hidden focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                      ✉
                    </span>
                  </div>
                  {fieldErrors.signInIdentifier && (
                    <span className="text-[11px] text-[#00ffc8] font-semibold mt-1 block">
                      {fieldErrors.signInIdentifier}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-white/80">Parol</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-[#00d3e0] hover:underline"
                    >
                      Parolni unutdingizmi?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showSignInPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Parolingizni kiriting"
                      className="w-full h-12 px-4 pr-11 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm font-medium outline-hidden focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-sm"
                    >
                      {showSignInPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                  {fieldErrors.signInPassword && (
                    <span className="text-[11px] text-[#00ffc8] font-semibold mt-1 block">
                      {fieldErrors.signInPassword}
                    </span>
                  )}
                </div>

                {/* Keep Signed In Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-[#00d3e0] bg-white/5 border-white/20"
                  />
                  <span className="text-xs text-white/70 font-medium">Meni eslab qolish</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-98 text-[#070B14] font-black text-sm tracking-wide shadow-[0_10px_35px_rgba(0,211,224,0.3)] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isLoading ? "Kirilmoqda..." : "Kabinetga Kirish →"}
                </button>

                {/* SMS Quick Option */}
                <button
                  type="button"
                  onClick={() => setIsSmsOpen(true)}
                  className="w-full py-2.5 text-center text-xs font-bold text-[#00d3e0] hover:text-[#00ffc8] transition-colors"
                >
                  📲 SMS kodi orqali tezkor kirish
                </button>
              </form>
            ) : (
              /* =======================
                  FORM: SIGN UP
                 ======================= */
              <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4 max-w-md">
                
                {/* Role Selector Chips */}
                <div>
                  <label className="text-xs font-bold text-white/80 mb-2 block">
                    Men platformada:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PUBLIC_SIGNUP_ROLES.map((cfg) => {
                      const r = cfg.key;
                      const isSelected = signUpRole === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSignUpRole(r)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 ${
                            isSelected
                              ? "bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#070B14] border-transparent shadow-md"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          <span className="text-base">
                            {r === "farmer" ? "🌾" : r === "dairy" ? "🏭" : r === "driver" ? "🚛" : "🏦"}
                          </span>
                          <span className="truncate">
                            {r === "farmer" ? "Fermer" : r === "dairy" ? "Sut Zavodi" : r === "driver" ? "Haydovchi" : "Bank"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-white/80 mb-1.5 block">
                    To'liq ism (F.I.SH)
                  </label>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Masalan: Alisher Qodirov"
                    className="w-full h-11 px-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm font-medium outline-hidden focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20 transition-all"
                  />
                  {fieldErrors.signUpName && (
                    <span className="text-[11px] text-[#00ffc8] font-semibold mt-1 block">
                      {fieldErrors.signUpName}
                    </span>
                  )}
                </div>

                {/* Organization or Plate Number */}
                <div>
                  <label className="text-xs font-bold text-white/80 mb-1.5 block">
                    {signUpRole === "farmer"
                      ? "Ferma yoki Kooperativ nomi"
                      : signUpRole === "dairy"
                      ? "Sut zavodi / Kompaniya nomi"
                      : signUpRole === "driver"
                      ? "Tanker avtomobil raqami (01 A 123 AA)"
                      : "Bank litsenziyasi"}
                  </label>
                  <input
                    type="text"
                    value={signUpOrgName}
                    onChange={(e) => setSignUpOrgName(e.target.value)}
                    placeholder="Masalan: Baraka Agro MCHJ"
                    className="w-full h-11 px-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm font-medium outline-hidden focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20 transition-all"
                  />
                </div>

                {/* Phone or Email */}
                <div>
                  <label className="text-xs font-bold text-white/80 mb-1.5 block">
                    Telefon yoki Email
                  </label>
                  <input
                    type="text"
                    value={signUpIdentifier}
                    onChange={(e) => setSignUpIdentifier(e.target.value)}
                    placeholder="+998 90 123 45 67 yoki nom@kompaniya.uz"
                    className="w-full h-11 px-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm font-medium outline-hidden focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20 transition-all"
                  />
                  {fieldErrors.signUpIdentifier && (
                    <span className="text-[11px] text-[#00ffc8] font-semibold mt-1 block">
                      {fieldErrors.signUpIdentifier}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-bold text-white/80 mb-1.5 block">
                    Parol (kamida 8 ta belgi)
                  </label>
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? "text" : "password"}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Kamida 8 ta belgi"
                      className="w-full h-11 px-4 pr-11 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm font-medium outline-hidden focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-sm"
                    >
                      {showSignUpPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                  {fieldErrors.signUpPassword && (
                    <span className="text-[11px] text-[#00ffc8] font-semibold mt-1 block">
                      {fieldErrors.signUpPassword}
                    </span>
                  )}
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded-md accent-[#00d3e0] bg-white/5 border-white/20"
                  />
                  <span className="text-xs text-white/70 leading-snug">
                    Men{" "}
                    <Link href="/terms" className="text-[#00d3e0] underline">
                      Foydalanish shartlari
                    </Link>{" "}
                    va{" "}
                    <Link href="/privacy" className="text-[#00d3e0] underline">
                      Maxfiylik siyosatiga
                    </Link>{" "}
                    roziman.
                  </span>
                </label>
                {fieldErrors.agreeTerms && (
                  <span className="text-[11px] text-[#00ffc8] font-semibold block">
                    {fieldErrors.agreeTerms}
                  </span>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-98 text-[#070B14] font-black text-sm tracking-wide shadow-[0_10px_35px_rgba(0,211,224,0.3)] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isLoading ? "Ro'yxatdan o'tilmoqda..." : "Bepul Hisob Yaratish →"}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Switcher Note */}
          <div className="pt-6 mt-6 border-t border-white/5 text-xs text-white/60 text-center">
            {!isSignUp ? (
              <>
                ZaminFlow'da hali hisobingiz yo'qmi?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("signup")}
                  className="font-black text-[#00ffc8] hover:underline cursor-pointer"
                >
                  Ro'yxatdan o'ting
                </button>
              </>
            ) : (
              <>
                Allaqachon hisobingiz bormi?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("signin")}
                  className="font-black text-[#00ffc8] hover:underline cursor-pointer"
                >
                  Tizimga kiring
                </button>
              </>
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (5 cols): The Luxury Showcase Bento Card (Desktop Only)
           ========================================================================= */}
        <div className="hidden lg:flex lg:col-span-5 p-8 lg:p-10 bg-gradient-to-br from-[#1a2026] via-[#14181d] to-[#0d1013] border-l border-white/10 flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Mesh */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ffc8]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0099ff]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bento Header */}
          <div className="relative z-10">
            <div className="text-xs font-black tracking-widest uppercase text-[#00d3e0] mb-2">
              REAL VAQTDAGI SUT BOZORI
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white leading-snug">
              Kafolatlangan B2B Sut Zanjiri
            </h3>
            <p className="text-xs text-white/65 mt-2 leading-relaxed">
              450+ fermer xo'jaliklari va yirik sut korxonalari har kuni ZaminFlow orqali savdo qiladi.
            </p>
          </div>

          {/* Showcase Bento Badges */}
          <div className="relative z-10 my-8 flex flex-col gap-3.5">
            {/* Bento Card 1: Cold Chain Telematics */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00ffc8]/20 text-[#00ffc8] flex items-center justify-center text-lg">
                  🚛
                </div>
                <div>
                  <div className="text-[10px] text-white/50 font-bold uppercase">IoT Sovuq Zanjir</div>
                  <div className="text-sm font-extrabold text-white">+3.2°C Nazorati</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/30">
                FAOL
              </span>
            </div>

            {/* Bento Card 2: Escrow Protection */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0099ff]/20 text-[#0099ff] flex items-center justify-center text-lg">
                  🔒
                </div>
                <div>
                  <div className="text-[10px] text-white/50 font-bold uppercase">Bank Himoyasi</div>
                  <div className="text-sm font-extrabold text-white">100% Eskrou To'lov</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#0099ff]/20 text-[#00c5e7] border border-[#0099ff]/30">
                ISO 20022
              </span>
            </div>

            {/* Bento Card 3: Live Market Price */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00ffc8]/10 via-[#00d3e0]/10 to-[#0099ff]/10 border border-[#00d3e0]/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-white/60 font-bold uppercase">Jonli O'rtacha Narx</div>
                <div className="text-lg font-black text-white">
                  4,380 <span className="text-xs text-[#00ffc8]">UZS/L</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#00ffc8]">+12.4% o'sish</span>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/80 italic leading-relaxed">
              “ZaminFlow orqali oylik 120,000 litr sutimizni kafolatlangan narxda va kechikishsiz sotmoqdamiz.”
            </p>
            <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-[#00d3e0]">
              <span>Alisher Qodirov</span>
              <span>•</span>
              <span className="opacity-75">Sayxunobod Baraka MCHJ</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. SMS VERIFICATION MODAL */}
      {isSmsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#14181d] border border-white/15 p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsSmsOpen(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="w-12 h-12 rounded-2xl bg-[#00ffc8]/20 text-[#00ffc8] inline-flex items-center justify-center text-2xl mb-3">
                📲
              </span>
              <h3 className="text-xl font-black text-white">SMS orqali kirish</h3>
              <p className="text-xs text-white/60 mt-1">
                {smsStep === "phone"
                  ? "Telefon raqamingizga 6 xonali tasdiqlash kodi yuboriladi."
                  : `${smsPhone} raqamiga yuborilgan 6 xonali kodni kiriting.`}
              </p>
            </div>

            {smsError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold">
                {smsError}
              </div>
            )}

            {smsStep === "phone" ? (
              <form onSubmit={handleSendSms} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-white/80 mb-1.5 block">Telefon raqam</label>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold outline-hidden focus:border-[#00d3e0]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={smsLoading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs uppercase tracking-wide hover:opacity-95 cursor-pointer shadow-md"
                >
                  {smsLoading ? "Yuborilmoqda..." : "Kodni Yuborish →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifySms} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-white/80 mb-1.5 block">6 xonali kod</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full h-12 text-center tracking-[0.5em] text-lg font-black rounded-xl bg-white/5 border border-white/10 text-[#00ffc8] outline-hidden focus:border-[#00ffc8]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={smsLoading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs uppercase tracking-wide hover:opacity-95 cursor-pointer shadow-md"
                >
                  {smsLoading ? "Tasdiqlanmoqda..." : "Tasdiqlash & Kirish →"}
                </button>
                <div className="flex justify-between items-center text-xs text-white/50 pt-2">
                  <button
                    type="button"
                    onClick={() => setSmsStep("phone")}
                    className="hover:text-white underline"
                  >
                    Raqamni o'zgartirish
                  </button>
                  {smsCountdown > 0 ? (
                    <span>Qayta yuborish: {smsCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendSms}
                      className="text-[#00d3e0] hover:underline font-bold"
                    >
                      Kodni qayta yuborish
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-xs text-white/40 text-center font-medium">
        © {new Date().getFullYear()} ZaminFlow Technologies LLC. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
