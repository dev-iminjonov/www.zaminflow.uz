"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/auth";
import { enqueueDriverEvent, flushDriverOfflineQueue } from "@/lib/offlineDriverQueue";

export default function ConfirmPickupPage() {
  const router = useRouter();

  // Form states
  const [meterLiters, setMeterLiters] = useState<number>(1200);
  const [milkTempC, setMilkTempC] = useState<number>(3.2);
  const [sealNumber, setSealNumber] = useState<string>("SEAL-UZ-99214");
  const [farmerOtp, setFarmerOtp] = useState<string>("8492");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackBatchId = "00000000-0000-0000-0000-000000000412";
    try {
      const res = await authenticatedFetch("/driver/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: fallbackBatchId,
          lat: 40.7821,
          lng: 68.7242,
          tank_temp_c: String(milkTempC),
          recorded_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        enqueueDriverEvent({
          event_type: "PICKUP_HANDSHAKE",
          batch_id: fallbackBatchId,
          lat: 40.7821,
          lng: 68.7242,
          tank_temp_c: String(milkTempC),
        });
      } else {
        await flushDriverOfflineQueue();
      }
    } catch {
      enqueueDriverEvent({
        event_type: "PICKUP_HANDSHAKE",
        batch_id: fallbackBatchId,
        lat: 40.7821,
        lng: 68.7242,
        tank_temp_c: String(milkTempC),
      });
    }
    setIsConfirmed(true);
    setTimeout(() => {
      router.push("/dashboard/driver");
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HEADER ROW */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00ffc8]">
              Raqamli Qabul Qilish va Muhrlash Protokoli
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sut Qabulini <span className="bg-gradient-to-r from-[#00ffc8] to-[#0099ff] bg-clip-text text-transparent">Tasdiqlash</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Sayxunobod qabul punktida sut hajmini oʻlchash, haroratni tekshirish va raqamli plomba oʻrnatish
          </p>
        </div>

        <Link
          href="/dashboard/driver"
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          ← Marshrutga Qaytish
        </Link>
      </div>

      {isConfirmed ? (
        <div className="rounded-[32px] bg-gradient-to-br from-[#00ffc8]/10 via-white/[0.03] to-[#0099ff]/10 border border-[#00ffc8]/30 p-8 sm:p-12 text-center flex flex-col items-center max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#070B14] text-2xl font-black flex items-center justify-center shadow-lg shadow-[#00ffc8]/25 mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Qabul Muvaffaqiyatli Tasdiqlandi!</h2>
          <div className="font-mono text-sm px-4 py-1.5 rounded-full bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] font-bold mb-4">
            Plomba: {sealNumber}
          </div>
          <p className="text-xs text-white/70 max-w-md leading-relaxed mb-4">
            Fermer bilan raqamli OTP qoʻl berish yakunlandi. {meterLiters} litr xom sut sisternaga quyildi va IoT harorat datchigi 3.2°C rejimida faollashtirildi.
          </p>
          <span className="text-[11px] text-white/40">Yoʻl xaritasiga yoʻnaltirilmoqda...</span>
        </div>
      ) : (
        <form
          onSubmit={handleConfirm}
          className="max-w-2xl mx-auto w-full rounded-[28px] bg-white/[0.03] border border-white/10 p-6 sm:p-8 flex flex-col gap-6"
        >
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white">Qabul Punktidagi Ma'lumotlar</h2>
            <p className="text-xs text-white/50">Fermer hisoblagich koʻrsatkichlari va xavfsizlik muhr raqami</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                Oʻlchangan Hajm (Litr)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="10"
                  value={meterLiters}
                  onChange={(e) => setMeterLiters(Number(e.target.value))}
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/15 px-4 font-mono text-base font-bold text-white focus:border-[#00ffc8] outline-none"
                  required
                />
                <span className="absolute right-4 top-3 text-xs font-mono text-white/40">LITR</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                Sisterna Harorati (°C)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={milkTempC}
                  onChange={(e) => setMilkTempC(Number(e.target.value))}
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/15 px-4 font-mono text-base font-bold text-white focus:border-[#00ffc8] outline-none"
                  required
                />
                <span className="absolute right-4 top-3 text-xs font-mono text-white/40">°C</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                Raqamli Plomba Raqami
              </label>
              <input
                type="text"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/15 px-4 font-mono text-xs font-bold text-white focus:border-[#00ffc8] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                Fermer Tasdiqlash Kori (OTP)
              </label>
              <input
                type="text"
                maxLength={6}
                value={farmerOtp}
                onChange={(e) => setFarmerOtp(e.target.value)}
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/15 px-4 font-mono text-center tracking-widest text-base font-black text-[#00ffc8] focus:border-[#00ffc8] outline-none"
                required
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/60 leading-relaxed">
            ℹ Ma'lumotlarni tasdiqlash orqali siz sut qabul qilinganini va sisterna muhrlanganini tasdiqlaysiz. ZaminFlow platformasi GPS va harorat monitoringini avtomatik faollashtiradi.
          </div>

          <button
            type="submit"
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] font-black text-sm tracking-wide shadow-xl shadow-[#00ffc8]/25 hover:shadow-[#00ffc8]/40 hover:scale-[1.01] transition cursor-pointer"
          >
            Qabulni Tasdiqlash va Marshrutni Boshlash →
          </button>
        </form>
      )}
    </div>
  );
}
