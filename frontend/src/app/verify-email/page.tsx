"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import Button from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"VERIFYING" | "SUCCESS" | "ERROR">("VERIFYING");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("ERROR");
        setErrorMsg("Missing verification token in link.");
        return;
      }

      try {
        const res = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Verification token has expired or is invalid.");
        }

        setStatus("SUCCESS");
      } catch (err: any) {
        setStatus("ERROR");
        setErrorMsg(err.message || "Failed to verify email.");
      }
    }

    verify();
  }, [token]);

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
            Email verification & compliance.
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Verifying your official contact email is mandatory before submitting your KYB profile.
          </p>
        </div>
        <div className="relative z-10 hidden lg:block text-xs text-slate-500">
          © 2026 ZaminFlow LLC.
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white">
        <div className="w-full max-w-[400px] space-y-6 text-center">
          {status === "VERIFYING" && (
            <div className="space-y-4 py-8">
              <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h2 className="text-lg font-black text-slate-900">Verifying link...</h2>
              <p className="text-xs text-slate-500 font-mono">
                Authenticating single-use verification token
              </p>
            </div>
          )}

          {status === "SUCCESS" && (
            <div className="space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-2xl mx-auto shadow-xs">
                ✓
              </div>
              <h2 className="text-xl font-black text-slate-900">Email Verified!</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your email has been successfully confirmed. You may now complete your organization profile.
              </p>
              <div className="pt-2">
                <Link
                  href="/farmer/profile"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-[10px] bg-[#047857] hover:bg-[#065F46] text-white font-semibold text-xs transition"
                >
                  Continue to your profile &rarr;
                </Link>
              </div>
            </div>
          )}

          {status === "ERROR" && (
            <div className="space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center text-xl mx-auto">
                ⚠️
              </div>
              <h2 className="text-lg font-black text-slate-900">Verification Link Invalid</h2>
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  &larr; Return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Verifying...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
