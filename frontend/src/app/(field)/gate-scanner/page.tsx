"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";

type RoleMode = "OWNER" | "GATE_RECEIVER" | "LAB_TECH";

export default function GateScannerPage() {
  const [roleMode, setRoleMode] = useState<RoleMode>("OWNER");
  const [activeTab, setActiveTab] = useState<"A" | "B" | "C">("A");

  // Step A: Gate Arrival & Weighbridge
  const [ticketId] = useState("TKT-2026-UZ-8812");
  const [tankerId] = useState("TNK-UZ-902");
  const [driverName] = useState("Alisher Usmanov");
  const [farmDispatchLiters] = useState<number>(1000);
  const [grossWeightKg, setGrossWeightKg] = useState<number>(14230);
  const [tareWeightKg, setTareWeightKg] = useState<number>(6200);

  // Step B: Chemical Lab Titration
  const [actualLiters, setActualLiters] = useState<number>(1000);
  const [fatPct, setFatPct] = useState<number>(4.0);
  const [snfPct, setSnfPct] = useState<number>(8.7);
  const [tempC, setTempC] = useState<number>(3.2);
  const [acidityTurner, setAcidityTurner] = useState<number>(17.5);
  const [antibioticsZero, setAntibioticsZero] = useState<boolean>(true);
  const [referenceVialBarcode] = useState("VIAL-9921-REF");
  const [sealRetained, setSealRetained] = useState<boolean>(true);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [executionMessage, setExecutionMessage] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  // Specific gravity for raw milk: 1.030 kg/L
  const calculatedGateLiters = Math.max(0, Math.round((grossWeightKg - tareWeightKg) / 1.03));
  const volumeDeltaPct = farmDispatchLiters > 0
    ? (((actualLiters - farmDispatchLiters) / farmDispatchLiters) * 100).toFixed(2)
    : "0.00";

  // Dynamic Payout Formula reproducing benchmark:
  // Base 4,000 UZS/L. Alpha = 0.15, Beta = 0.10.
  // Standard Fat: 3.60%, Standard SNF: 8.50%.
  // If Fat = 4.00% -> bonus = 0.15 * (4.00 - 3.60) = +0.06 (+6%)
  // If SNF = 8.70% -> bonus = 0.10 * (8.70 - 8.50) = +0.02 (+2%)
  // Multiplier = 1 + 0.06 + 0.02 = 1.0800x
  // Unit price = 4,000 * 1.0800 = 4,320.00 UZS
  // Total payout = 1,000 L * 4,320.00 = 4,320,000.00 UZS
  const payout = useMemo(() => {
    const baseRate = 4000;
    const alpha = 0.15;
    const beta = 0.10;

    const fatBonus = alpha * (fatPct - 3.6);
    const snfBonus = beta * (snfPct - 8.5);
    const tempPenalty = tempC <= 4.0 ? 0 : 0.01 * (tempC - 4.0);

    const isRejected = !antibioticsZero || tempC > 8.0 || acidityTurner > 21.0;
    const multiplier = isRejected ? 0 : Math.max(0.6, 1 + fatBonus + snfBonus - tempPenalty);
    const unitPrice = Math.round(baseRate * multiplier);
    const totalPayout = actualLiters * unitPrice;

    return {
      baseRate,
      fatBonus,
      snfBonus,
      tempPenalty,
      multiplier,
      unitPrice,
      totalPayout,
      isRejected,
    };
  }, [fatPct, snfPct, tempC, acidityTurner, antibioticsZero, actualLiters]);

  const handleExecuteRelease = () => {
    setShowConfirmModal(false);
    setExecutionMessage({
      type: "success",
      text: `Escrow release executed: ${payout.totalPayout.toLocaleString()} UZS released from Toshkent Dairy escrow vault to Baraka Dairy Farm settlement IBAN. Double-entry ledger journal updated.`,
    });
  };

  const handleExecuteReject = () => {
    setShowRejectModal(false);
    setExecutionMessage({
      type: "danger",
      text: `Batch #${ticketId} rejected. Escrow frozen (DISPUTE_FROZEN). Reference sample vial ${referenceVialBarcode} queued for independent arbitration.`,
    });
  };

  return (
    <div className="space-y-4 pb-12 max-w-4xl mx-auto">
      {/* Dark Terminal Top Bar */}
      <div className="rounded-xl bg-navy-950 text-white p-3.5 px-4 shadow-float border border-navy-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                Toshkent Dairy • Gate 2 • Lab terminal
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                GATE SENSOR ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Terminal ID: <span className="text-slate-200">GATE-LAB-02B</span> &bull; Shift Tech: <span className="text-slate-200">Sh. Rakhimov</span>
            </p>
          </div>
        </div>

        {/* Role Mode Simulator Switcher */}
        <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-lg border border-navy-700 text-[11px]">
          <span className="text-slate-400 px-2 font-mono">Terminal View:</span>
          <button
            onClick={() => {
              setRoleMode("OWNER");
              setActiveTab("A");
            }}
            className={`px-2.5 py-1 rounded font-medium transition ${
              roleMode === "OWNER"
                ? "bg-emerald-600 text-white font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Plant Owner (All)
          </button>
          <button
            onClick={() => {
              setRoleMode("GATE_RECEIVER");
              setActiveTab("A");
            }}
            className={`px-2.5 py-1 rounded font-medium transition ${
              roleMode === "GATE_RECEIVER"
                ? "bg-emerald-600 text-white font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Gate Receiver (Step A)
          </button>
          <button
            onClick={() => {
              setRoleMode("LAB_TECH");
              setActiveTab("B");
            }}
            className={`px-2.5 py-1 rounded font-medium transition ${
              roleMode === "LAB_TECH"
                ? "bg-emerald-600 text-white font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Lab Tech (Steps B &amp; C)
          </button>
        </div>
      </div>

      {executionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-start justify-between gap-3 ${
            executionMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-950"
              : "bg-red-50 border border-red-300 text-red-950"
          }`}
        >
          <span>{executionMessage.text}</span>
          <button
            onClick={() => setExecutionMessage(null)}
            className="text-slate-400 hover:text-slate-700 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* 3-Step Touch Navigation Bar */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center">
        {(roleMode === "OWNER" || roleMode === "GATE_RECEIVER") && (
          <button
            onClick={() => setActiveTab("A")}
            className={`min-h-[48px] rounded-lg transition flex flex-col items-center justify-center ${
              activeTab === "A"
                ? "bg-navy-950 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>Step A: Gate Arrival</span>
            <span className="text-[10px] font-mono opacity-80">Weighbridge &amp; Ingest</span>
          </button>
        )}
        {(roleMode === "OWNER" || roleMode === "LAB_TECH") && (
          <button
            onClick={() => setActiveTab("B")}
            className={`min-h-[48px] rounded-lg transition flex flex-col items-center justify-center ${
              activeTab === "B"
                ? "bg-navy-950 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>Step B: Lab Titration</span>
            <span className="text-[10px] font-mono opacity-80">Fat &bull; SNF &bull; Antibiotics</span>
          </button>
        )}
        {(roleMode === "OWNER" || roleMode === "LAB_TECH") && (
          <button
            onClick={() => setActiveTab("C")}
            className={`min-h-[48px] rounded-lg transition flex flex-col items-center justify-center ${
              activeTab === "C"
                ? "bg-navy-950 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>Step C: Payout &amp; Release</span>
            <span className="text-[10px] font-mono opacity-80">Dynamic Quality Engine</span>
          </button>
        )}
      </div>

      {/* STEP A: GATE ARRIVAL & WEIGHBRIDGE */}
      {activeTab === "A" && (roleMode === "OWNER" || roleMode === "GATE_RECEIVER") && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <span className="font-bold text-xs uppercase text-slate-700 tracking-wider">
                Tanker Reception &bull; Weighbridge Ingest
              </span>
              <p className="text-xs text-slate-500">
                Verify physical tanker QR handshake and automated weighbridge sensors.
              </p>
            </div>
            <StatusPill status="DELIVERY_PENDING" />
          </div>

          {/* Manifest Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Ticket #</span>
              <span className="font-mono font-bold text-slate-900">{ticketId}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Tanker Unit</span>
              <span className="font-mono font-bold text-navy-900">{tankerId}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Driver</span>
              <span className="font-semibold text-slate-900">{driverName}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Unloading Timer</span>
              <span className="font-mono font-bold text-emerald-700">00:18:42</span>
            </div>
          </div>

          {/* Weighbridge Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gross Tanker Weight (kg) &bull; Weighbridge 02
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={grossWeightKg}
                onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                className="w-full h-14 rounded-xl border border-slate-300 px-4 font-mono text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Full tanker on scale</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tare Empty Tanker Weight (kg) &bull; Certified
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={tareWeightKg}
                onChange={(e) => setTareWeightKg(Number(e.target.value))}
                className="w-full h-14 rounded-xl border border-slate-300 px-4 font-mono text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Vehicle tare weight</span>
            </div>
          </div>

          {/* Weight to Volume Calculation Tile */}
          <div className="p-4 bg-navy-950 text-white rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block">
                Net Milk Intake (Density &rho; = 1.030 kg/L)
              </span>
              <div className="font-mono text-2xl font-black text-white mt-0.5">
                {calculatedGateLiters.toLocaleString()}{" "}
                <span className="text-sm font-normal text-teal-300">Liters</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Farm Dispatch Manifest</span>
              <span className="font-mono text-sm font-bold text-slate-200">
                {farmDispatchLiters.toLocaleString()} L
              </span>
              <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">
                Variance: {calculatedGateLiters - farmDispatchLiters >= 0 ? "+" : ""}
                {(calculatedGateLiters - farmDispatchLiters)} L (
                {(((calculatedGateLiters - farmDispatchLiters) / farmDispatchLiters) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>

          {roleMode === "OWNER" && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => {
                  setActualLiters(calculatedGateLiters);
                  setActiveTab("B");
                }}
              >
                Confirm Gate Ingest &amp; Proceed to Lab Titration &rarr;
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP B: CHEMICAL LAB TITRATION */}
      {activeTab === "B" && (roleMode === "OWNER" || roleMode === "LAB_TECH") && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <span className="font-bold text-xs uppercase text-slate-700 tracking-wider">
                Spectrometer Chemical &amp; Safety Analysis
              </span>
              <p className="text-xs text-slate-500">
                Record certified fat, SNF, temperature, acidity, and antibiotic safety interlock.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              Vial #{referenceVialBarcode}
            </span>
          </div>

          {/* Actual Volume Check */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Verified Intake Volume (Liters)
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={actualLiters}
                onChange={(e) => setActualLiters(Number(e.target.value))}
                className="w-full h-12 rounded-xl border border-slate-300 px-4 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-4 top-3.5 text-xs font-mono text-slate-500">
                Delta: {volumeDeltaPct}% vs dispatch
              </span>
            </div>
          </div>

          {/* 4 Laboratory Metric Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Milk Fat % <span className="text-[10px] text-slate-400 font-mono">(Std 3.60%)</span>
              </label>
              <input
                type="number"
                step="0.05"
                inputMode="decimal"
                value={fatPct}
                onChange={(e) => setFatPct(Number(e.target.value))}
                className="w-full h-12 rounded-xl border border-slate-300 px-3 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] font-mono text-emerald-700 mt-0.5 block">
                Bonus: +{(0.15 * (fatPct - 3.6) * 100).toFixed(2)}%
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                SNF Solids % <span className="text-[10px] text-slate-400 font-mono">(Std 8.50%)</span>
              </label>
              <input
                type="number"
                step="0.05"
                inputMode="decimal"
                value={snfPct}
                onChange={(e) => setSnfPct(Number(e.target.value))}
                className="w-full h-12 rounded-xl border border-slate-300 px-3 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] font-mono text-emerald-700 mt-0.5 block">
                Bonus: +{(0.10 * (snfPct - 8.5) * 100).toFixed(2)}%
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Temperature (°C) <span className="text-[10px] text-slate-400 font-mono">(Max 4.0°C)</span>
              </label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={tempC}
                onChange={(e) => setTempC(Number(e.target.value))}
                className={`w-full h-12 rounded-xl border px-3 font-mono text-base font-bold focus:outline-none ${
                  tempC > 4.0
                    ? "border-amber-400 bg-amber-50 text-amber-900"
                    : "border-slate-300 text-slate-900"
                }`}
              />
              <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                {tempC <= 4.0 ? "Compliant" : `Penalty: -${(0.01 * (tempC - 4.0) * 100).toFixed(2)}%`}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Acidity (°T) <span className="text-[10px] text-slate-400 font-mono">(Std 16–18°T)</span>
              </label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={acidityTurner}
                onChange={(e) => setAcidityTurner(Number(e.target.value))}
                className={`w-full h-12 rounded-xl border px-3 font-mono text-base font-bold focus:outline-none ${
                  acidityTurner > 19.0
                    ? "border-red-400 bg-red-50 text-red-900"
                    : "border-slate-300 text-slate-900"
                }`}
              />
              <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                {acidityTurner <= 19.0 ? "Fresh" : "Elevated acidity"}
              </span>
            </div>
          </div>

          {/* Large Pass/Fail Antibiotics Interlock */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">
              Beta-Lactam &amp; Tetracycline Antibiotic Rapid Strip Test (0.0 ppb Limit)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAntibioticsZero(true)}
                className={`min-h-[48px] rounded-xl font-bold text-xs border transition flex items-center justify-center gap-2 ${
                  antibioticsZero
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span>✓ PASS — NEGATIVE (0.0 ppb)</span>
              </button>
              <button
                type="button"
                onClick={() => setAntibioticsZero(false)}
                className={`min-h-[48px] rounded-xl font-bold text-xs border transition flex items-center justify-center gap-2 ${
                  !antibioticsZero
                    ? "bg-red-600 text-white border-red-700 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span>✕ FAIL — POSITIVE RESIDUE DETECTED</span>
              </button>
            </div>
          </div>

          {/* Chain of Custody Reference Sample Card */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-950 uppercase text-[11px] tracking-wide">
                  REFERENCE VIAL SEALED AND RETAINED
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-teal-600 text-white rounded font-bold">
                  TAMPER-EVIDENT #0912
                </span>
              </div>
              <p className="text-teal-800 text-[11px]">
                Physical reference sample retained for 72h split-sample arbitration in cooling chamber #3 (+3.0°C).
              </p>
            </div>
            <label className="flex items-center gap-2 text-teal-950 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={sealRetained}
                onChange={(e) => setSealRetained(e.target.checked)}
                className="w-4 h-4 rounded border-teal-400 text-teal-600 focus:ring-teal-500"
              />
              <span>Vial Chain Confirmed</span>
            </label>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setActiveTab("C")}
            >
              Review Dynamic Payout &amp; Escrow Settlement &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* STEP C: PAYOUT PREVIEW & ESCROW RELEASE */}
      {activeTab === "C" && (roleMode === "OWNER" || roleMode === "LAB_TECH") && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <span className="font-bold text-xs uppercase text-slate-700 tracking-wider">
                Dynamic Quality Payout Preview &bull; Formula v3.0
              </span>
              <p className="text-xs text-slate-500">
                P_final = P_base &times; [1 + &alpha;(Fat - 3.60) + &beta;(SNF - 8.50) - TempPenalty]
              </p>
            </div>
            {payout.isRejected ? (
              <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 text-xs font-mono font-bold border border-red-300">
                SAFETY LIMIT EXCEEDED
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold border border-emerald-300">
                ALL SAFETY CHECKS PASS
              </span>
            )}
          </div>

          {/* Benchmark Reproduction Navy Card */}
          <div className="bg-navy-950 text-white rounded-2xl p-6 text-center shadow-float relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block">
              Total Escrow Disbursement
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-black text-white mt-1.5 tracking-tight tabular-nums">
              {payout.totalPayout.toLocaleString()}{" "}
              <span className="text-lg font-normal text-emerald-400">UZS</span>
            </div>
            <div className="text-xs font-mono text-slate-300 mt-2">
              {actualLiters.toLocaleString()} L &times; {payout.unitPrice.toLocaleString()} UZS/L (
              {payout.multiplier.toFixed(4)}x Quality Multiplier)
            </div>
          </div>

          {/* Detailed Formula Factor Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Base Milk Rate</span>
              <span className="font-bold text-slate-900">{payout.baseRate.toLocaleString()} UZS/L</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Fat Bonus (&alpha;=0.15)</span>
              <span className="font-bold text-emerald-700">
                +{((payout.fatBonus) * 100).toFixed(2)}% (+{(payout.baseRate * payout.fatBonus).toFixed(0)} UZS)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">SNF Bonus (&beta;=0.10)</span>
              <span className="font-bold text-emerald-700">
                +{((payout.snfBonus) * 100).toFixed(2)}% (+{(payout.baseRate * payout.snfBonus).toFixed(0)} UZS)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Cold-Chain Penalty</span>
              <span className="font-bold text-slate-700">
                {payout.tempPenalty === 0 ? "0.00% (Compliant)" : `-${(payout.tempPenalty * 100).toFixed(2)}%`}
              </span>
            </div>
          </div>

          {/* Settlement Instruction Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wide block">
              Automated Double-Entry Escrow Instruction
            </span>
            <div className="flex flex-wrap items-center justify-between text-slate-600 font-mono text-[11px] gap-2 pt-1 border-t border-slate-200">
              <div>
                Debit: <span className="font-bold text-slate-900">VAULT:ToshkentDairy</span>
              </div>
              <div>
                Credit: <span className="font-bold text-emerald-700">FARMER:BarakaDairy (IBAN #UZ90...4102)</span>
              </div>
              <div>
                Vault Escrow Ref: <span className="text-slate-900">ESC-UZ-8812</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              variant="danger"
              size="lg"
              onClick={() => setShowRejectModal(true)}
            >
              ✕ Reject Batch &amp; Freeze Escrow for Review
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={payout.isRejected}
              onClick={() => setShowConfirmModal(true)}
            >
              ✓ Confirm Lab Intake &amp; Release Payment
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-float border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Automated Escrow Release
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                You are about to authorize the irreversible release of{" "}
                <span className="font-mono font-bold text-slate-900">
                  {payout.totalPayout.toLocaleString()} UZS
                </span>{" "}
                to Baraka Dairy Farm for batch #{ticketId}.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
              <div>Volume: {actualLiters.toLocaleString()} L</div>
              <div>Fat: {fatPct.toFixed(2)}% | SNF: {snfPct.toFixed(2)}%</div>
              <div>Antibiotics: Zero (0.0 ppb) Passed</div>
              <div>Ref Sample: #{referenceVialBarcode} Sealed</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleExecuteRelease}
              >
                Execute Release Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection / Dispute Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-float border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-lg font-bold">
              ✕
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reject Batch &amp; Freeze Escrow
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                This action will mark batch #{ticketId} as <span className="font-mono font-bold text-red-700">DISPUTE_FROZEN</span>.
                The escrow funds will remain locked in the bank vault, and reference sample vial #{referenceVialBarcode} will be sent for third-party arbitration.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowRejectModal(false)}
              >
                Back to Lab Screen
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleExecuteReject}
              >
                Freeze Escrow for Arbitration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
