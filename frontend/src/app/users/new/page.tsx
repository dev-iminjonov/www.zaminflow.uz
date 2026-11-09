"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/services/users/userTypes";
import { createUser } from "@/lib/services/users/usersService";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggleButton, useTheme } from "@/context/ThemeContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AddNewUserPage() {
  const router = useRouter();
  const { dashT } = useLanguage();
  const { themeMode, isDark } = useTheme();
  const uT = dashT.userMgmt;

  // Form Fields State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [webAddress, setWebAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("Subscriber");
  const [sendNotification, setSendNotification] = useState(true);

  // Validation & UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  // Validate form before submitting
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!username.trim()) {
      errs.username = "Username is required.";
    } else if (username.length < 3) {
      errs.username = "Username must be at least 3 characters.";
    }

    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!phone.trim() || phone.trim() === "+998") {
      errs.phone = "Contact phone number is required.";
    }

    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters long.";
    } else if (!/(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
      errs.password = "Must contain at least 1 digit and 1 special symbol (!@#$%^&*).";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        webAddress: webAddress.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        sendNotification,
      });

      setSuccessToast(true);
      setTimeout(() => {
        router.push("/users");
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create user.";
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen font-sans antialiased pb-20 relative overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f6fbf8] text-[#081c15]"
      }`}
    >
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

      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#14181d] text-white px-5 py-3 rounded-full shadow-2xl text-xs font-bold border border-[#00ffc8]/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="text-[#00ffc8] text-sm">✓</span>
          <span>User added successfully! Redirecting...</span>
        </div>
      )}

      {/* Frosted ZaminFlow Global Top Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 ${
          isDark ? "bg-[#0d1013]/80 border-white/10" : "bg-white/80 border-[#b7e4c7]/60"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center transition-transform hover:scale-105">
              <ZaminFlowLogo size="md" mode={themeMode} />
            </Link>
            <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isDark ? "border-white/10 text-gray-400 bg-white/5" : "border-[#b7e4c7] text-[#2d6a4f] bg-[#eaf7f0]"
            }`}>
              {uT.addUserTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggleButton size="sm" />
            <Link
              href="/users"
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isDark
                  ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  : "border-[#b7e4c7] bg-white hover:bg-[#b7e4c7]/20 text-[#081c15]"
              }`}
            >
              <span>←</span>
              <span>{uT.title}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center gap-3 pb-6">
          <Link
            href="/users"
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition shadow-xs ${
              isDark
                ? "border-white/15 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
                : "border-[#b7e4c7] bg-white text-[#081c15] hover:bg-[#b7e4c7]/20"
            }`}
            aria-label="Back to users list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {uT.addUserTitle}
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-[#2d6a4f]"}`}>
              {uT.addUserSubtitle}
            </p>
          </div>
        </div>

        {/* 45% Desktop Card (Left-Aligned, styled with ZaminFlow card tokens) */}
        <div
          className={`w-full lg:w-[48%] max-w-xl rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all ${
            isDark
              ? "bg-[#14181d]/90 border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.5)]"
              : "bg-white/95 border-[#b7e4c7]/80 shadow-[0_10px_35px_rgba(0,153,255,0.08)]"
          }`}
        >
          {serverError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-500">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* 1. First Name and Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {uT.firstName} <span className="text-[#00d3e0]">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition outline-none ${
                    errors.firstName
                      ? "border-rose-400 bg-rose-500/10"
                      : isDark
                      ? "bg-[#0d1013] border-white/15 text-white focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                      : "bg-[#f6fbf8] border-[#b7e4c7] text-[#081c15] focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  {uT.lastName} <span className="text-[#00d3e0]">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: "" }));
                  }}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition outline-none ${
                    errors.lastName
                      ? "border-rose-400 bg-rose-500/10"
                      : isDark
                      ? "bg-[#0d1013] border-white/15 text-white focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                      : "bg-[#f6fbf8] border-[#b7e4c7] text-[#081c15] focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* 2. User Name */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {uT.userName} <span className="text-[#00d3e0]">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition outline-none ${
                  errors.username
                    ? "border-rose-400 bg-rose-500/10"
                    : isDark
                    ? "bg-[#0d1013] border-white/15 text-white focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                    : "bg-[#f6fbf8] border-[#b7e4c7] text-[#081c15] focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                }`}
              />
              {errors.username && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.username}</p>
              )}
            </div>

            {/* 3. Web Address */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {uT.webAddress}
              </label>
              <input
                type="url"
                value={webAddress}
                onChange={(e) => setWebAddress(e.target.value)}
                placeholder="https://"
                className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition outline-none ${
                  isDark
                    ? "bg-[#0d1013] border-white/15 text-white placeholder-gray-500 focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                    : "bg-[#f6fbf8] border-[#b7e4c7] text-[#081c15] placeholder-gray-400 focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                }`}
              />
            </div>

            {/* 4. Email Address */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {uT.email} <span className="text-[#00d3e0]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition outline-none ${
                  errors.email
                    ? "border-rose-400 bg-rose-500/10"
                    : isDark
                    ? "bg-[#0d1013] border-white/15 text-white focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                    : "bg-[#f6fbf8] border-[#b7e4c7] text-[#081c15] focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* 5. Contact */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {uT.contact} <span className="text-[#00d3e0]">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="+998 90 123 45 67"
                className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition outline-none ${
                  errors.phone
                    ? "border-rose-400 bg-rose-500/10"
                    : isDark
                    ? "bg-[#0d1013] border-white/15 text-white focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                    : "bg-[#f6fbf8] border-[#b7e4c7] text-[#081c15] focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                }`}
              />
              {errors.phone && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* 6. Password */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {uT.password} <span className="text-[#00d3e0]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`w-full px-4 py-2.5 pr-11 rounded-2xl text-xs sm:text-sm font-semibold border transition outline-none ${
                    errors.password
                      ? "border-rose-400 bg-rose-500/10"
                      : isDark
                      ? "bg-[#0d1013] border-white/15 text-white focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                      : "bg-[#f6fbf8] border-[#b7e4c7] text-[#081c15] focus:border-[#00d3e0] focus:ring-2 focus:ring-[#00d3e0]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00d3e0] transition cursor-pointer p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* 7. Select a Role */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                {uT.selectRole}
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className={`w-full appearance-none px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition cursor-pointer outline-none ${
                    isDark
                      ? "bg-[#0d1013] border-white/15 text-white focus:border-[#00d3e0]"
                      : "bg-[#f6fbf8] border-[#b7e4c7] text-[#081c15] focus:border-[#00d3e0]"
                  }`}
                >
                  <option value="All User">All User</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Editor">Editor</option>
                  <option value="Author">Author</option>
                  <option value="Contributor">Contributor</option>
                  <option value="Subscriber">Subscriber</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  ▼
                </span>
              </div>
            </div>

            {/* 8. Notification Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded-md border-slate-300 dark:border-white/20 text-[#00d3e0] focus:ring-[#00d3e0] accent-[#00d3e0] cursor-pointer"
                />
                <span className={`text-xs font-medium leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {uT.notifyUser}
                </span>
              </label>
            </div>

            {/* 9. Action Button (Right-Aligned Pill) */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] text-xs sm:text-sm font-black shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#070B14] border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>{uT.submitAddUser}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
