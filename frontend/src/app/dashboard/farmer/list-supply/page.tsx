"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/lib/auth";
import { addFarmerBatch } from "@/lib/farmerStore";

export default function ListSupplyPage() {
  // Form State
  const [volumeLiters, setVolumeLiters] = useState<number>(1500);
  const [milkingSession, setMilkingSession] = useState<"morning" | "evening">("morning");
  const [milkingDate, setMilkingDate] = useState<string>("Bugun, 06:30");
  const [storageTempC, setStorageTempC] = useState<number>(3.3);
  const [fatPercent, setFatPercent] = useState<number>(4.1);
  const [snfPercent, setSnfPercent] = useState<number>(8.7);
  const [acidityT, setAcidityT] = useState<number>(16.5);
  const [destinationPlant, setDestinationPlant] = useState<string>("Tashkent Central Dairy");
  const [pickupWindow, setPickupWindow] = useState<string>("Ertaga 07:00 - 08:30");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdBatchId, setCreatedBatchId] = useState<string>("");

  // Compute grade and price
  const isGradeAPlus = fatPercent >= 4.0 && snfPercent >= 8.6 && acidityT <= 17;
  const isGradeA = !isGradeAPlus && fatPercent >= 3.6 && snfPercent >= 8.4 && acidityT <= 19;
  const qualityGrade: "A+" | "A" | "B" = isGradeAPlus ? "A+" : isGradeA ? "A" : "B";

  const effectivePrice = isGradeAPlus ? 4380 : isGradeA ? 4150 : 3800;
  const totalPayout = volumeLiters * effectivePrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authenticatedFetch("/farmer/supply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volume_liters: volumeLiters,
          cooling_temp_c: storageTempC,
          milking_session: milkingSession.toUpperCase(),
          fat_pct: fatPercent,
          snf_pct: snfPercent,
          acidity_turner: acidityT,
        }),
      });
    } catch {
      // Resilient fallback if offline
    }

    const created = addFarmerBatch({
      volumeLiters,
      milkingDate,
      milkingSession,
      storageTempC,
      qualityGrade,
      fatPercent,
      snfPercent,
      acidityT,
      pricePerLiter: effectivePrice,
      totalEstimatedPayout: totalPayout,
      status: "stored",
      destinationPlant,
      pickupWindow,
      escrowStatus: "locked",
    });
    setCreatedBatchId(created.batchNumber);
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            YANGI SUT PARTIYASI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sut Partiyasini{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Savdoga Joylashtirish
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Sovutilgan xom sut hajmi, laboratoriya ko'rsatkichlari va bank eskrou bahosi
          </p>
        </div>

        <Link
          href="/dashboard/farmer/my-milk"
          className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:border-white/20 text-xs font-bold text-white/70 hover:text-white transition"
        >
          ← Sut Zaxiralariga Qaytish
        </Link>
      </header>

      {isSubmitted ? (
        <div className="rounded-[32px] bg-white/[0.03] border border-[#00ffc8]/30 shadow-[0_20px_60px_rgba(0,255,200,0.15)] p-8 sm:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-full bg-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/40 flex items-center justify-center text-3xl font-black shadow-lg">
            ✓
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Partiya {createdBatchId} Muvaffaqiyatli Joylashtirildi!
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-md">
            Sizning xom sut partiyangiz tizimga kiritildi. Qabul qiluvchi zavod va izolyatsiyalangan sovuq zanjir tankeri yo'naltirildi.
          </p>
          <div className="bg-white/5 rounded-2xl p-5 w-full border border-white/10 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">Hajm:</span>
              <strong className="font-mono text-white text-sm">{volumeLiters.toLocaleString()} L</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Sifat sinfi:</span>
              <strong className="text-[#00ffc8]">Grade {qualityGrade} ({fatPercent}% Yog', {snfPercent}% SNF)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Kafolatlangan Eskrou:</span>
              <strong className="font-mono text-[#00d3e0] text-sm">{totalPayout.toLocaleString()} UZS</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Qabul qiluvçi zavod:</span>
              <strong className="text-white">{destinationPlant}</strong>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Link
              href="/dashboard/farmer/my-milk"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition"
            >
              Inventarda ko'rish →
            </Link>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="px-5 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition cursor-pointer"
            >
              Yana bir partiya kiritish
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Inputs (8 cols) */}
          <div className="lg:col-span-8 rounded-[28px] p-6 sm:p-8 bg-white/[0.03] border border-white/10 shadow-lg flex flex-col gap-6">
            {/* Section 1: Volume & Milking */}
            <div>
              <div className="text-xs font-bold tracking-widest text-[#00d3e0] uppercase mb-4 flex items-center gap-2">
                <span>1. Hajm va Soğiş Seansi</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Hajm (Litr)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={20000}
                    step={50}
                    value={volumeLiters}
                    onChange={(e) => setVolumeLiters(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-white/10 px-4 font-mono text-base font-bold text-white bg-white/5 focus:border-[#00d3e0] focus:ring-1 focus:ring-[#00d3e0]/40 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Sovutgich Harorati (°C)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={1.0}
                    max={8.0}
                    value={storageTempC}
                    onChange={(e) => setStorageTempC(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-white/10 px-4 font-mono text-base font-bold text-[#00ffc8] bg-white/5 focus:border-[#00d3e0] focus:ring-1 focus:ring-[#00d3e0]/40 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Sog'ish Seansi
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMilkingSession("morning")}
                      className={`flex-1 h-11 rounded-xl text-xs font-bold transition cursor-pointer ${
                        milkingSession === "morning"
                          ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black shadow-xs"
                          : "bg-white/5 border border-white/10 text-white/70 hover:text-white"
                      }`}
                    >
                      Ertalabki (06:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMilkingSession("evening")}
                      className={`flex-1 h-11 rounded-xl text-xs font-bold transition cursor-pointer ${
                        milkingSession === "evening"
                          ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black shadow-xs"
                          : "bg-white/5 border border-white/10 text-white/70 hover:text-white"
                      }`}
                    >
                      Kechki (17:30)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Sog'ilgan Vaqt
                  </label>
                  <input
                    type="text"
                    value={milkingDate}
                    onChange={(e) => setMilkingDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-white/10 px-4 text-xs font-semibold text-white bg-white/5 focus:border-[#00d3e0] focus:ring-1 focus:ring-[#00d3e0]/40 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Laboratory Estimates */}
            <div>
              <div className="text-xs font-bold tracking-widest text-[#00d3e0] uppercase mb-4 flex items-center gap-2">
                <span>2. Sifat Parametrlari & Titratsiya</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Yog'lilik Darajasi (%)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={2.8}
                    max={5.5}
                    value={fatPercent}
                    onChange={(e) => setFatPercent(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-white/10 px-4 font-mono text-base font-bold text-white bg-white/5 focus:border-[#00d3e0] focus:ring-1 focus:ring-[#00d3e0]/40 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Quruq Qoldiq (SNF %)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={7.5}
                    max={9.5}
                    value={snfPercent}
                    onChange={(e) => setSnfPercent(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-white/10 px-4 font-mono text-base font-bold text-white bg-white/5 focus:border-[#00d3e0] focus:ring-1 focus:ring-[#00d3e0]/40 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Kislotalilik (°T Terner)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={14}
                    max={24}
                    value={acidityT}
                    onChange={(e) => setAcidityT(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-white/10 px-4 font-mono text-base font-bold text-white bg-white/5 focus:border-[#00d3e0] focus:ring-1 focus:ring-[#00d3e0]/40 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Buyer & Pickup Logistics */}
            <div>
              <div className="text-xs font-bold tracking-widest text-[#00d3e0] uppercase mb-4 flex items-center gap-2">
                <span>3. Qabul Qiluvçi Zavod & Qabul Oynasi</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Xaridor Sut Zavodi
                  </label>
                  <select
                    value={destinationPlant}
                    onChange={(e) => setDestinationPlant(e.target.value)}
                    className="w-full h-11 rounded-xl border border-white/10 px-3.5 text-xs font-semibold text-white bg-[#14181d] focus:border-[#00d3e0] outline-none"
                  >
                    <option value="Tashkent Central Dairy">Tashkent Central Dairy (Toshkent viloyati)</option>
                    <option value="Samarqand Milk Products">Samarqand Milk Products (Samarqand)</option>
                    <option value="Fergana Valley Dairy">Fergana Valley Dairy (Farğona)</option>
                    <option value="Andijan Pure Dairy">Andijan Pure Dairy (Andijon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">
                    Yuklab Olish Vaqti
                  </label>
                  <input
                    type="text"
                    value={pickupWindow}
                    onChange={(e) => setPickupWindow(e.target.value)}
                    className="w-full h-11 rounded-xl border border-white/10 px-4 text-xs font-semibold text-white bg-white/5 focus:border-[#00d3e0] focus:ring-1 focus:ring-[#00d3e0]/40 outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Payout Calculation Summary (4 cols) */}
          <div className="lg:col-span-4 rounded-[28px] p-6 bg-gradient-to-br from-[#0c2e28] via-[#093a38] to-[#081a28] border border-[#00ffc8]/30 shadow-[0_15px_45px_rgba(0,255,200,0.15)] flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#00ffc8]/15 blur-2xl pointer-events-none" />

            <div>
              <div className="text-[11px] font-mono font-bold tracking-wider text-[#00ffc8] uppercase">
                SHARTNOMA BAHOSI
              </div>
              <h3 className="text-xl font-black text-white mt-1 mb-4">
                Jonli Eskrou Hisob-Kitobi
              </h3>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Sifat sinfi:</span>
                  <span className="text-[10px] font-bold bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 rounded-full px-2 py-0.5">
                    Sinf {qualityGrade}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60">Baza spot narxi:</span>
                  <span className="font-mono font-semibold text-white">4,100 UZS/L</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60">Yoğ & SNF bonusi:</span>
                  <span className="font-mono font-bold text-[#00ffc8]">
                    +{effectivePrice - 4100} UZS/L
                  </span>
                </div>

                <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                  <span className="font-bold text-white">Samarali narx:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {effectivePrice.toLocaleString()} UZS/L
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">
                  Kafolatlangan Bank Eskrou Summasi
                </div>
                <div className="font-mono font-black text-3xl sm:text-4xl text-[#00ffc8]">
                  {totalPayout.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-white">UZS</span>
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  Tanker yuklangach bank hisobida bloklanadi; zavod laboratoriya tasdig'idan so'ng darhol hisobingizga o'tadi.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-98 text-[#070B14] font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(0,211,224,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Partiyani Savdoga Chiqarish</span>
              <span>→</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
