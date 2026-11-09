"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getFarmerBatches, MilkBatch } from "@/lib/farmerStore";

export default function MyMilkPage() {
  const [batches, setBatches] = useState<MilkBatch[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setBatches(getFarmerBatches());
  }, []);

  const filteredBatches = batches.filter((b) => {
    if (filter === "all") return true;
    if (filter === "stored") return b.status === "stored";
    if (filter === "transit") return b.status === "in_transit" || b.status === "testing";
    if (filter === "released") return b.status === "released";
    return true;
  });

  const totalInStorage = batches
    .filter((b) => b.status === "stored")
    .reduce((acc, curr) => acc + curr.volumeLiters, 0);

  const totalInTransit = batches
    .filter((b) => b.status === "in_transit" || b.status === "testing")
    .reduce((acc, curr) => acc + curr.volumeLiters, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            SUT OMBORI TELEMATIKASI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Mening Sut Zaxiralarim{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Inventari
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Real vaqt rejimida sovutilgan sut hajmi, telematika va laboratoriya tahlillari
          </p>
        </div>

        <Link
          href="/dashboard/farmer/list-supply"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 text-[#070B14] font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,211,224,0.35)] transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <span className="text-base leading-none font-black">+</span>
          <span>Yangi partiya qöşiş</span>
        </Link>
      </header>

      {/* 2. TOP KPI TELEMETRY GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Sovuq Omborida</span>
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-ping" />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-mono text-3xl font-black text-white">
              {totalInStorage.toLocaleString()}
            </span>
            <span className="text-xs text-[#00d3e0] font-mono">L</span>
            <span className="ml-auto text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2.5 py-0.5">
              3.4°C Sovutilgan
            </span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Yetkazilmoqda</span>
            <span className="text-xs">🚛</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-mono text-3xl font-black text-white">
              {totalInTransit.toLocaleString()}
            </span>
            <span className="text-xs text-[#0099ff] font-mono">L</span>
            <span className="ml-auto text-[10px] font-bold bg-[#0099ff]/15 border border-[#0099ff]/30 text-[#0099ff] rounded-full px-2.5 py-0.5">
              2 Tanker Yo'lda
            </span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Tank Harorati</span>
            <span className="text-xs">❄️</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-mono text-3xl font-black text-[#00ffc8]">
              3.4°C
            </span>
            <span className="ml-auto text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2.5 py-0.5">
              ✓ Optimal (2°–4°C)
            </span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Örtaça Narx</span>
            <span className="text-xs">💰</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-mono text-3xl font-black text-white">
              4,380
            </span>
            <span className="text-xs text-white/60 font-mono">UZS/L</span>
            <span className="ml-auto text-[10px] font-bold bg-[#00d3e0]/15 border border-[#00d3e0]/30 text-[#00d3e0] rounded-full px-2.5 py-0.5">
              Grade A+
            </span>
          </div>
        </div>
      </section>

      {/* 3. FILTER PILLS */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: "all", label: "Barcha partiyalar" },
          { id: "stored", label: "Fermada saqlanmoqda" },
          { id: "transit", label: "Yo'lda / Sinovda" },
          { id: "released", label: "Eskrou to'langan" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filter === tab.id
                ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] shadow-md font-black"
                : "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. BATCH INVENTORY CARDS */}
      <section className="flex flex-col gap-3.5">
        {filteredBatches.map((batch) => (
          <div
            key={batch.id}
            className="rounded-[28px] p-5 sm:p-6 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 shadow-lg flex flex-wrap items-center justify-between gap-5 transition-all"
          >
            {/* Batch Info */}
            <div className="flex-[1_1_240px]">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="font-mono font-bold text-lg text-white">
                  {batch.batchNumber}
                </span>
                <span className="text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2 py-0.5">
                  Sinf: {batch.qualityGrade}
                </span>
                <span className="text-xs text-white/50">
                  {batch.milkingDate} ({batch.milkingSession})
                </span>
              </div>
              <div className="text-xs text-white/70">
                Mo'ljal: <strong className="text-white">{batch.destinationPlant}</strong>
              </div>
              <div className="text-[11px] text-white/40 mt-0.5">
                Qabul qilish oynasi: {batch.pickupWindow}
              </div>
            </div>

            {/* Lab Parameters */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div>
                <div className="text-[11px] text-white/40 uppercase font-semibold">Hajm</div>
                <div className="font-mono font-black text-xl text-white">
                  {batch.volumeLiters.toLocaleString()} <span className="text-xs text-[#00d3e0] font-normal">L</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-white/40 uppercase font-semibold">Yoğ / SNF</div>
                <div className="font-mono font-bold text-sm text-white/90">
                  {batch.fatPercent}% / {batch.snfPercent}%
                </div>
              </div>

              <div>
                <div className="text-[11px] text-white/40 uppercase font-semibold">Eskrou Tölovi</div>
                <div className="font-mono font-bold text-lg text-[#00ffc8]">
                  {batch.totalEstimatedPayout.toLocaleString()} <span className="text-xs text-white/50 font-normal">UZS</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-white/40 uppercase font-semibold mb-1">Holat</div>
                <span
                  className={`text-[10px] font-bold rounded-full px-3 py-1 inline-flex items-center gap-1.5 border ${
                    batch.status === "in_transit"
                      ? "bg-[#00ffc8]/15 border-[#00ffc8]/30 text-[#00ffc8]"
                      : batch.status === "testing"
                      ? "bg-amber-400/15 border-amber-400/30 text-amber-300"
                      : batch.status === "released"
                      ? "bg-[#0099ff]/15 border-[#0099ff]/30 text-[#0099ff]"
                      : "bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      batch.status === "in_transit"
                        ? "bg-[#00ffc8] animate-ping"
                        : batch.status === "testing"
                        ? "bg-amber-400 animate-pulse"
                        : batch.status === "released"
                        ? "bg-[#0099ff]"
                        : "bg-white/50"
                    }`}
                  />
                  {batch.status === "stored" && "Fermada Sovutilmoqda"}
                  {batch.status === "in_transit" && "Yölda (GPS Qulflangan)"}
                  {batch.status === "testing" && "Lab Titratsiya Sinovida"}
                  {batch.status === "released" && "Eskrou Tölandi"}
                  {batch.status === "disputed" && "Nizo Jarayonida"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <Link
                href={`/dashboard/farmer/batches/${batch.batchNumber}`}
                className="px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:border-[#00d3e0] text-xs font-bold text-white hover:text-[#00ffc8] transition"
              >
                Telematika →
              </Link>
              {batch.status === "testing" && (
                <Link
                  href={`/dashboard/farmer/dispute?batch=${batch.batchNumber}`}
                  className="px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-xs font-bold text-amber-300 transition"
                >
                  Nizo Ochish
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
