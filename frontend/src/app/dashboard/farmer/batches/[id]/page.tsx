"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getBatchById, MilkBatch } from "@/lib/farmerStore";

export default function FarmerBatchDetailPage() {
  const params = useParams();
  const batchId = (params?.id as string) || "ZF-0412";
  const [batch, setBatch] = useState<MilkBatch | null>(null);

  useEffect(() => {
    const found = getBatchById(batchId);
    if (found) setBatch(found);
    else {
      // Fallback batch for mock preview
      setBatch({
        id: batchId.toLowerCase(),
        batchNumber: batchId.toUpperCase(),
        volumeLiters: 1200,
        milkingDate: "Bugun, 06:30",
        milkingSession: "morning",
        storageTempC: 3.2,
        qualityGrade: "A+",
        fatPercent: 4.1,
        snfPercent: 8.7,
        acidityT: 16.5,
        pricePerLiter: 4380,
        totalEstimatedPayout: 5256000,
        status: "in_transit",
        destinationPlant: "Toshkent Markaziy Sut Zavodi",
        pickupWindow: "08:00 - 09:30",
        driverName: "Bobur Rahimov",
        driverPhone: "+998 90 123 45 67",
        truckPlate: "01 772 AAA",
        tankerTempC: 3.2,
        eta: "28 min ETA",
        escrowStatus: "locked",
      });
    }
  }, [batchId]);

  if (!batch) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HEADER ROW */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00ffc8]">
              BLE & GPS Sovuq Zanjir Telemetriyasi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Partiya <span className="font-mono bg-gradient-to-r from-[#00ffc8] to-[#0099ff] bg-clip-text text-transparent">{batch.batchNumber}</span> Pasporti
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Sisterna ichki harorati, lab koʻrsatkichlari va Agrobank kafolatlangan eskrou holati
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/farmer/deliveries"
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            ← Yetkazmalarga Qaytish
          </Link>
          <Link
            href={`/dashboard/farmer/dispute?batch=${batch.batchNumber}`}
            className="px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition"
          >
            Nizo / Arbitraj Ochish
          </Link>
        </div>
      </div>

      {/* 2. KEY METRICS BENCH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[24px] bg-white/[0.03] border border-white/10 p-5">
          <div className="text-[11px] font-mono uppercase text-white/50">Joriy Sisterna Harorati</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-[#00ffc8]">{batch.tankerTempC || 3.2}°C</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30">
              ✓ Normal
            </span>
          </div>
        </div>

        <div className="rounded-[24px] bg-white/[0.03] border border-white/10 p-5">
          <div className="text-[11px] font-mono uppercase text-white/50">Yuklangan Hajm</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-white">{batch.volumeLiters.toLocaleString()}</span>
            <span className="text-xs font-mono text-white/50">LITR</span>
          </div>
        </div>

        <div className="rounded-[24px] bg-white/[0.03] border border-white/10 p-5">
          <div className="text-[11px] font-mono uppercase text-white/50">Sifat Sinfi</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-[#00d3e0]">{batch.qualityGrade}</span>
            <span className="text-[10px] font-mono text-white/50">Yogʻ: {batch.fatPercent}% • SOMO: {batch.snfPercent}%</span>
          </div>
        </div>

        <div className="rounded-[24px] bg-white/[0.03] border border-white/10 p-5">
          <div className="text-[11px] font-mono uppercase text-white/50">Eskrou Kafolati</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black font-mono text-amber-400">
              {batch.totalEstimatedPayout.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-white/50">UZS</span>
          </div>
        </div>
      </div>

      {/* 3. SPLIT SECTION: ROUTE & SENSORS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: LOGISTICS HUD */}
        <div className="lg:col-span-7 rounded-[28px] bg-white/[0.03] border border-white/10 p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-white">Logistika va Tashuv Holati</h2>
            <span className="font-mono text-xs text-[#00ffc8] font-bold">{batch.eta}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
              <span className="text-white/40 font-mono uppercase text-[10px]">Qabul Qiluvçi Zavod</span>
              <span className="font-bold text-white text-sm">{batch.destinationPlant}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
              <span className="text-white/40 font-mono uppercase text-[10px]">Taşuvçi Haydovçi</span>
              <span className="font-bold text-white text-sm">{batch.driverName}</span>
              <span className="text-[10px] font-mono text-white/50">{batch.truckPlate} • {batch.driverPhone}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-xs font-mono uppercase text-white/50 mb-3">Zanjir Bosqichlari</div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00ffc8] text-[#070B14] font-black text-xs flex items-center justify-center">✓</span>
                <span className="text-white font-bold">Fermadan Çiqiş</span>
              </div>
              <div className="h-0.5 flex-1 bg-[#00ffc8]/40 mx-3" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs flex items-center justify-center animate-pulse">●</span>
                <span className="text-[#00ffc8] font-bold">Yölda (Tranzit)</span>
              </div>
              <div className="h-0.5 flex-1 bg-white/10 mx-3" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/10 text-white/40 font-bold text-xs flex items-center justify-center">3</span>
                <span className="text-white/40">Zavod Lab Qabuli</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: CHEMICAL & LAB PROFILE */}
        <div className="lg:col-span-5 rounded-[28px] bg-white/[0.03] border border-white/10 p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-white">Laboratoriya Parametrlari</h2>
            <span className="font-mono text-xs text-[#00d3e0] font-bold">ISO 17025</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/60">Yoğlilik (Fat %):</span>
              <span className="font-mono font-bold text-white">{batch.fatPercent}%</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/60">Quruq Modda (SNF %):</span>
              <span className="font-mono font-bold text-white">{batch.snfPercent}%</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/60">Kislotalik (°Turner):</span>
              <span className="font-mono font-bold text-[#00ffc8]">{batch.acidityT}°T (Toza)</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/60">1 Litr Narxi:</span>
              <span className="font-mono font-bold text-white">{batch.pricePerLiter.toLocaleString()} UZS</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/60">Agrobank Eskrou Holati:</span>
              <span className="font-mono font-bold text-amber-400">Bloklangan (Kafolatlangan)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
