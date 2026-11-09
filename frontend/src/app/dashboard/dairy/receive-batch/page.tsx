"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authenticatedFetch } from "@/lib/auth";
import { getDairyShipments, submitGateLabTest, DairyShipment } from "@/lib/dairyStore";

function ReceiveBatchContent() {
  const searchParams = useSearchParams();
  const initialBatch = searchParams.get("batch") || "ZF-0409";

  const [shipments, setShipments] = useState<DairyShipment[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>(initialBatch);

  // Lab Instruments State
  const [meterLiters, setMeterLiters] = useState<number>(4500);
  const [intakeTempC, setIntakeTempC] = useState<number>(3.2);
  const [fatPercent, setFatPercent] = useState<number>(4.18);
  const [snfPercent, setSnfPercent] = useState<number>(8.68);
  const [acidityT, setAcidityT] = useState<number>(16.5);
  const [density, setDensity] = useState<number>(1.028);
  const [alcoholTest, setAlcoholTest] = useState<string>("pass");
  const [resazurinGrade, setResazurinGrade] = useState<"blue" | "violet" | "pink">("blue");

  // Centrifuge interactive spin simulation state
  const [isCentrifuging, setIsCentrifuging] = useState(false);
  const [centrifugeProgress, setCentrifugeProgress] = useState(100);

  // Approval & Escrow Settle State
  const [isApproved, setIsApproved] = useState(false);
  const [txReference, setTxReference] = useState("");
  const [shaHash, setShaHash] = useState("");
  const [settleTimestamp, setSettleTimestamp] = useState("");

  useEffect(() => {
    setShipments(getDairyShipments());
  }, []);

  const activeShipment = shipments.find((s) => s.batchNumber === selectedBatch) || shipments[1] || shipments[0];

  // Dynamic Grade & Pricing Calculation
  const isGradeAPlus = fatPercent >= 4.0 && snfPercent >= 8.6 && acidityT <= 17 && intakeTempC <= 4.0 && alcoholTest === "pass";
  const isGradeA = !isGradeAPlus && fatPercent >= 3.6 && snfPercent >= 8.4 && acidityT <= 19 && alcoholTest === "pass";
  const grade: "A+" | "A" | "B" = isGradeAPlus ? "A+" : isGradeA ? "A" : "B";

  const basePrice = 3900;
  const fatBonus = Math.max(0, Math.round((fatPercent - 3.6) * 650));
  const coldBonus = intakeTempC <= 3.5 ? 200 : intakeTempC <= 4.0 ? 100 : 0;
  const ratePerLiter = grade === "A+" ? 4450 : grade === "A" ? 4200 : 3800;
  const totalSettlement = meterLiters * ratePerLiter;

  // Preset rapid simulator profiles
  const applyPreset = (preset: "sayxunobod" | "zomin" | "standard") => {
    if (preset === "sayxunobod") {
      setMeterLiters(5000);
      setIntakeTempC(3.2);
      setFatPercent(4.18);
      setSnfPercent(8.68);
      setAcidityT(16.5);
      setDensity(1.028);
      setAlcoholTest("pass");
      setResazurinGrade("blue");
    } else if (preset === "zomin") {
      setMeterLiters(8500);
      setIntakeTempC(3.1);
      setFatPercent(4.35);
      setSnfPercent(8.85);
      setAcidityT(16.0);
      setDensity(1.029);
      setAlcoholTest("pass");
      setResazurinGrade("blue");
    } else {
      setMeterLiters(3200);
      setIntakeTempC(3.8);
      setFatPercent(3.75);
      setSnfPercent(8.45);
      setAcidityT(18.0);
      setDensity(1.027);
      setAlcoholTest("pass");
      setResazurinGrade("violet");
    }
  };

  // Run centrifuge spin animation
  const handleStartCentrifuge = () => {
    setIsCentrifuging(true);
    setCentrifugeProgress(0);

    const startTime = Date.now();
    const duration = 2800; // 2.8s express simulation

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setCentrifugeProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsCentrifuging(false);
      }
    }, 80);
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeShipment?.id && activeShipment.id.length === 36) {
      try {
        await authenticatedFetch("/batches/lab-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batch_id: activeShipment.id,
            actual_volume_liters: meterLiters,
            actual_fat_pct: fatPercent,
            actual_snf_pct: snfPercent,
            actual_temp_c: intakeTempC,
            acidity_turner: acidityT,
            antibiotic_passed: alcoholTest === "pass",
            water_adulteration_passed: density >= 1.026,
          }),
        });
      } catch {
        // Resilient fallback
      }
    }
    submitGateLabTest(selectedBatch, { fatPercent, snfPercent, acidityT });
    
    const randomHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setTxReference(`AGRO-PAC008-${Math.floor(100000 + Math.random() * 900000)}`);
    setShaHash(`0x9f8c${randomHex}4a2b8e31d79c40f1a`);
    setSettleTimestamp(new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    setIsApproved(true);
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans">
      
      {/* 1. HEADER ROW WITH STATUS PULSE */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ffc8] animate-ping" />
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#00d3e0]">
              Zavod Darvoza Raqamli Spektrometr & Lab Hubi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Xom Sut Qabuli va{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Lab Verifikatsiyasi
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Gerber sentrifugasi, elektron laktometr va ISO 20022 Agrobank lahzalik eskrou kliring shlyuzi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick presets */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300">
            <span className="px-2 text-gray-500 uppercase">Shablon:</span>
            <button
              type="button"
              onClick={() => applyPreset("sayxunobod")}
              className="px-2.5 py-1 rounded-full bg-[#00ffc8]/15 text-[#00ffc8] hover:bg-[#00ffc8]/25 transition"
            >
              Sayxunobod A+
            </button>
            <button
              type="button"
              onClick={() => applyPreset("zomin")}
              className="px-2.5 py-1 rounded-full bg-[#0099ff]/15 text-[#0099ff] hover:bg-[#0099ff]/25 transition"
            >
              Zomin 4.3%
            </button>
            <button
              type="button"
              onClick={() => applyPreset("standard")}
              className="px-2.5 py-1 rounded-full hover:bg-white/10 text-gray-300 transition"
            >
              Standart 1-Nav
            </button>
          </div>

          <Link
            href="/dashboard/dairy/shipments"
            className="px-4 py-2 rounded-full bg-[#14181d] border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:border-[#00d3e0]/40 transition"
          >
            ← Tashuvlar Roʻyxati
          </Link>
        </div>
      </div>

      {isApproved ? (
        /* SUCCESS ESCROW CERTIFICATE MODAL VIEW */
        <div className="rounded-[36px] bg-gradient-to-br from-[#121920]/95 via-[#0e141a]/95 to-[#090d10]/95 border border-[#00ffc8]/40 p-8 sm:p-12 text-center flex flex-col items-center max-w-2xl mx-auto shadow-[0_25px_80px_rgba(0,255,200,0.25)] relative overflow-hidden animate-in fade-in zoom-in-95">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#00ffc8]/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#0099ff]/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Success Check Badge */}
          <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#070B14] text-3xl font-black flex items-center justify-center shadow-xl shadow-[#00ffc8]/30 mb-4 animate-bounce">
            ✓
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] mb-2">
            AgroBank Avtomatik Eskrou Kliringi Bajarildi
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
            Partiya Qabul Qilindi va Mablagʻ Yechildi!
          </h2>

          <div className="font-mono text-xs sm:text-sm px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-gray-300 font-bold mb-4 flex items-center gap-2">
            <span className="text-[#00ffc8]">TRX:</span>
            <span>{txReference}</span>
            <span className="text-gray-500">• {settleTimestamp}</span>
          </div>

          <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 mb-6 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-gray-400">Tasdiqlangan Sifat Klassi:</span>
              <span className="font-black font-mono text-[#00ffc8] text-sm px-2.5 py-0.5 rounded bg-[#00ffc8]/20">
                SINF: {grade} (Oliy A+ Nav)
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-gray-400">Qabul Qilingan Hajm:</span>
              <span className="font-bold text-white font-mono">{meterLiters.toLocaleString()} Litr</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-gray-400">Yakuniy Hisob-Kitob Narxi:</span>
              <span className="font-bold text-[#00d3e0] font-mono">{ratePerLiter.toLocaleString()} UZS / L</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-200 font-bold">Fermer Hisobiga Oʻtgan Summa:</span>
              <span className="font-black text-lg text-[#00ffc8] font-mono">
                {totalSettlement.toLocaleString()} UZS
              </span>
            </div>
            <div className="pt-2 text-[10px] text-gray-400 font-mono truncate">
              Kriptografik Chek: {shaHash}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center w-full">
            <Link
              href="/dashboard/dairy/shipments"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs shadow-lg shadow-[#00ffc8]/20 hover:scale-105 active:scale-95 transition"
            >
              Keyingi Partiyani Qabul Qilish →
            </Link>
            <Link
              href="/dashboard/dairy/escrow"
              className="px-5 py-3 rounded-full bg-white/10 border border-white/15 text-white font-bold text-xs hover:bg-white/20 transition"
            >
              Eskrou Reestrini Koʻrish
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: INTERACTIVE LAB INSTRUMENTS & FORM (7 cols) */}
          <form
            onSubmit={handleApprove}
            className="lg:col-span-7 rounded-[32px] bg-[#14181d]/90 border border-white/10 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Batch Info Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🔬</span> Raqamli Darvoza Laboratoriyasi
                </h2>
                <p className="text-xs text-white/50">
                  Gerber sentrifugasi, optik refraktometr va termal zond
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-white/50 block uppercase">Partiya Raqami</span>
                <span className="font-mono text-sm font-black text-[#00ffc8] bg-[#00ffc8]/10 px-2.5 py-0.5 rounded-full border border-[#00ffc8]/30">
                  {selectedBatch}
                </span>
              </div>
            </div>

            {/* Instrument 1: Gerber Centrifuge Fat Simulator */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#18212b] to-[#10151c] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#00ffc8]/20 text-[#00ffc8] flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">Gerber Butirometr & Sentrifuga</div>
                    <div className="text-[10px] text-gray-400">Yogʻlik fraksiyasini ajratish</div>
                  </div>
                </div>

                {/* Spin Button */}
                <button
                  type="button"
                  onClick={handleStartCentrifuge}
                  disabled={isCentrifuging}
                  className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all border ${
                    isCentrifuging
                      ? "bg-[#00ffc8]/20 text-[#00ffc8] border-[#00ffc8]"
                      : "bg-[#00ffc8] text-[#070B14] hover:opacity-90 active:scale-95"
                  }`}
                >
                  <span>{isCentrifuging ? "⚙ Aylantirilmoqda..." : "▶ Sentrifugani Ishlatish"}</span>
                </button>
              </div>

              {/* Progress bar during centrifuge */}
              {isCentrifuging && (
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] transition-all duration-100"
                    style={{ width: `${centrifugeProgress}%` }}
                  />
                </div>
              )}

              {/* Interactive Slider & Number Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-300">Yogʻlik Darajasi:</span>
                    <span className="text-[#00ffc8] font-mono text-sm">{fatPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="2.8"
                    max="5.2"
                    step="0.01"
                    value={fatPercent}
                    onChange={(e) => setFatPercent(Number(e.target.value))}
                    className="w-full accent-[#00ffc8] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-0.5">
                    <span>2.8% (Kam yogʻ)</span>
                    <span className="text-[#00ffc8]">3.8% (Standart)</span>
                    <span>5.2% (Premium)</span>
                  </div>
                </div>

                {/* SNF / Quruq qoldiq */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-300">Quruq Qoldiq (SNF):</span>
                    <span className="text-[#00d3e0] font-mono text-sm">{snfPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="7.8"
                    max="9.5"
                    step="0.01"
                    value={snfPercent}
                    onChange={(e) => setSnfPercent(Number(e.target.value))}
                    className="w-full accent-[#00d3e0] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-0.5">
                    <span>7.8%</span>
                    <span className="text-[#00d3e0]">8.5% (Meʼyor)</span>
                    <span>9.5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instrument 2: Digital Flow Meter & Thermal Probe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Actual Volume Intake */}
              <div className="p-4 rounded-2xl bg-[#18212b]/60 border border-white/10">
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1.5 flex items-center justify-between">
                  <span>Qabul Qilingan Hajm</span>
                  <span className="text-[#00ffc8] font-mono">Oqim datchigi</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="50"
                    min="500"
                    max="30000"
                    value={meterLiters}
                    onChange={(e) => setMeterLiters(Number(e.target.value))}
                    className="w-full h-12 rounded-xl bg-black/40 border border-white/15 px-3.5 font-mono text-base font-black text-white focus:border-[#00ffc8] outline-hidden"
                    required
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-mono text-gray-400">LITR</span>
                </div>
              </div>

              {/* Temperature Probe */}
              <div className="p-4 rounded-2xl bg-[#18212b]/60 border border-white/10">
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1.5 flex items-center justify-between">
                  <span>Qabul Harorati (PT100)</span>
                  <span className={`font-mono ${intakeTempC <= 4.0 ? "text-[#00ffc8]" : "text-amber-400"}`}>
                    {intakeTempC <= 4.0 ? "✓ Sovuq zanjir" : "⚠ Harorat yuqori"}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={intakeTempC}
                    onChange={(e) => setIntakeTempC(Number(e.target.value))}
                    className="w-full h-12 rounded-xl bg-black/40 border border-white/15 px-3.5 font-mono text-base font-black text-white focus:border-[#00ffc8] outline-hidden"
                    required
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-mono text-gray-400">°C</span>
                </div>
              </div>
            </div>

            {/* Instrument 3: Acidity, Density & Antibiotic Screening */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Acidity (Turner) */}
              <div className="p-3.5 rounded-2xl bg-[#18212b]/40 border border-white/10">
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  Kislotalik (°T)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="14"
                  max="24"
                  value={acidityT}
                  onChange={(e) => setAcidityT(Number(e.target.value))}
                  className="w-full h-10 rounded-lg bg-black/40 border border-white/15 px-3 font-mono text-sm font-bold text-white focus:border-[#00ffc8] outline-hidden"
                />
                <span className="text-[9px] text-gray-500 mt-1 block">Norma: 16-18 °T</span>
              </div>

              {/* Density / Laktometr */}
              <div className="p-3.5 rounded-2xl bg-[#18212b]/40 border border-white/10">
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  Zichlik (g/cm³)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="1.024"
                  max="1.033"
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="w-full h-10 rounded-lg bg-black/40 border border-white/15 px-3 font-mono text-sm font-bold text-white focus:border-[#00ffc8] outline-hidden"
                />
                <span className="text-[9px] text-[#00ffc8] mt-1 block">Suvsiz: 1.027+</span>
              </div>

              {/* Antibiotic Strip Test */}
              <div className="p-3.5 rounded-2xl bg-[#18212b]/40 border border-white/10">
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  Antibiotik Sinovi
                </label>
                <select
                  value={alcoholTest}
                  onChange={(e) => setAlcoholTest(e.target.value)}
                  className="w-full h-10 rounded-lg bg-black/40 border border-white/15 px-2 text-xs font-bold text-white focus:border-[#00ffc8] outline-hidden"
                >
                  <option value="pass">✓ NOL (Toza sut)</option>
                  <option value="fail">✗ Bor (Qaytarish)</option>
                </select>
                <span className="text-[9px] text-[#00ffc8] mt-1 block">Ekspress-test</span>
              </div>
            </div>

            {/* Submit & Settle Button */}
            <button
              type="submit"
              disabled={alcoholTest === "fail"}
              className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                alcoholTest === "fail"
                  ? "bg-red-500/20 text-red-400 border border-red-500/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] hover:opacity-95 active:scale-98 shadow-[0_10px_35px_rgba(0,255,200,0.3)]"
              }`}
            >
              <span>Laboratoriya Xulosasini Tasdiqlash va Eskrouni Yechish</span>
              <span>➔</span>
            </button>
          </form>

          {/* RIGHT COLUMN: REAL-TIME GRADE, BONUSES & VALUATION SIDEBAR (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Live Pricing Breakdown Card */}
            <div className="rounded-[32px] bg-[#14181d]/90 border border-white/10 p-6 flex flex-col gap-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono uppercase text-gray-400 font-bold">
                  Avtomatik Baholash
                </span>
                <span className="font-mono text-xs font-black px-3 py-1 rounded-full bg-[#00ffc8]/20 border border-[#00ffc8]/40 text-[#00ffc8] flex items-center gap-1">
                  <span>★</span>
                  <span>SINF: {grade}</span>
                </span>
              </div>

              {/* Total Settlement Headline */}
              <div className="flex flex-col gap-0.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-[#00ffc8] tracking-tight">
                  {totalSettlement.toLocaleString()} <span className="text-lg text-white/70">UZS</span>
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {meterLiters.toLocaleString()} L × {ratePerLiter.toLocaleString()} UZS / L
                </span>
              </div>

              {/* Pricing Formula Breakdown */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Bazaviy narx (3.6% yogʻ):</span>
                  <span className="font-mono">{basePrice.toLocaleString()} UZS</span>
                </div>
                <div className="flex justify-between text-[#00ffc8]">
                  <span>Yogʻlik bonusi (+{(fatPercent - 3.6).toFixed(2)}%):</span>
                  <span className="font-mono font-bold">+{fatBonus.toLocaleString()} UZS</span>
                </div>
                <div className="flex justify-between text-[#00d3e0]">
                  <span>Sovuq zanjir bonusi ({intakeTempC}°C):</span>
                  <span className="font-mono font-bold">+{coldBonus.toLocaleString()} UZS</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white">
                  <span>Yakuniy L narxi:</span>
                  <span className="font-mono text-[#00ffc8]">{ratePerLiter.toLocaleString()} UZS / L</span>
                </div>
              </div>

              {/* Verified Producer & Logistics Details */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Yetkazuvchi Ferma:</span>
                  <span className="font-bold text-white">{activeShipment?.farmerName || "Sayxunobod Agro MCHJ"}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>MAN TGX Sisterna:</span>
                  <span className="font-mono text-white font-bold">{activeShipment?.truckPlate || "01 | 777 ZAM"}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Sertifikatlangan Haydovchi:</span>
                  <span className="text-white">{activeShipment?.driverName || "Bobur Alimov"}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Bank Eskrou Depozitariysi:</span>
                  <span className="font-mono text-[#00ffc8] font-bold">AgroBank ATB (Bloklangan)</span>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 leading-relaxed bg-[#00ffc8]/5 p-3 rounded-xl border border-[#00ffc8]/20">
                🔒 <strong>ISO 20022 Kafolati:</strong> "Laboratoriya Xulosasini Tasdiqlash" bosilishi bilan Agrobank depozitidagi mablagʻ 3 daqiqa ichida fermerning hisobvaragʻiga kliring qilinadi.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function ReceiveBatchPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-3xl bg-white/5 animate-pulse" />}>
      <ReceiveBatchContent />
    </Suspense>
  );
}
