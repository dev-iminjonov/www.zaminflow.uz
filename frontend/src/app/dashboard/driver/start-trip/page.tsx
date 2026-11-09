"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StartTripPage() {
  const router = useRouter();

  // Checkbox states
  const [sanitized, setSanitized] = useState(true);
  const [preChilled, setPreChilled] = useState(true);
  const [sensorCalibrated, setSensorCalibrated] = useState(true);
  const [sealsInspected, setSealsInspected] = useState(true);

  // Inputs
  const [odometerKm, setOdometerKm] = useState<number>(142850);
  const [initialTempC, setInitialTempC] = useState<number>(3.1);
  const [isActivated, setIsActivated] = useState(false);

  const handleStartTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setIsActivated(true);
    setTimeout(() => {
      router.push("/dashboard/driver/route");
    }, 2000);
  };

  const allChecked = sanitized && preChilled && sensorCalibrated && sealsInspected;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HEADER ROW */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00ffc8]">
              Reysdan Oldingi Texnik Nazorat va Sanitar Koʻrik
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Yangi Reysni <span className="bg-gradient-to-r from-[#00ffc8] to-[#0099ff] bg-clip-text text-transparent">Boshlash</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Sisterna sanitar holati, sovitkich agregati va GPS telemetriya kalibratsiyasini tasdiqlash
          </p>
        </div>

        <Link
          href="/dashboard/driver/my-trips"
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          ← Safarlarimga Qaytish
        </Link>
      </div>

      {isActivated ? (
        <div className="rounded-[32px] bg-gradient-to-br from-[#00ffc8]/10 via-white/[0.03] to-[#0099ff]/10 border border-[#00ffc8]/30 p-8 sm:p-12 text-center flex flex-col items-center max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#070B14] text-2xl font-black flex items-center justify-center shadow-lg shadow-[#00ffc8]/25 mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Reys Muvaffaqiyatli Faollashtirildi!</h2>
          <p className="text-xs text-white/70 max-w-md leading-relaxed mb-4">
            IoT telemetriya datchiklari dispetcherlik markaziga ulandi. Sayxunobod fermasiga yoʻnalish ochilmoqda...
          </p>
          <span className="text-[11px] font-mono text-[#00ffc8] animate-pulse">Jonli xarita yuklanmoqda...</span>
        </div>
      ) : (
        <form
          onSubmit={handleStartTrip}
          className="max-w-2xl mx-auto w-full rounded-[28px] bg-white/[0.03] border border-white/10 p-6 sm:p-8 flex flex-col gap-6"
        >
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white">Reys Oldi Nazorat Roʻyxati</h2>
            <p className="text-xs text-white/50">HACCP va sovuq zanjir xavfsizlik talablari</p>
          </div>

          {/* CHECKLIST */}
          <div className="flex flex-col gap-3">
            {[
              {
                id: "sanitized",
                label: "CIP Sanitar yuvish amalga oshirilgan",
                desc: "Sisternaning ichki yuzasi dezinfeksiya qilingan va hidsiz",
                state: sanitized,
                set: setSanitized,
              },
              {
                id: "preChilled",
                label: "Sovitish tizimi oldindan sovutilgan",
                desc: "Kompressor barqaror 3.0°C – 4.0°C oraligʻiga yetkazilgan",
                state: preChilled,
                set: setPreChilled,
              },
              {
                id: "sensorCalibrated",
                label: "IoT datchiklar va GPS faol",
                desc: "BLE termodatchiklar va yoʻldosh aloqasi dispetcherlikka ulangan",
                state: sensorCalibrated,
                set: setSensorCalibrated,
              },
              {
                id: "sealsInspected",
                label: "Raqamli muhrlar butunligi tekshirildi",
                desc: "Klapanlar va lyuklar qulflangan holatda",
                state: sealsInspected,
                set: setSealsInspected,
              },
            ].map((chk) => (
              <label
                key={chk.id}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  chk.state
                    ? "bg-[#00ffc8]/10 border-[#00ffc8]/40 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={chk.state}
                  onChange={(e) => chk.set(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[#00ffc8] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-white">{chk.label}</span>
                  <span className="text-[11px] text-white/50">{chk.desc}</span>
                </div>
              </label>
            ))}
          </div>

          {/* ODOMETER & START TEMP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                Odomatr Koʻrsatkichi (km)
              </label>
              <input
                type="number"
                value={odometerKm}
                onChange={(e) => setOdometerKm(Number(e.target.value))}
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/15 px-4 font-mono text-sm font-bold text-white focus:border-[#00ffc8] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                Dastlabki Harorat (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={initialTempC}
                onChange={(e) => setInitialTempC(Number(e.target.value))}
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/15 px-4 font-mono text-sm font-bold text-white focus:border-[#00ffc8] outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!allChecked}
            className={`w-full h-13 rounded-2xl font-black text-sm tracking-wide transition cursor-pointer shadow-xl ${
              allChecked
                ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] shadow-[#00ffc8]/25 hover:shadow-[#00ffc8]/40 hover:scale-[1.01]"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            Reysni Faollashtirish va Marshrutni Boshlash →
          </button>
        </form>
      )}
    </div>
  );
}
