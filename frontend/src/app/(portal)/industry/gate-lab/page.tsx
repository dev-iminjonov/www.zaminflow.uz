"use client";

import React, { useMemo, useState } from "react";

export default function GateReceptionAndLabTerminalPage() {
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [gateArrivedAt, setGateArrivedAt] = useState<string | null>("2026-11-07T05:14:22Z");
  const [actualVolume, setActualVolume] = useState("1000.00");
  const [actualFat, setActualFat] = useState("4.00");
  const [actualSnf, setActualSnf] = useState("8.70");
  const [actualTemp, setActualTemp] = useState("3.80");
  const [acidityTurner, setAcidityTurner] = useState("16.50");
  const [antibioticsNegative, setAntibioticsNegative] = useState(true);
  const [settlementResult, setSettlementResult] = useState<string | null>(null);

  const basePrice = 4000.0;
  const stdFat = 3.6;
  const stdSnf = 8.5;
  const alpha = 0.15;
  const beta = 0.1;

  const livePayout = useMemo(() => {
    const v = parseFloat(actualVolume) || 0;
    const f = parseFloat(actualFat) || 0;
    const s = parseFloat(actualSnf) || 0;
    const t = parseFloat(actualTemp) || 0;
    const acid = parseFloat(acidityTurner) || 0;

    const gammaTemp = t <= 4.0 ? 0 : t <= 8.0 ? 0.005 * (t - 4.0) : 0;
    const fatBonus = alpha * (f - stdFat);
    const snfBonus = beta * (s - stdSnf);
    const multiplier = 1 + fatBonus + snfBonus - gammaTemp;
    const pFinal = v * basePrice * multiplier;

    const willFreeze = !antibioticsNegative || acid > 18.0 || t > 8.0;
    return {
      multiplier: multiplier.toFixed(4),
      fatBonusPct: (fatBonus * 100).toFixed(2),
      snfBonusPct: (snfBonus * 100).toFixed(2),
      tempPenaltyPct: (gammaTemp * 100).toFixed(2),
      pFinalUzs: pFinal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      rawPayout: pFinal,
      willFreeze,
    };
  }, [
    actualVolume,
    actualFat,
    actualSnf,
    actualTemp,
    acidityTurner,
    antibioticsNegative,
  ]);

  const handleExecuteRelease = () => {
    if (livePayout.willFreeze) {
      setSettlementResult(
        "CRITICAL INTERLOCK TRIGGERED: Batch escalated to DISPUTE_FROZEN. Escrow payout halted due to sanitary threshold breach. Sample vial dispatched to Central Testing Institute."
      );
    } else {
      setSettlementResult(
        `PAYMENT EXECUTED: Released ${livePayout.pFinalUzs} UZS directly from Factory Escrow Vault to Farmer Settlement Account. Bank ISO 20022 confirmation pacs.008 dispatched.`
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Terminal Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF0] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-[#10182B] text-emerald-400">
              INDUSTRIAL LAB TERMINAL
            </span>
            <span className="text-xs font-mono text-[#64748B]">Bay 02 &bull; Terminal #GATE-881</span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">
            Factory Gate Reception & Chemical Lab Terminal
          </h1>
        </div>

        {/* 3-Stage Tab Switcher */}
        <div className="flex items-center p-1 bg-white rounded-lg border border-[#E5EAF0] shadow-subtle text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCurrentStage(1)}
            className={`px-3 py-1.5 rounded-md transition ${
              currentStage === 1
                ? "bg-[#10182B] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#111827]"
            }`}
          >
            1. Weighbridge Ingest
          </button>
          <button
            type="button"
            onClick={() => setCurrentStage(2)}
            className={`px-3 py-1.5 rounded-md transition ${
              currentStage === 2
                ? "bg-[#10182B] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#111827]"
            }`}
          >
            2. Chemical Titration
          </button>
          <button
            type="button"
            onClick={() => setCurrentStage(3)}
            className={`px-3 py-1.5 rounded-md transition ${
              currentStage === 3
                ? "bg-[#059B72] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#111827]"
            }`}
          >
            3. Escrow Release
          </button>
        </div>
      </div>

      {/* STAGE 1: Weighbridge Ingest & Identification */}
      {currentStage === 1 && (
        <div className="bg-white rounded-card border border-[#E5EAF0] p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Stage 1: Vehicle Tare & Batch Manifest Verification
              </h2>
              <p className="text-xs text-[#64748B]">
                Verify physical tanker custody and match declared volume against weighbridge gross/tare sensors.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              GPS WITHIN BAY 02
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#F5F8FA] border border-[#E5EAF0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Contracted Supplier</span>
              <span className="font-bold text-[#111827] mt-0.5 block">Sirdaryo Agro Dairy LLC</span>
              <span className="text-[10px] text-emerald-700 font-mono">Trust Score: 98.4 pts</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F5F8FA] border border-[#E5EAF0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Refrigerated Tanker</span>
              <span className="font-bold text-[#111827] mt-0.5 block font-mono">01 A 774 GB</span>
              <span className="text-[10px] text-[#64748B] font-mono">Driver: F. Kasimov</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F5F8FA] border border-[#E5EAF0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Reference Vial Code</span>
              <span className="font-mono font-bold text-[#059B72] mt-0.5 block">VIAL-UZ-2026-99412</span>
              <span className="text-[10px] text-slate-500 font-mono">Barcode Intact</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F5F8FA] border border-[#E5EAF0]">
              <span className="text-[10px] text-[#64748B] uppercase block">Gate Arrival Timestamp</span>
              <span className="font-mono font-bold text-[#111827] mt-0.5 block">05:14:22 UZT</span>
              <span className="text-[10px] text-[#059B72] font-mono">On-Time Transit (38m)</span>
            </div>
          </div>

          {/* Weighbridge Tare Controls */}
          <div className="p-4 rounded-lg bg-slate-50 border border-[#E5EAF0] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#111827]">Automated Weighbridge Net Tare Reading (Liters)</span>
              <span className="font-mono font-bold text-[#059B72]">{actualVolume} L</span>
            </div>
            <input
              type="number"
              step="0.5"
              value={actualVolume}
              onChange={(e) => setActualVolume(e.target.value)}
              className="w-full border border-[#E5EAF0] bg-white rounded-lg px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
            />
            <span className="text-[11px] text-[#64748B] block">
              Tare delta vs farm declared volume (1,000.00 L): <strong className="font-mono text-[#111827]">0.00 L</strong> (Within ±0.5% tolerance)
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStage(2)}
              className="px-5 py-2.5 rounded-lg bg-[#10182B] hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition"
            >
              Confirm Weighbridge Tare & Proceed to Lab Analysis &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: Chemical Titration Analysis */}
      {currentStage === 2 && (
        <div className="bg-white rounded-card border border-[#E5EAF0] p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Stage 2: Ultrasonic Chemical Titration & Sanitary Verification
              </h2>
              <p className="text-xs text-[#64748B]">
                MilkoScan / Ekomilk spectrometer telemetry inputs. Safety limits strictly enforced.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
              ANALYZER CALIBRATED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827]">Fat Content (%)</label>
              <input
                type="number"
                step="0.01"
                value={actualFat}
                onChange={(e) => setActualFat(e.target.value)}
                className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
              />
              <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block">
                Bonus: +{livePayout.fatBonusPct}% (Std: 3.60%)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827]">SNF Content (%)</label>
              <input
                type="number"
                step="0.01"
                value={actualSnf}
                onChange={(e) => setActualSnf(e.target.value)}
                className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
              />
              <span className="text-[10px] text-emerald-700 font-mono mt-0.5 block">
                Bonus: +{livePayout.snfBonusPct}% (Std: 8.50%)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827]">Milk Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={actualTemp}
                onChange={(e) => setActualTemp(e.target.value)}
                className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
              />
              <span className="text-[10px] text-[#64748B] font-mono mt-0.5 block">
                {parseFloat(actualTemp) <= 4.0 ? "Optimal (0% penalty)" : `Penalty: -${livePayout.tempPenaltyPct}%`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827]">Acidity (°T Turner)</label>
              <input
                type="number"
                step="0.1"
                value={acidityTurner}
                onChange={(e) => setAcidityTurner(e.target.value)}
                className="w-full border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs font-mono mt-1 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
              />
              <span className="text-[10px] font-mono mt-0.5 block text-slate-500">
                Turner Limit: &le; 18.0 °T
              </span>
            </div>
          </div>

          {/* Antibiotics Safety Switch */}
          <div className="p-4 rounded-lg border border-[#E5EAF0] bg-[#F5F8FA] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#111827]">Rapid Antibiotic Beta-Lactam Residue Test</h3>
              <p className="text-xs text-[#64748B]">Safety interlock: Non-zero residues trigger immediate batch condemnation.</p>
            </div>
            <button
              type="button"
              onClick={() => setAntibioticsNegative(!antibioticsNegative)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                antibioticsNegative
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {antibioticsNegative ? "NEGATIVE (0.0 ppb)" : "POSITIVE (CONTAMINATED)"}
            </button>
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStage(1)}
              className="px-4 py-2 rounded-lg bg-white border border-[#E5EAF0] text-slate-700 font-semibold text-xs transition"
            >
              &larr; Back to Weighbridge
            </button>
            <button
              type="button"
              onClick={() => setCurrentStage(3)}
              className="px-5 py-2.5 rounded-lg bg-[#059B72] hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm transition"
            >
              Lock Titration & Review Settlement &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: Settlement Review & Escrow Release */}
      {currentStage === 3 && (
        <div className="bg-white rounded-card border border-[#E5EAF0] p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Stage 3: Escrow Settlement Calculation & Release
              </h2>
              <p className="text-xs text-[#64748B]">
                Review verified mathematical multiplier and execute bank transfer.
              </p>
            </div>
            <span
              className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold ${
                livePayout.willFreeze
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              {livePayout.willFreeze ? "INTERLOCK: DISPUTE FROZEN" : "CLEAN: SETTLEMENT READY"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#F5F8FA] border border-[#E5EAF0] space-y-1">
              <span className="text-[10px] text-[#64748B] uppercase font-mono">Net Verified Volume</span>
              <span className="text-xl font-mono font-bold text-[#111827] block">{actualVolume} L</span>
              <span className="text-[10px] text-slate-500 font-mono">Weighbridge Locked</span>
            </div>

            <div className="p-4 rounded-lg bg-[#F5F8FA] border border-[#E5EAF0] space-y-1">
              <span className="text-[10px] text-[#64748B] uppercase font-mono">Effective Unit Rate</span>
              <span className="text-xl font-mono font-bold text-[#059B72] block">
                {Math.round(basePrice * parseFloat(livePayout.multiplier)).toLocaleString()} UZS
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">Multiplier: {livePayout.multiplier}x</span>
            </div>

            <div className="p-4 rounded-lg bg-[#10182B] text-white space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Total Verified Payout</span>
              <span className="text-xl font-mono font-bold text-emerald-400 block">{livePayout.pFinalUzs} UZS</span>
              <span className="text-[10px] text-slate-400 font-mono">Partner Bank Escrow</span>
            </div>
          </div>

          {settlementResult && (
            <div
              className={`p-4 rounded-lg text-xs font-semibold ${
                livePayout.willFreeze
                  ? "bg-red-50 text-red-900 border border-red-300"
                  : "bg-emerald-50 text-emerald-950 border border-emerald-300"
              }`}
            >
              {settlementResult}
            </div>
          )}

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentStage(2)}
              className="px-4 py-2 rounded-lg bg-white border border-[#E5EAF0] text-slate-700 font-semibold text-xs transition"
            >
              &larr; Back to Lab Inputs
            </button>
            <button
              type="button"
              onClick={handleExecuteRelease}
              className={`px-6 py-2.5 rounded-lg text-white font-semibold text-xs shadow-sm transition ${
                livePayout.willFreeze
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#059B72] hover:bg-emerald-600"
              }`}
            >
              {livePayout.willFreeze ? "Trigger Dispute Freeze & Seal Vial" : "Execute Escrow Release & Pay Farmer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
