"use client";

import React, { useState } from "react";

export default function AdminDisputesPage() {
  const [certUrl, setCertUrl] = useState(
    "https://zaminflow.uz/certs/independent-lab-vial-99412.pdf"
  );
  const [bindingFat, setBindingFat] = useState("3.90");
  const [bindingSnf, setBindingSnf] = useState("8.65");
  const [bindingTemp, setBindingTemp] = useState("3.90");
  const [bindingAcidity, setBindingAcidity] = useState("16.8");
  const [bindingVolume, setBindingVolume] = useState("998.50");
  const [dishonestParty, setDishonestParty] = useState<"INDUSTRY" | "FARMER">(
    "INDUSTRY"
  );
  const [verdictStatus, setVerdictStatus] = useState<"DISPUTE_FROZEN" | "RESOLVED_SPLIT">(
    "DISPUTE_FROZEN"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState<string | null>(null);

  // Financial calculations
  const totalEscrow = 4200000; // 4,200,000 UZS
  const baseRate = 4000; // UZS / L
  const fatDelta = parseFloat(bindingFat) - 3.20;
  const snfDelta = parseFloat(bindingSnf) - 8.50;
  const qualityRate = Math.round(baseRate * (1 + fatDelta * 0.15 + snfDelta * 0.10));
  const parsedVolume = parseFloat(bindingVolume) || 0;
  const farmerEntitlement = Math.min(totalEscrow, Math.round(parsedVolume * qualityRate));
  const factoryRefund = Math.max(0, totalEscrow - farmerEntitlement);

  const handleExecuteArbitration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setVerdictStatus("RESOLVED_SPLIT");
      setIsSubmitting(false);
      setResolutionSummary(
        `FORENSIC ARBITRATION ENFORCED: Escrow released per State Reference Lab certified readings. Farmer Payout: ${farmerEntitlement.toLocaleString()} UZS (99.85%), Factory Tare Refund: ${factoryRefund.toLocaleString()} UZS (0.15%). Mandatory -20.00 pts Trust Score penalty applied to ${
          dishonestParty === "INDUSTRY" ? "Tashkent Premium Dairy LLC (Factory)" : "Sirdaryo Agro Dairy LLC (Farmer)"
        }. State arbitration certificate sealed into immutable ledger.`
      );
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF0] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#10182B] text-emerald-400">
              FORENSIC ARBITRATION CONSOLE
            </span>
            <span className="text-xs font-mono text-[#64748B]">
              Dossier #DISP-2026-0881
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">
            Split-Sample Dispute & Reference Lab Arbitration
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cryptographic reconciliation between Farm Gate readings, Factory claims, and State Certified benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#64748B] uppercase block">
              Frozen Escrow Vault
            </span>
            <span className="text-lg font-mono font-bold text-[#111827]">
              4,200,000.00 <span className="text-xs text-[#64748B]">UZS</span>
            </span>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
              verdictStatus === "DISPUTE_FROZEN"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                verdictStatus === "DISPUTE_FROZEN" ? "bg-red-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            {verdictStatus === "DISPUTE_FROZEN" ? "ESCROW FROZEN" : "RESOLVED & RELEASED"}
          </div>
        </div>
      </div>

      {/* Chain of Custody Timeline */}
      <div className="bg-white rounded-card border border-[#E5EAF0] p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111827]">
            Tamper-Evident Vial Barcode Chain of Custody
          </h2>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-[#E5EAF0]">
            Vial: <strong className="text-[#111827]">VIAL-UZ-2026-99412</strong> &bull; Seal Intact
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-emerald-800">
              <span>06:14 UZT</span>
              <span className="font-bold">SEALED</span>
            </div>
            <div className="text-xs font-bold text-[#111827]">Farm Gate Pickup</div>
            <p className="text-[11px] text-slate-600">Farmer & Driver co-signed and sealed sample vial.</p>
          </div>

          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-emerald-800">
              <span>06:16 UZT</span>
              <span className="font-bold">250M LOCK</span>
            </div>
            <div className="text-xs font-bold text-[#111827]">GPS Geofence Match</div>
            <p className="text-[11px] text-slate-600">Driver location verified inside barn boundary.</p>
          </div>

          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-emerald-800">
              <span>07:22 UZT</span>
              <span className="font-bold">INGEST</span>
            </div>
            <div className="text-xs font-bold text-[#111827]">Factory Weighbridge</div>
            <p className="text-[11px] text-slate-600">Factory tare: 995.00 L recorded (-5.00L tare).</p>
          </div>

          <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-red-800">
              <span>07:45 UZT</span>
              <span className="font-bold">DISPUTED</span>
            </div>
            <div className="text-xs font-bold text-red-950">Factory Lab Downgrade</div>
            <p className="text-[11px] text-red-800">Factory claimed Fat 3.10%. Auto-frozen.</p>
          </div>

          <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-blue-800">
              <span>08:30 UZT</span>
              <span className="font-bold">ARBITRATED</span>
            </div>
            <div className="text-xs font-bold text-[#111827]">State Testing Institute</div>
            <p className="text-[11px] text-slate-600">Central lab certified: Fat 3.90%, SNF 8.65%.</p>
          </div>
        </div>
      </div>

      {/* 3-Column Forensic Comparison Matrix */}
      <div className="bg-white rounded-card border border-[#E5EAF0] shadow-card overflow-hidden">
        <div className="p-4 bg-[#F5F8FA] border-b border-[#E5EAF0] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Tri-Party Forensic Comparison Matrix
            </h2>
            <p className="text-xs text-[#64748B]">
              Deltas exceeding &plusmn;0.10% are forensically highlighted.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded">
            FLAGGED: +0.80% FAT DISCREPANCY
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#E5EAF0]">
          {/* Column 1: Farm Gate */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">ORIGIN READINGS</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">DRIVER SIGNED</span>
            </div>
            <h3 className="text-xs font-bold text-[#111827]">Farm Gate Pickup</h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Volume</span>
                <span className="font-mono font-bold text-[#111827]">1,000.00 L</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Fat Content</span>
                <span className="font-mono font-bold text-[#111827]">3.95%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">SNF</span>
                <span className="font-mono font-bold text-[#111827]">8.70%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Temperature</span>
                <span className="font-mono font-bold text-[#111827]">3.80 °C</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#64748B]">Acidity</span>
                <span className="font-mono font-bold text-[#111827]">16.50 °T</span>
              </div>
            </div>
          </div>

          {/* Column 2: Factory Gate */}
          <div className="p-5 space-y-3 bg-red-50/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-600 uppercase">CONTESTED CLAIM</span>
              <span className="text-[10px] font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">DOWNGRADED</span>
            </div>
            <h3 className="text-xs font-bold text-red-950">Factory Gate Lab Claim</h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Volume</span>
                <span className="font-mono font-bold text-[#111827]">995.00 L (-5.00L)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Fat Content</span>
                <span className="font-mono font-bold text-red-700 bg-red-100 px-1 rounded">3.10% (-0.85%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">SNF</span>
                <span className="font-mono font-bold text-red-700 bg-red-100 px-1 rounded">7.90% (-0.80%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Temperature</span>
                <span className="font-mono font-bold text-[#111827]">4.20 °C</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#64748B]">Acidity</span>
                <span className="font-mono font-bold text-red-700">18.50 °T (Flagged)</span>
              </div>
            </div>
          </div>

          {/* Column 3: State Reference Lab */}
          <div className="p-5 space-y-3 bg-emerald-50/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">BINDING VERDICT</span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">CERTIFIED ISO 17025</span>
            </div>
            <h3 className="text-xs font-bold text-emerald-950">Central State Testing Institute</h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Certified Volume</span>
                <span className="font-mono font-bold text-[#059B72]">{bindingVolume} L</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Certified Fat</span>
                <span className="font-mono font-bold text-[#059B72] bg-emerald-100 px-1 rounded">{bindingFat}% (+0.80% True)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Certified SNF</span>
                <span className="font-mono font-bold text-[#059B72] bg-emerald-100 px-1 rounded">{bindingSnf}% (+0.75% True)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748B]">Certified Temp</span>
                <span className="font-mono font-bold text-[#111827]">{bindingTemp} °C</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#64748B]">Certified Acidity</span>
                <span className="font-mono font-bold text-[#059B72]">{bindingAcidity} °T (Pass)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Enforcement Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-card border border-[#E5EAF0] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-3">
            <h3 className="text-sm font-bold text-[#111827]">Automated Proportional Escrow Split</h3>
            <span className="font-mono font-bold text-[#059B72] text-xs">
              Certified Rate: {qualityRate.toLocaleString()} UZS / L
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[10px] text-emerald-800 block font-sans">Farmer Settlement Payout</span>
              <span className="text-base font-bold text-emerald-950 mt-0.5 block">
                {farmerEntitlement.toLocaleString()} UZS
              </span>
              <span className="text-[10px] text-emerald-700 font-sans">99.85% of Escrow</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-[#E5EAF0]">
              <span className="text-[10px] text-slate-600 block font-sans">Factory Tare Reconciliation</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {factoryRefund.toLocaleString()} UZS
              </span>
              <span className="text-[10px] text-slate-500 font-sans">0.15% Tare Adjustment</span>
            </div>
          </div>

          <form onSubmit={handleExecuteArbitration} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#111827]">
                Dishonest Counterparty (Receives -20.00 Trust Penalty)
              </label>
              <select
                value={dishonestParty}
                onChange={(e) => setDishonestParty(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 bg-white border border-[#E5EAF0] rounded-lg text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059B72]"
              >
                <option value="INDUSTRY">INDUSTRY (Factory) — Overturn Fraudulent Lab Downgrade (-20 pts L_fairness)</option>
                <option value="FARMER">FARMER — Substantiated Quality Rejection (-20 pts A_clean)</option>
              </select>
            </div>

            {resolutionSummary && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-950">
                {resolutionSummary}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || verdictStatus === "RESOLVED_SPLIT"}
                className={`px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition ${
                  verdictStatus === "RESOLVED_SPLIT"
                    ? "bg-[#059B72] cursor-default"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSubmitting ? "Executing..." : verdictStatus === "RESOLVED_SPLIT" ? "Arbitration Executed & Sealed" : "Enforce Binding Arbitration & Sanction Factory"}
              </button>
            </div>
          </form>
        </div>

        {/* Counterparty Rating Impact */}
        <div className="bg-[#10182B] text-white rounded-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase text-slate-400">Algorithmic Sanctions</span>
            <h4 className="text-sm font-bold text-white">Trust Score Enforcement</h4>
            <div className="p-3 rounded-lg bg-[#0B101D] border border-[#1E293B] space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Tashkent Premium Dairy</span>
                <span className="font-mono text-red-400 font-bold">96.4 &rarr; 76.4 pts</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Sanction applied for bad-faith quality downgrade. Factory loses preferential factoring tier.
              </p>
            </div>
          </div>
          <a
            href={certUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center py-2 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Download Certified Lab PDF &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
