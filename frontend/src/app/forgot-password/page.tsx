"use client";

import Link from "next/link";
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { ThemeToggleButton } from "@/context/ThemeContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Ignored per security rules: always display the confirmation message
    } finally {
      setIsLoading(false);
      setSubmitted(true);
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
            Account recovery & access security.
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Password recovery tokens are cryptographically generated and expire in 15 minutes.
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
              Reset password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your account email to receive reset instructions.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                If that email has an account, a reset link is on its way.
              </p>
              <div className="pt-2">
                <Link
                  href="/sign-in"
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  &larr; Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs rounded-[10px] border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isLoading}
                className="w-full"
              >
                Send reset link &rarr;
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/sign-in"
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  &larr; Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
