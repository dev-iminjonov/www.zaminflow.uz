"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ReportIssuePage() {
  // Form states
  const [category, setCategory] = useState<string>("refrigeration_fault");
  const [severity, setSeverity] = useState<string>("critical");
  const [description, setDescription] = useState<string>("");
  const [isSent, setIsSent] = useState(false);
  const [incidentId, setIncidentId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentId(`INC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsSent(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HEADER ROW */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400">
              Shoshilinch Yoʻl Nosozligi va Telemetriya Xabardorligi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Muammo Haqida <span className="text-red-400">Xabar Berish</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Sovitgich buzilishi, yoʻldagi toʻsiq yoki sisterna nosozligi haqida logistika dispetcheriga darhol ma'lum qilish
          </p>
        </div>

        <Link
          href="/dashboard/driver/route"
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          ← Jonli Marshrutga Qaytish
        </Link>
      </div>

      {isSent ? (
        <div className="rounded-[32px] bg-gradient-to-br from-red-500/10 via-white/[0.03] to-amber-500/10 border border-red-500/30 p-8 sm:p-12 text-center flex flex-col items-center max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-500 to-amber-500 text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-red-500/25 mb-4">
            !
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Hodisa Xabarnomasi Qabul Qilindi!</h2>
          <div className="font-mono text-sm px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold mb-4">
            {incidentId}
          </div>
          <p className="text-xs text-white/70 max-w-md leading-relaxed mb-6">
            ZaminFlow tezkor dispetcheri va eng yaqin texnik yordam guruhiga GPS koordinatalaringiz (40.7821, 68.7242) bilan shoshilinch signal uzatildi.
          </p>
          <Link
            href="/dashboard/driver/route"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs shadow-lg shadow-[#00ffc8]/20 hover:scale-105 transition"
          >
            Marshrutga Qaytish
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto w-full rounded-[28px] bg-white/[0.03] border border-white/10 p-6 sm:p-8 flex flex-col gap-6"
        >
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white">Hodisa Tafsilotlari</h2>
            <p className="text-xs text-white/50">Nosozlik turi va jiddiylik darajasini tanlang</p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/70 mb-2">
              Hodisa / Nosozlik Turi
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 rounded-2xl bg-[#0d1013] border border-white/15 px-4 text-xs font-bold text-white focus:border-[#00ffc8] outline-none"
            >
              <option value="refrigeration_fault">Sovitish tizimi (Refrejerator) nosozligi</option>
              <option value="vehicle_breakdown">Yuk mashinasi dvigateli / shina yorilishi</option>
              <option value="road_closure">Yöl yopilgan / ta'mirlaş sababli tösiq</option>
              <option value="farmer_delay">Fermer qabul punktida keçikiş / kutiş</option>
              <option value="seal_tamper">Sisterna muhrining shikastlanishi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/70 mb-2">
              Xavf / Shoshilinchlik Darajasi
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "critical", label: "Kritik (Harorat > 5°C)", color: "text-red-400 border-red-500/40" },
                { id: "warning", label: "Örta (Keçikiş)", color: "text-amber-400 border-amber-500/40" },
                { id: "info", label: "Ma'lumot uchun", color: "text-[#00ffc8] border-[#00ffc8]/40" },
              ].map((sev) => (
                <button
                  key={sev.id}
                  type="button"
                  onClick={() => setSeverity(sev.id)}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer text-xs font-bold ${
                    severity === sev.id
                      ? `bg-white/10 ${sev.color} shadow-md`
                      : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                  }`}
                >
                  {sev.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/70 mb-2">
              Batafsil Izoh va Vaziyat
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vaziyatni qisqaça bayon qiling: harorat özgarişi, qolgan yoqilği yoki yordam talabi..."
              className="w-full rounded-2xl bg-white/5 border border-white/15 p-4 text-xs text-white placeholder:text-white/30 focus:border-red-400 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-red-600 text-white font-black text-sm tracking-wide shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.01] transition cursor-pointer"
          >
            Dispetcherga Shoshilinch Signal Yuborish →
          </button>
        </form>
      )}
    </div>
  );
}
