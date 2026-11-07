"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleKey, PUBLIC_SIGNUP_ROLES, ROLES } from "@/lib/roles";
import { signUp } from "@/lib/auth";
import { Locale } from "@/messages/auth";
import { useLanguage } from "@/context/LanguageContext";

export default function SignUpCard() {
  const router = useRouter();

  const { locale, setLocale, authT: t } = useLanguage();

  // Selected Role (default: farmer). Admin is strictly omitted from PUBLIC_SIGNUP_ROLES
  const [selectedRole, setSelectedRole] = useState<RoleKey>("farmer");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [roleSpecificField, setRoleSpecificField] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("tashkent");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Validation & Error states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Field element refs for auto-focus on error
  const fullNameRef = useRef<HTMLInputElement>(null);
  const roleFieldRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLSelectElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  const activeRoleConfig = ROLES[selectedRole];

  // Phone Mask Formatter: +998 XX XXX XX XX
  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (!digits.startsWith("998")) {
      digits = "998" + digits;
    }
    digits = digits.slice(0, 12); // 998 + 9 digits

    let formatted = "+998";
    if (digits.length > 3) formatted += " " + digits.slice(3, 5);
    if (digits.length > 5) formatted += " " + digits.slice(5, 8);
    if (digits.length > 8) formatted += " " + digits.slice(8, 10);
    if (digits.length > 10) formatted += " " + digits.slice(10, 12);

    setPhone(formatted);
    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
  };

  // Keyboard navigation for role radio group (ArrowLeft / ArrowRight)
  const handleRoleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (index + 1) % PUBLIC_SIGNUP_ROLES.length;
      setSelectedRole(PUBLIC_SIGNUP_ROLES[nextIdx].key);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx =
        (index - 1 + PUBLIC_SIGNUP_ROLES.length) % PUBLIC_SIGNUP_ROLES.length;
      setSelectedRole(PUBLIC_SIGNUP_ROLES[prevIdx].key);
    }
  };

  // Password strength score (0 to 4)
  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password) || password.length >= 10;
  const strengthScore = [hasLength, hasLetter, hasDigit, hasSpecial].filter(Boolean).length;

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = t.errors.fullNameRequired;
    }

    if (!roleSpecificField.trim()) {
      errs.roleSpecificField = t.errors.roleFieldRequired;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 12) {
      errs.phone = t.errors.invalidPhoneFormat;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      errs.email = t.errors.invalidEmailFormat;
    }

    if (!region) {
      errs.region = t.errors.regionRequired;
    }

    if (!password) {
      errs.password = t.errors.passwordRequired;
    } else if (password.length < 8) {
      errs.password = t.errors.passwordTooShort;
    } else if (!hasLetter || !hasDigit) {
      errs.password = t.errors.passwordWeak;
    }

    if (!agreeTerms) {
      errs.agreeTerms = t.errors.termsRequired;
    }

    setFieldErrors(errs);

    // Focus first invalid element
    if (errs.fullName) fullNameRef.current?.focus();
    else if (errs.roleSpecificField) roleFieldRef.current?.focus();
    else if (errs.phone) phoneRef.current?.focus();
    else if (errs.email) emailRef.current?.focus();
    else if (errs.region) regionRef.current?.focus();
    else if (errs.password) passwordRef.current?.focus();
    else if (errs.agreeTerms) termsRef.current?.focus();

    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const session = await signUp({
        role: selectedRole,
        fullName,
        roleSpecificField,
        phone,
        email,
        region,
        password,
      });

      // Immediate redirect to that role's dashboard
      router.push(session.dashboardPath);
    } catch (err: any) {
      if (err.message === "EMAIL_TAKEN") {
        setServerError(t.errors.alreadyRegistered);
        emailRef.current?.focus();
      } else if (err.message === "SIGN_UP_FAILED" || !err.message) {
        setServerError(t.errors.genericAuthFailed);
      } else {
        setServerError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-10 px-4 bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] dark:bg-[linear-gradient(160deg,#13293D_0%,#006494_100%)] text-[#17352c] dark:text-[#E8F1F2] transition-colors duration-300">
      
      {/* Top Locale Picker */}
      <div className="w-full max-w-[760px] flex justify-end mb-3">
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

      {/* Main Glass Card (Max-width 760px) */}
      <div className="w-full max-w-[760px] rounded-[32px] p-8 sm:p-11 bg-white/76 dark:bg-[#13293D]/80 backdrop-blur-md border border-white dark:border-white/10 shadow-[0_10px_40px_rgba(20,80,60,0.08)] transition-all">
        
        {/* Eyebrow */}
        <div className="text-center text-xs font-bold tracking-[0.14em] text-[#087a3c] dark:text-[#22d36b] uppercase mb-2">
          {t.signUp.eyebrow}
        </div>

        {/* H1 Heading */}
        <h1 className="text-center text-3xl sm:text-[40px] leading-tight font-extrabold tracking-[-0.02em] mb-7">
          {t.signUp.headingStart}
          <span className="text-[#087a3c] dark:text-[#22d36b]">
            {t.signUp.headingHighlight}
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

        <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-6">
          
          {/* ROLE SELECTOR: "I am a…" */}
          <div className="flex flex-col gap-3">
            <label id="role-radiogroup-label" className="text-[22px] font-semibold text-left text-[#17352c] dark:text-white">
              {t.signUp.roleSelectLabel}
            </label>

            {/* Real Accessible Radio Group with Arrow-Key support */}
            <div
              role="radiogroup"
              aria-labelledby="role-radiogroup-label"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {PUBLIC_SIGNUP_ROLES.map((roleOpt, idx) => {
                const isSelected = selectedRole === roleOpt.key;
                return (
                  <button
                    key={roleOpt.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => {
                      setSelectedRole(roleOpt.key);
                      setRoleSpecificField("");
                    }}
                    onKeyDown={(e) => handleRoleKeyDown(e, idx)}
                    className={`min-h-[50px] rounded-full px-5 py-2.5 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border ${
                      isSelected
                        ? "bg-[#12303a] text-white border-[#12303a] shadow-sm dark:bg-[#1B98E0] dark:text-[#13293D] dark:border-[#1B98E0]"
                        : "bg-white/90 dark:bg-white/5 text-[#12303a] dark:text-[#E8F1F2] border-[#12303a]/30 dark:border-white/20 hover:border-[#12303a] dark:hover:border-[#1B98E0]"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-base leading-none">✓</span>
                    )}
                    <span>{roleOpt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TWO-COLUMN AUTO-FIT GRID (min 210px, 16px gap) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Field 1: Full name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm font-semibold text-left">
                {t.signUp.fullNameLabel}
              </label>
              <input
                ref={fullNameRef}
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.fullName)}
                aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
                placeholder={t.signUp.fullNamePlaceholder}
                className={`h-[52px] rounded-[14px] px-4 text-base font-medium outline-none transition border ${
                  fieldErrors.fullName
                    ? "border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20"
                    : "border-[#6f8a7f]/60 dark:border-white/20 focus:border-[#22d36b] focus:ring-2 focus:ring-[#22d36b]/40 bg-white/90 dark:bg-white/5"
                }`}
              />
              {fieldErrors.fullName && (
                <span id="fullName-error" className="text-xs font-semibold text-red-600 dark:text-red-400 text-left">
                  {fieldErrors.fullName}
                </span>
              )}
            </div>

            {/* Field 2: Role-dependent second field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="roleField" className="text-sm font-semibold text-left">
                {activeRoleConfig.roleFieldLabel}
              </label>
              <input
                ref={roleFieldRef}
                id="roleField"
                type="text"
                value={roleSpecificField}
                onChange={(e) => {
                  setRoleSpecificField(e.target.value);
                  if (fieldErrors.roleSpecificField) setFieldErrors((p) => ({ ...p, roleSpecificField: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.roleSpecificField)}
                aria-describedby={fieldErrors.roleSpecificField ? "roleField-error" : undefined}
                placeholder={activeRoleConfig.roleFieldPlaceholder}
                className={`h-[52px] rounded-[14px] px-4 text-base font-medium outline-none transition border ${
                  fieldErrors.roleSpecificField
                    ? "border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20"
                    : "border-[#6f8a7f]/60 dark:border-white/20 focus:border-[#22d36b] focus:ring-2 focus:ring-[#22d36b]/40 bg-white/90 dark:bg-white/5"
                }`}
              />
              {fieldErrors.roleSpecificField && (
                <span id="roleField-error" className="text-xs font-semibold text-red-600 dark:text-red-400 text-left">
                  {fieldErrors.roleSpecificField}
                </span>
              )}
            </div>

            {/* Field 3: Phone (+998 XX XXX XX XX) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-semibold text-left">
                {t.signUp.phoneLabel}
              </label>
              <input
                ref={phoneRef}
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                placeholder="+998 90 123 45 67"
                className={`h-[52px] rounded-[14px] px-4 text-base font-medium font-mono outline-none transition border ${
                  fieldErrors.phone
                    ? "border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20"
                    : "border-[#6f8a7f]/60 dark:border-white/20 focus:border-[#22d36b] focus:ring-2 focus:ring-[#22d36b]/40 bg-white/90 dark:bg-white/5"
                }`}
              />
              {fieldErrors.phone && (
                <span id="phone-error" className="text-xs font-semibold text-red-600 dark:text-red-400 text-left">
                  {fieldErrors.phone}
                </span>
              )}
            </div>

            {/* Field 4: Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-left">
                {t.signUp.emailLabel}
              </label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                placeholder={t.signUp.emailPlaceholder}
                className={`h-[52px] rounded-[14px] px-4 text-base font-medium outline-none transition border ${
                  fieldErrors.email
                    ? "border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20"
                    : "border-[#6f8a7f]/60 dark:border-white/20 focus:border-[#22d36b] focus:ring-2 focus:ring-[#22d36b]/40 bg-white/90 dark:bg-white/5"
                }`}
              />
              {fieldErrors.email && (
                <span id="email-error" className="text-xs font-semibold text-red-600 dark:text-red-400 text-left">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            {/* Field 5: Region */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="region" className="text-sm font-semibold text-left">
                {t.signUp.regionLabel}
              </label>
              <div className="relative">
                <select
                  ref={regionRef}
                  id="region"
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    if (fieldErrors.region) setFieldErrors((p) => ({ ...p, region: "" }));
                  }}
                  className="w-full h-[52px] rounded-[14px] px-4 pr-10 text-base font-medium outline-none transition border border-[#6f8a7f]/60 dark:border-white/20 focus:border-[#22d36b] focus:ring-2 focus:ring-[#22d36b]/40 bg-white/90 dark:bg-[#13293D] appearance-none cursor-pointer"
                >
                  {Object.entries(t.regions).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs opacity-60">
                  ▾
                </div>
              </div>
              {fieldErrors.region && (
                <span id="region-error" className="text-xs font-semibold text-red-600 dark:text-red-400 text-left">
                  {fieldErrors.region}
                </span>
              )}
            </div>

            {/* Field 6: Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-left">
                {t.signUp.passwordLabel}
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby="password-hint"
                  placeholder={t.signUp.passwordPlaceholder}
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

              {/* Password Strength Indicator */}
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      seg <= strengthScore
                        ? strengthScore <= 2
                          ? "bg-amber-400"
                          : "bg-[#22d36b]"
                        : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span id="password-hint" className="text-[11px] text-[#4d6a60] dark:text-[#E8F1F2]/60 text-left">
                {t.signUp.passwordHint}
              </span>
              {fieldErrors.password && (
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 text-left">
                  {fieldErrors.password}
                </span>
              )}
            </div>

          </div>

          {/* Terms Checkbox */}
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2.5">
              <input
                ref={termsRef}
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (fieldErrors.agreeTerms) setFieldErrors((p) => ({ ...p, agreeTerms: "" }));
                }}
                className="w-4 h-4 mt-0.5 rounded border-[#6f8a7f] text-[#12303a] focus:ring-[#22d36b] cursor-pointer"
              />
              <label
                htmlFor="agreeTerms"
                className="text-sm font-medium text-[#4d6a60] dark:text-[#E8F1F2]/80 text-left cursor-pointer select-none"
              >
                {t.signUp.agreeTermsStart}
                <a href="#terms" className="text-[#087a3c] dark:text-[#22d36b] underline font-semibold">
                  {t.signUp.termsLink}
                </a>
                {t.signUp.and}
                <a href="#privacy" className="text-[#087a3c] dark:text-[#22d36b] underline font-semibold">
                  {t.signUp.privacyLink}
                </a>
              </label>
            </div>
            {fieldErrors.agreeTerms && (
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 text-left pl-6">
                {fieldErrors.agreeTerms}
              </span>
            )}
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
              t.signUp.submitButton
            )}
          </button>

          {/* Footer: Already have an account? Sign in */}
          <div className="text-center text-sm font-medium text-[#4d6a60] dark:text-[#E8F1F2]/70 mt-2">
            {t.signUp.alreadyHaveAccount}{" "}
            <Link
              href="/signin"
              className="font-bold text-[#087a3c] dark:text-[#22d36b] hover:underline"
            >
              {t.signUp.signInLink}
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
}
