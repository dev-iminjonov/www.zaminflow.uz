"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function ReportIssuePage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Form states
  const [category, setCategory] = useState<string>("refrigeration_fault");
  const [severity, setSeverity] = useState<string>("critical");
  const [description, setDescription] = useState<string>("");
  const [photoName, setPhotoName] = useState<string>("compressor_gauge_alarm.jpg");
  const [isSent, setIsSent] = useState(false);
  const [incidentId, setIncidentId] = useState("");

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentId(`INC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsSent(true);
  };

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/driver" className="text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/driver" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/driver/my-trips" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              My trips
            </Link>
            <Link href="/dashboard/driver/route" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Route
            </Link>
            <Link href="/dashboard/driver/history" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              History
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              Driver
            </span>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-[15px] hover:bg-[#12303a] hover:text-white transition cursor-pointer"
            >
              {isSigningOut ? "..." : "Sign out"}
            </button>
          </div>
        </nav>

        {/* Header Row */}
        <header className="flex flex-wrap items-end justify-between gap-5 pt-4">
          <div>
            <div className="text-xs font-bold tracking-[0.08em] text-[#b45309] uppercase mb-1">
              Transit Exception Reporting • Gap #18 Built
            </div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Report Incident / <span className="text-[#b45309]">Transit Delay</span>
            </h1>
          </div>
          <Link
            href="/dashboard/driver"
            className="text-sm font-bold text-[#4d6a60] hover:text-[#17352c] transition"
          >
            ← Back to Overview
          </Link>
        </header>

        {isSent ? (
          <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-8 sm:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#fdf0d2] text-[#7a4b00] flex items-center justify-center text-3xl font-extrabold">
              🚨
            </div>
            <h2 className="text-3xl font-extrabold text-[#17352c]">
              Emergency Dispatch Alert {incidentId} Broadcasted!
            </h2>
            <p className="text-base text-[#4d6a60]">
              Platform operations and destination dairy receiving managers have been notified. Transit SLA countdowns have been paused to protect driver and farmer ratings.
            </p>
            <div className="bg-white/90 rounded-2xl p-4 w-full border border-[#17352c]/10 text-left space-y-1 text-sm font-medium">
              <div>Incident ID: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">{incidentId}</strong></div>
              <div>Category: <strong className="text-[#b45309]">{category}</strong></div>
              <div>Location: <strong>KM 84 on Highway M39 (GPS Lat 40.712, Lon 68.784)</strong></div>
              <div>Support Dispatch: <strong>Backup Refrigerated Tanker Alerted</strong></div>
            </div>
            <div className="pt-4">
              <Link
                href="/dashboard/driver"
                className="bg-[#12303a] text-white rounded-full px-6 min-h-[48px] font-bold text-sm inline-flex items-center justify-center hover:bg-[#087a3c] transition shadow-md"
              >
                Return to Driver Overview →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-7">
            
            {/* Form Fields */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1.6_1_520px] flex flex-col gap-6 box-border">
              
              <div>
                <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                  Incident Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[#17352c]/20 px-4 text-sm font-bold text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                >
                  <option value="refrigeration_fault">Refrigeration Unit Alarm / Temperature Spike (&gt;4.0°C)</option>
                  <option value="mechanical_breakdown">Vehicle Mechanical Breakdown / Flat Tire / Engine Fault</option>
                  <option value="road_obstruction">Severe Highway Blockage / Road Closure Delay</option>
                  <option value="tank_leakage">Tanker Manifold Leakage / Accidental Spillage</option>
                  <option value="farm_delay">Farm Collection Delay (Farm Bulk Tank Not Ready)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "critical", label: "🚨 Critical (Spoilage Risk)" },
                    { id: "warning", label: "⚠️ Warning (>30m Delay)" },
                    { id: "minor", label: "ℹ️ Minor Info" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSeverity(lvl.id)}
                      className={`h-12 rounded-xl text-xs font-bold transition cursor-pointer ${
                        severity === lvl.id
                          ? "bg-[#b45309] text-white"
                          : "bg-white border border-[#17352c]/20 text-[#17352c]"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                  Incident Description & Live Status
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, current engine status, temperature gauge reading, and estimated delay..."
                  className="w-full rounded-xl border border-[#17352c]/20 p-4 text-sm text-[#17352c] bg-white focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4d6a60] uppercase mb-1">
                  Attached Photo Evidence
                </label>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#17352c]/20">
                  <span className="text-xl">📷</span>
                  <span className="text-sm font-semibold text-[#17352c] flex-1">{photoName}</span>
                  <span className="text-xs text-[#087a3c] font-bold">Captured via App</span>
                </div>
              </div>

            </div>

            {/* Right Card: Telemetry Context & Emergency Broadcast CTA */}
            <div className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8 flex-[1_1_340px] flex flex-col justify-between gap-6 box-border">
              <div>
                <div className="text-xs font-bold tracking-[0.08em] text-[#b45309] uppercase">
                  Telemetry Snapshot
                </div>
                <h3 className="text-2xl font-bold text-[#17352c] mt-1 mb-4">
                  Automated Context
                </h3>

                <div className="bg-white/80 rounded-2xl p-5 border border-[#17352c]/10 space-y-2 text-xs">
                  <div>Active Batch: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">ZF-0412 (1,200 L)</strong></div>
                  <div>Driver: <strong>Bobur Rahimov (01 772 AAA)</strong></div>
                  <div>Live Temp: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)] text-amber-700">3.8°C (Warning Threshold)</strong></div>
                  <div>GPS Coordinates: <strong className="font-[family-name:var(--font-jetbrains-mono,monospace)]">40.7128° N, 68.7841° E</strong></div>
                  <div>Nearest Hub: <strong>Guliston Cold Storage (18 km)</strong></div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#b45309] text-white rounded-full min-h-[52px] font-bold text-base hover:bg-[#92400e] transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Broadcast Emergency Dispatch Alert</span>
                <span>🚨</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
