"use client";

import React, { useState } from "react";

interface PayoutPreviewProps {
  initialVolume?: number;
  initialBasePrice?: number;
  initialFat?: number;
  initialSnf?: number;
  initialTemp?: number;
  editable?: boolean;
}

export default function PayoutPreviewPanel({
  initialVolume = 1000,
  initialBasePrice = 4000,
  initialFat = 4.00,
  initialSnf = 8.70,
  initialTemp = 3.8,
  editable = true,
}: PayoutPreviewProps) {
  const [volume, setVolume] = useState(initialVolume);
  const [basePrice, setBasePrice] = useState(initialBasePrice);
  const [fat, setFat] = useState(initialFat);
  const [snf, setSnf] = useState(initialSnf);
  const [temp, setTemp] = useState(initialTemp);

  // Constants
  const stdFat = 3.60;
  const stdSnf = 8.50;
  const alpha = 0.15; // +1.5% price for every +0.1% fat
  const beta = 0.10;

  // Temperature deduction: 0.5% per degree above 4.0 C
  const tempExcess = Math.max(0, temp - 4.0);
  const tempDeductionPct = tempExcess * 0.005;

  const fatDelta = fat - stdFat;
  const snfDelta = snf - stdSnf;

  const fatAdjustmentPct = alpha * fatDelta;
  const snfAdjustmentPct = beta * snfDelta;

  const multiplier = Math.max(0, 1 + fatAdjustmentPct + snfAdjustmentPct - tempDeductionPct);
  const adjustedPricePerLiter = Math.round(basePrice * multiplier);
  const totalPayout = Math.round(volume * basePrice * multiplier);

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-slate-800 text-white p-5 shadow-float space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
            02 / DYNAMIC QUALITY PRICING
          </span>
          <h3 className="text-sm font-extrabold text-white">Live Payout Preview</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
          {multiplier.toFixed(4)}x MULTIPLIER
        </span>
      </div>

      {editable && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Volume (L)
            </label>
            <input
              type="number"
              step="10"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Base Price (UZS)
            </label>
            <input
              type="number"
              step="50"
              value={basePrice}
              onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Fat % (std 3.60)
            </label>
            <input
              type="number"
              step="0.05"
              value={fat}
              onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-emerald-400 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              SNF % (std 8.50)
            </label>
            <input
              type="number"
              step="0.05"
              value={snf}
              onChange={(e) => setSnf(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-emerald-400 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Inflow Temp (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white text-xs"
            />
          </div>
        </div>
      )}

      {/* Itemized Calculation Breakdown */}
      <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs font-mono">
        <div className="flex justify-between text-slate-400">
          <span>Base Value ({volume.toLocaleString()} L × {basePrice.toLocaleString()} UZS):</span>
          <span>{(volume * basePrice).toLocaleString()} UZS</span>
        </div>
        <div className="flex justify-between text-emerald-400">
          <span>Fat Bonus ({(fatDelta >= 0 ? "+" : "") + (fatAdjustmentPct * 100).toFixed(2)}%):</span>
          <span>+{(volume * basePrice * fatAdjustmentPct).toLocaleString()} UZS</span>
        </div>
        <div className="flex justify-between text-emerald-400">
          <span>SNF Bonus ({(snfDelta >= 0 ? "+" : "") + (snfAdjustmentPct * 100).toFixed(2)}%):</span>
          <span>+{(volume * basePrice * snfAdjustmentPct).toLocaleString()} UZS</span>
        </div>
        {tempExcess > 0 && (
          <div className="flex justify-between text-amber-400">
            <span>Temp Penalty (-{(tempDeductionPct * 100).toFixed(2)}%):</span>
            <span>-{(volume * basePrice * tempDeductionPct).toLocaleString()} UZS</span>
          </div>
        )}
        <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline font-bold">
          <span className="text-white uppercase text-[11px]">Final Settled Payout:</span>
          <span className="text-emerald-400 text-lg font-mono font-black">
            {totalPayout.toLocaleString()} UZS
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 font-sans">
        Calculated per SRS §4.2: alpha 0.15 = +1.5% price for every +0.1% fat above standard 3.60%.
      </p>
    </div>
  );
}
