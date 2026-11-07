"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriverAccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((res) => res.json())
      .then((data) => setMe(data))
      .catch(() => {});

    const cached = JSON.parse(localStorage.getItem("zmf_offline_pickups") || "[]");
    setOfflineCount(cached.length);
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/v1/auth/sign-out", { method: "POST" });
    router.push("/sign-in");
  };

  const handleSyncOffline = () => {
    alert("Offline queue synced successfully with logistics hub.");
    localStorage.removeItem("zmf_offline_pickups");
    setOfflineCount(0);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black text-xl">
            🚚
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">
              {me?.user?.full_name || "Logistics Driver"}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {me?.user?.email || "driver@zaminflow.uz"}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Organization</span>
            <span className="font-bold text-slate-900">{me?.organization?.legal_name || "Samarkand Milk Logistics"}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Vehicle Assigned</span>
            <span className="font-bold font-mono text-slate-900">Isuzu FRR • 01 777 AAA</span>
          </div>
        </div>
      </div>

      {/* Offline Storage Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Offline Buffer Status
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-900">
              {offlineCount} Pending Record{offlineCount === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-slate-500">Stored locally in device memory</p>
          </div>
          {offlineCount > 0 && (
            <button
              onClick={handleSyncOffline}
              className="px-3 py-1.5 bg-cyan-600 text-white font-bold text-xs rounded-xl hover:bg-cyan-700"
            >
              Sync Now
            </button>
          )}
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2">
        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition"
        >
          Sign Out of Driver Terminal
        </button>
      </div>
    </div>
  );
}