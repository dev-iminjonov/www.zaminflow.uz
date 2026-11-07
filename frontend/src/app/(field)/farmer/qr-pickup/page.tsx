"use client";

import React, { useEffect, useState } from "react";
import LockedDashboard from "@/components/LockedDashboard";
import Button from "@/components/ui/Button";

export default function FarmerQrPickupPage() {
  const [me, setMe] = useState<any>(null);
  const [volume, setVolume] = useState<number>(850);
  const [temp, setTemp] = useState<number>(3.2);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((res) => res.json())
      .then((data) => {
        setMe(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500 font-mono">Loading QR terminal...</div>;
  }

  if (me?.organization?.kyb_status !== "VERIFIED") {
    return (
      <LockedDashboard
        role="FARMER"
        kybStatus={me?.organization?.kyb_status || "INCOMPLETE"}
        percent={me?.completion?.percent || 40}
        missing={me?.completion?.missing || ["tax_id", "location"]}
        emailVerified={me?.user?.email_verified}
        profilePath="/farmer/profile"
      />
    );
  }

  const isTempCritical = temp > 8.0;
  const isTempWarning = temp > 4.0 && temp <= 8.0;

  const batchId = "PICKUP / 261106 / 014";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Offline Pickup QR Dispatch</h1>
        <p className="text-xs text-slate-500">
          Present this token to the tanker driver at your farm cooling vat.
        </p>
      </div>

      {/* Inputs per Section 10.3 */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Batch Volume (L) *
            </label>
            <input
              type="number"
              step="10"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
              className="w-full h-11 px-3 text-base font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Milk Temp (°C) *
            </label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value) || 0)}
              className={`w-full h-11 px-3 text-base font-mono font-bold rounded-xl border focus:outline-none ${
                isTempCritical
                  ? "border-red-500 text-red-600 bg-red-50"
                  : isTempWarning
                  ? "border-amber-500 text-amber-600 bg-amber-50"
                  : "border-slate-200 text-slate-900"
              }`}
            />
          </div>
        </div>

        {/* Temperature hints and validation */}
        {isTempWarning && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
            ⚠️ Above 4.0 °C a cold-chain price deduction of 0.5% per degree applies.
          </div>
        )}

        {isTempCritical && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
            ⛔ Above 8.0 °C the milk cannot be collected under state sanitary regulations.
          </div>
        )}
      </div>

      {/* QR Card (Dark Navy per Section 10.3) */}
      {!isTempCritical && (
        <div className="rounded-[20px] bg-[#0F172A] border border-slate-800 text-white p-5 shadow-float space-y-4 text-center">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
            <span className="font-mono text-teal-400 font-bold">{batchId}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              ACTIVE TOKEN
            </span>
          </div>

          {/* High contrast QR code tile */}
          <div className="p-4 bg-white rounded-2xl inline-block shadow-md border-2 border-slate-100">
            <div className="w-44 h-44 bg-white flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-12 h-12 border-4 border-slate-950 flex items-center justify-center">
                  <div className="w-6 h-6 bg-slate-950" />
                </div>
                <div className="w-12 h-12 border-4 border-slate-950 flex items-center justify-center">
                  <div className="w-6 h-6 bg-slate-950" />
                </div>
              </div>
              <div className="flex justify-around items-center">
                <div className="w-5 h-5 bg-slate-950" />
                <div className="w-8 h-8 bg-slate-950 rounded-sm" />
                <div className="w-5 h-5 bg-slate-950" />
              </div>
              <div className="flex justify-between">
                <div className="w-12 h-12 border-4 border-slate-950 flex items-center justify-center">
                  <div className="w-6 h-6 bg-slate-950" />
                </div>
                <div className="w-12 h-12 bg-slate-950" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-xs font-mono space-y-1 text-left">
            <div className="flex justify-between text-slate-400">
              <span>Destination:</span>
              <span className="text-white font-bold">Toshkent Dairy JSC</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pickup Window:</span>
              <span className="text-amber-400 font-bold">Today 09:00 – 10:30 (55 min left)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pickup Geofence:</span>
              <span className="text-emerald-400 font-bold">500 m perimeter active</span>
            </div>
          </div>

          {/* Collapsible Signed Dispatch Details */}
          <div className="pt-1">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
            >
              {showDetails ? "▲ Hide signed dispatch payload" : "▼ Signed dispatch details"}
            </button>

            {showDetails && (
              <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-left text-slate-300 break-all space-y-1">
                <div>Algorithm: HMAC-SHA256</div>
                <div>Farm STIR: 309482110</div>
                <div>Volume: {volume} L | Temp: {temp} C</div>
                <div>Signature: 8f4e2b8c9d01...b72e09</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? "✓ Copied" : "Save QR to device"}
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => alert("Regenerated new dynamic token with updated sensor readings. The earlier code is now expired.")}
            >
              Regenerate readings
            </Button>
          </div>
        </div>
      )}

      {/* Reminder that the driver will seal a reference sample */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
        <span className="text-base">🧪</span>
        <div>
          <span className="font-bold text-slate-900 block">Split-Sample Chain of Custody</span>
          <span>The tanker driver will scan this token and seal a physical barcoded reference vial from your vat for tamper-evident dispute protection.</span>
        </div>
      </div>
    </div>
  );
}
