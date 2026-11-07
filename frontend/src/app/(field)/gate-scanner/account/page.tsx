"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GateAccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((res) => res.json())
      .then((data) => setMe(data))
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/v1/auth/sign-out", { method: "POST" });
    router.push("/sign-in");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-xl">
            🔬
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">
              {me?.user?.full_name || "Gate Lab Operator"}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {me?.user?.email || "lab@zaminflow.uz"}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Plant / Facility</span>
            <span className="font-bold text-slate-900">{me?.organization?.legal_name || "Samarkand Processing Plant"}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Terminal ID</span>
            <span className="font-bold font-mono text-slate-900">GATE-INTAKE-01</span>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2">
        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition"
        >
          Sign Out of Intake Terminal
        </button>
      </div>
    </div>
  );
}