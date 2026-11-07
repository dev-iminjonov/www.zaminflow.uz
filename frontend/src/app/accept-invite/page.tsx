"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import Button from "@/components/ui/Button";

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
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (password.length < 10 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg("Password must be at least 10 characters with a letter and a digit.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
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
        throw new Error(err.detail || "Invitation token has expired or is invalid.");
      }

      const data = await res.json();
      const role = data.organization?.role;
      const subRole = data.user?.sub_role;

      if (subRole === "DRIVER") {
        router.push("/driver/queue");
      } else if (subRole === "LAB_TECH" || subRole === "GATE_RECEIVER") {
        router.push("/gate-scanner");
      } else if (role === "BANK") {
        router.push("/bank/dashboard");
      } else {
        router.push("/industry/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to activate invitation.");
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
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-sm shadow-sm">
              Z
            </div>
            <span className="font-extrabold tracking-tight text-lg text-white">ZaminFlow</span>
          </Link>
        </div>
        <div className="relative z-10 my-8 lg:my-auto max-w-md space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
            Team & partner onboarding.
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            You were invited to access an authenticated organization workspace on ZaminFlow.
          </p>
        </div>
        <div className="relative z-10 hidden lg:block text-xs text-slate-500">
          © 2026 ZaminFlow LLC.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white">
        <div className="w-full max-w-[400px] space-y-6">
          <div>
            {/* Invitation summary chip */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold mb-2">
              <span>✉️</span>
              <span>Invited Member Activation</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Activate your account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Set your name and password to finalize your workspace access.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jasur Aliyev"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 px-3.5 text-xs rounded-[10px] border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password *
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
              <span className="text-[10px] text-slate-500 mt-1 block">
                At least 10 characters with a letter and a digit
              </span>
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
              Activate account & sign in &rarr;
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading invite...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
