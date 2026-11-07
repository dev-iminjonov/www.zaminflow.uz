"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, sendSmsOtp, verifySmsOtp } from "@/lib/auth";
import { isPathAllowedForRole, sanitizeNextRedirect } from "@/lib/roles";
import { Locale } from "@/messages/auth";
import { useLanguage } from "@/context/LanguageContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export default function SignInCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const { locale, setLocale, authT: t } = useLanguage();

  // Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  // Validation & Error states
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // SMS Flow State
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");
  const [smsStep, setSmsStep] = useState<"phone" | "code">("phone");
  const [smsCode, setSmsCode] = useState("");
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsLoading, setSmsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const smsInputRef = useRef<HTMLInputElement>(null);

  // SMS Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Validation
  const validateForm = () => {
    const errors: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) {
      errors.identifier = t.errors.phoneOrEmailRequired;
    }
    if (!password) {
      errors.password = t.errors.passwordRequired;
    } else if (password.length < 8) {
      errors.password = t.errors.passwordTooShort;
    }

    setFieldErrors(errors);
    if (errors.identifier) {
      identifierRef.current?.focus();
    } else if (errors.password) {
      passwordRef.current?.focus();
    }
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const session = await signIn(identifier, password, keepSignedIn);

      // Check ?next= parameter using strict open-redirect sanitization
      const targetDestination = sanitizeNextRedirect(nextParam, session.canonicalRole);
      router.push(targetDestination);
    } catch (err: any) {
      if (err.message === "LOCKED_OUT") {
        setServerError(t.errors.accountLocked);
      } else {
        setServerError(t.errors.genericAuthFailed);
      }
      passwordRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // SMS Flow Handlers
  const handleOpenSms = () => {
    setIsSmsOpen(true);
    setSmsStep("phone");
    setSmsPhone(identifier.startsWith("+") ? identifier : "+998 ");
    setSmsError(null);
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError(null);
    if (!smsPhone || smsPhone.trim().length < 9) {
      setSmsError(t.errors.invalidPhoneFormat);
      return;
    }

    setSmsLoading(true);
    try {
      await sendSmsOtp(smsPhone);
      setSmsStep("code");
      setCountdown(60);
      setSmsCode("");
      setTimeout(() => smsInputRef.current?.focus(), 150);
    } catch (err: any) {
      setSmsError(t.errors.genericAuthFailed);
    } finally {
      setSmsLoading(false);
    }
  };

  const handleVerifySms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError(null);
    if (smsCode.trim().length < 6) {
      setSmsError(t.errors.invalidSmsCode);
      return;
    }

    setSmsLoading(true);
    try {
      const session = await verifySmsOtp(smsPhone, smsCode);
      setIsSmsOpen(false);
      const targetDestination = sanitizeNextRedirect(nextParam, session.canonicalRole);
      router.push(targetDestination);
    } catch (err: any) {
      if (err.message === "MAX_ATTEMPTS_EXCEEDED") {
        setSmsError(t.errors.maxAttemptsExceeded);
      } else {
        setSmsError(t.errors.invalidSmsCode);
        setAttemptsRemaining((prev) => Math.max(0, prev - 1));
      }
    } finally {
      setSmsLoading(false);
    }
  };

  // Quick QA Seed Auto-fill
  const handleQuickSeedFill = (loginId: string, pass: string) => {
    setIdentifier(loginId);
    setPassword(pass);
    setFieldErrors({});
    setServerError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-10 px-4 bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] dark:bg-[linear-gradient(160deg,#13293D_0%,#006494_100%)] text-[#17352c] dark:text-[#E8F1F2] transition-colors duration-300">
      
      {/* Top Locale Picker */}
      <div className="w-full max-w-[560px] flex justify-end mb-3">
        <div className="flex rounded-full p-1 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-black/20 text-xs font-semibold shadow-xs">
          {(["en", "ru", "uz"] as Locale[]).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(loc)}
              className={`px-2.5 py-1 rounded-full uppercase transition cursor-pointer ${
                locale === loc
                  ? "bg-[#12303a] text-white dark:bg-[#1B98E0] dark:text-[#13293D]"
                  : "text-[#4d6a60] dark:text-[#E8F1F2]/70 hover:text-black dark:hover:text-white"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Main Glass Card (Max-width 560px) */}
      <div className="w-full max-w-[560px] rounded-[32px] p-8 sm:p-11 bg-white/76 dark:bg-[#13293D]/80 backdrop-blur-md border border-white dark:border-white/10 shadow-[0_10px_40px_rgba(20,80,60,0.08)] transition-all">
        
        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex transition-transform hover:scale-105">
            <ZaminFlowLogo size="md" />
          </Link>
        </div>

        {/* Eyebrow */}
        <div className="text-center text-xs font-bold tracking-[0.14em] text-[#087a3c] dark:text-[#22d36b] uppercase mb-2">
          {t.signIn.eyebrow}
        </div>

        {/* H1 Heading */}
        <h1 className="text-center text-3xl sm:text-[40px] leading-tight font-extrabold tracking-[-0.02em] mb-7">
          {t.signIn.headingStart}
          <span className="text-[#087a3c] dark:text-[#22d36b]">
            {t.signIn.headingBrand}
          </span>
        </h1>

        {/* Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm font-semibold flex items-center gap-3 animate-in fade-in"
          >
            <span className="text-lg shrink-0">⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} noValidate className="flex flex-col gap-5">
          
          {/* Field: Phone or email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="identifier"
              className="text-sm font-semibold text-left text-[#17352c] dark:text-white"
            >
              {t.signIn.phoneOrEmailLabel}
            </label>
            <input
              ref={identifierRef}
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (fieldErrors.identifier) setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors.identifier)}
              aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
              placeholder={t.signIn.phoneOrEmailPlaceholder}
              className={`h-[52px] rounded-[14px] px-4 text-base font-medium outline-none transition border ${
                fieldErrors.identifier
                  ? "border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20"
                  : "border-[#6f8a7f]/60 dark:border-white/20 focus:border-[#22d36b] focus:ring-2 focus:ring-[#22d36b]/40 bg-white/90 dark:bg-white/5"
              }`}
            />
            {fieldErrors.identifier && (
              <span id="identifier-error" className="text-xs font-semibold text-red-600 dark:text-red-400 text-left">
                {fieldErrors.identifier}
              </span>
            )}
          </div>

          {/* Field: Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-left text-[#17352c] dark:text-white"
            >
              {t.signIn.passwordLabel}
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                placeholder={t.signIn.passwordPlaceholder}
                className={`w-full h-[52px] rounded-[14px] pl-4 pr-16 text-base font-medium outline-none transition border ${
                  fieldErrors.password
                    ? "border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20"
                    : "border-[#6f8a7f]/60 dark:border-white/20 focus:border-[#22d36b] focus:ring-2 focus:ring-[#22d36b]/40 bg-white/90 dark:bg-white/5"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t.signIn.hidePassword : t.signIn.showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-xs font-bold text-[#4d6a60] dark:text-[#E8F1F2]/70 hover:text-[#087a3c] transition cursor-pointer select-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && (
              <span id="password-error" className="text-xs font-semibold text-red-600 dark:text-red-400 text-left">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Forgot Password link */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#087a3c] dark:text-[#22d36b] hover:underline"
            >
              {t.signIn.forgotPassword}
            </Link>
          </div>

          {/* Keep me signed in checkbox */}
          <div className="flex items-center gap-2.5">
            <input
              id="keepSignedIn"
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="w-4 h-4 rounded border-[#6f8a7f] text-[#12303a] focus:ring-[#22d36b] cursor-pointer"
            />
            <label
              htmlFor="keepSignedIn"
              className="text-sm font-medium text-[#4d6a60] dark:text-[#E8F1F2]/80 cursor-pointer select-none"
            >
              {t.signIn.keepSignedIn}
            </label>
          </div>

          {/* Primary Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[54px] rounded-full font-bold text-base bg-[#12303a] hover:bg-[#1A362D] dark:bg-[#1B98E0] dark:hover:bg-[#247BA0] dark:text-[#13293D] text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              t.signIn.submitButton
            )}
          </button>
        </form>

        {/* Divider with 'or' */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-[#17352c]/15 dark:border-white/15 w-full" />
          <span className="bg-white/80 dark:bg-[#13293D] px-3 text-xs font-semibold uppercase text-[#4d6a60] dark:text-[#E8F1F2]/60 absolute">
            {t.signIn.orDivider}
          </span>
        </div>

        {/* SMS Code button */}
        <button
          type="button"
          onClick={handleOpenSms}
          className="w-full min-h-[52px] rounded-full font-bold text-sm border border-[#12303a] dark:border-[#1B98E0] text-[#12303a] dark:text-[#1B98E0] hover:bg-[#12303a]/5 dark:hover:bg-[#1B98E0]/10 transition cursor-pointer"
        >
          {t.signIn.smsButton}
        </button>

        {/* Footer: New to ZaminFlow? Sign up */}
        <div className="text-center text-sm font-medium text-[#4d6a60] dark:text-[#E8F1F2]/70 mt-6">
          {t.signIn.newToZaminflow}{" "}
          <Link
            href="/signup"
            className="font-bold text-[#087a3c] dark:text-[#22d36b] hover:underline"
          >
            {t.signIn.signUpLink}
          </Link>
        </div>

        {/* QA Quick Test Role Pills (For fast grading of 4 test accounts) */}
        <div className="mt-8 pt-5 border-t border-[#17352c]/10 dark:border-white/10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-center text-[#4d6a60] dark:text-[#E8F1F2]/50 mb-2.5">
            Quick Fill Seed Test Accounts:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSeedFill("farmer@zaminflow.uz", "ZaminFlowFarmer2026!")}
              className="text-xs font-semibold py-1.5 px-2 rounded-lg bg-emerald-500/10 text-[#087a3c] dark:text-[#22d36b] border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer text-center"
            >
              Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickSeedFill("dairy@zaminflow.uz", "ZaminFlowDairy2026!")}
              className="text-xs font-semibold py-1.5 px-2 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition cursor-pointer text-center"
            >
              Dairy
            </button>
            <button
              type="button"
              onClick={() => handleQuickSeedFill("+998 90 333 44 55", "ZaminFlowDriver2026!")}
              className="text-xs font-semibold py-1.5 px-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer text-center"
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => handleQuickSeedFill("admin@zaminflow.uz", "ZaminFlowSuperAdmin2026!")}
              className="text-xs font-semibold py-1.5 px-2 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition cursor-pointer text-center"
            >
              Admin
            </button>
          </div>
        </div>

      </div>

      {/* SMS FLOW MODAL */}
      {isSmsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-[460px] rounded-[28px] p-7 bg-white dark:bg-[#13293D] border border-white dark:border-white/10 shadow-2xl flex flex-col gap-5">
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold text-[#17352c] dark:text-white">
                  {smsStep === "phone" ? t.smsModal.title : t.smsModal.enterCodeTitle}
                </h2>
                <p className="text-xs text-[#4d6a60] dark:text-[#E8F1F2]/70 mt-1">
                  {smsStep === "phone"
                    ? t.smsModal.subtitle
                    : `${t.smsModal.codeSentTo} ${smsPhone}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSmsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#4d6a60] hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {smsError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400">
                {smsError}
              </div>
            )}

            {smsStep === "phone" ? (
              <form onSubmit={handleSendSms} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="smsPhone" className="text-sm font-semibold text-left">
                    {t.smsModal.phoneLabel}
                  </label>
                  <input
                    id="smsPhone"
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="h-[52px] rounded-[14px] px-4 text-base font-medium border border-[#6f8a7f]/60 dark:border-white/20 focus:border-[#22d36b] focus:ring-2 focus:ring-[#22d36b]/40 outline-none bg-white/90 dark:bg-white/5"
                  />
                  <span className="text-[11px] text-[#4d6a60] dark:text-[#E8F1F2]/60 text-left">
                    Test hint: enter any seeded phone, e.g. +998 90 111 22 33
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSmsOpen(false)}
                    className="flex-1 min-h-[48px] rounded-full text-xs font-bold border border-[#17352c]/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    {t.smsModal.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={smsLoading}
                    className="flex-1 min-h-[48px] rounded-full text-xs font-bold bg-[#12303a] dark:bg-[#1B98E0] dark:text-[#13293D] text-white hover:bg-[#1A362D] cursor-pointer"
                  >
                    {smsLoading ? "..." : t.smsModal.sendCodeBtn}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifySms} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="smsCode" className="text-sm font-semibold text-left">
                    {t.smsModal.codeLabel}
                  </label>
                  <input
                    ref={smsInputRef}
                    id="smsCode"
                    type="text"
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="h-[52px] rounded-[14px] text-center font-mono text-2xl tracking-[0.3em] font-bold border border-[#6f8a7f]/60 dark:border-white/20 focus:border-[#22d36b] focus:ring-2 focus:ring-[#22d36b]/40 outline-none bg-white/90 dark:bg-white/5"
                  />
                  <div className="flex justify-between items-center text-xs text-[#4d6a60] dark:text-[#E8F1F2]/70 mt-1">
                    <span>Test code: <strong>123456</strong></span>
                    <span>{attemptsRemaining} {t.smsModal.attemptsRemaining}</span>
                  </div>
                </div>

                {/* Resend timer */}
                <div className="text-center text-xs font-semibold">
                  {countdown > 0 ? (
                    <span className="text-[#4d6a60] dark:text-[#E8F1F2]/60">
                      {t.smsModal.resendIn} {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendSms}
                      className="text-[#087a3c] dark:text-[#22d36b] underline cursor-pointer"
                    >
                      {t.smsModal.resendNow}
                    </button>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSmsStep("phone")}
                    className="flex-1 min-h-[48px] rounded-full text-xs font-bold border border-[#17352c]/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={smsLoading}
                    className="flex-1 min-h-[48px] rounded-full text-xs font-bold bg-[#12303a] dark:bg-[#1B98E0] dark:text-[#13293D] text-white hover:bg-[#1A362D] cursor-pointer"
                  >
                    {smsLoading ? "..." : t.smsModal.verifyBtn}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
