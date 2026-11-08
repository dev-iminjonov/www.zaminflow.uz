"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import Button from "@/components/ui/Button";
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
      setErrorMsg("Password must be at least 10 characters with a letter and a digit.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
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
        throw new Error(err.detail || "Reset token expired or invalid.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/sign-in");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F8FAFC]">
      {/* Left Cinematic Panel */}
      <div className="bg-[#070B14] p-8 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none animate-breathing-glow" />
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center">
            <ZaminFlowLogo mode="dark" size="md" />
          </Link>
        </div>
        <div className="relative z-10 my-8 lg:my-auto max-w-md space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
            Set your new credentials.
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Choose a strong password with at least 10 characters, including letters and numbers.
          </p>
        </div>
        <div className="relative z-10 hidden lg:block text-xs text-slate-500">
          © 2026 ZaminFlow LLC.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white dark:bg-[#101E27] relative transition-colors">
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggleButton />
        </div>
        <div className="w-full max-w-[400px] space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create new password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your new password will replace existing session credentials across all devices.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {errorMsg}
              <div className="mt-2">
                <Link href="/forgot-password" className="font-bold underline text-red-800">
                  Request a new link &rarr;
                </Link>
              </div>
            </div>
          )}

          {isSuccess ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mx-auto">
                ✓
              </div>
              <p className="text-xs text-emerald-950 font-bold">
                Password updated successfully.
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Redirecting to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-teal-700 font-semibold hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs rounded-[10px] border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-600"
                />

                <div className="mt-2 space-y-1">
                  <div className="grid grid-cols-4 gap-1.5 h-1">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className={`rounded-full h-1 transition ${
                          strengthScore >= seg ? "bg-emerald-600" : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    At least 10 characters with a letter and a digit
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs rounded-[10px] border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isLoading}
                className="w-full mt-2"
              >
                Update password &rarr;
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
