"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getFarmerBatches, MilkBatch } from "@/lib/farmerStore";

export default function DeliveriesPage() {
  const [batches, setBatches] = useState<MilkBatch[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string>("all");

  useEffect(() => {
    setBatches(getFarmerBatches());
  }, []);

  const deliveryBatches = batches.filter((b) => {
    const isDelivery = b.status !== "stored";
    if (!isDelivery) return false;
    if (selectedPlant === "all") return true;
    return b.destinationPlant.toLowerCase().includes(selectedPlant.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            LOGISTIKA VA REYS KUZATUVI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Yetkazib Berish &{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Tranzit Telematikasi
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            IoT sovuq zanjir datchiklari, GPS marshruti va qabul qilish punktlari
          </p>
        </div>

        {/* Plant Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white/50">Zavod:</span>
          {["all", "Tashkent", "Samarqand", "Fergana"].map((plant) => (
            <button
              key={plant}
              type="button"
              onClick={() => setSelectedPlant(plant)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedPlant === plant
                  ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] shadow-md font-black"
                  : "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {plant === "all" ? "Barcha zavodlar" : plant}
            </button>
          ))}
        </div>
      </header>

      {/* 2. DELIVERIES LIST */}
      <section className="flex flex-col gap-4">
        {deliveryBatches.map((delivery) => {
          const isReleased = delivery.status === "released";
          const isTesting = delivery.status === "testing";
          const isTransit = delivery.status === "in_transit";

          return (
            <div
              key={delivery.id}
              className="rounded-[28px] p-6 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 shadow-lg flex flex-col gap-5 transition-all"
            >
              {/* Header of Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-mono text-xl font-bold text-white">
                      {delivery.batchNumber}
                    </span>
                    <span className="text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2.5 py-0.5">
                      Sinf: {delivery.qualityGrade}
                    </span>
                    <span className="text-xs text-white/50">
                      Sog'ilgan sana: {delivery.milkingDate}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white/90">
                    Qabul qiluvchi zavod: <span className="text-[#00d3e0]">{delivery.destinationPlant}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-right">
                    <div className="text-[11px] text-white/40 uppercase font-semibold">Hajm</div>
                    <div className="font-mono font-bold text-lg text-white">
                      {delivery.volumeLiters.toLocaleString()} <span className="text-xs text-[#00d3e0]">L</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-white/40 uppercase font-semibold">Sovuq Zanjir</div>
                    <div className="font-mono font-bold text-lg text-[#00ffc8] flex items-center justify-end gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
                      {delivery.tankerTempC || 3.2}°C
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-white/40 uppercase font-semibold">Eskrou Bloklangan</div>
                    <div className="font-mono font-bold text-lg text-[#00d3e0]">
                      {delivery.totalEstimatedPayout.toLocaleString()} <span className="text-xs text-white/50 font-normal">UZS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Steps / Stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-2">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#00ffc8]/20 text-[#00ffc8] font-mono text-xs font-bold flex items-center justify-center">
                    ✓
                  </span>
                  <div className="text-xs">
                    <div className="font-bold text-white">1. Fermada yuklandi</div>
                    <div className="text-[10px] text-white/40">QR tasdiqlangan</div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                    isTransit || isTesting || isReleased
                      ? "bg-[#00d3e0]/10 border-[#00d3e0]/30"
                      : "bg-white/[0.02] border-white/5 opacity-50"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-[#00d3e0]/20 text-[#00d3e0] font-mono text-xs font-bold flex items-center justify-center">
                    {isTransit ? "●" : "✓"}
                  </span>
                  <div className="text-xs">
                    <div className="font-bold text-white">2. Tanker yo'lda</div>
                    <div className="text-[10px] text-[#00d3e0]">GPS 250m radius</div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                    isTesting || isReleased
                      ? "bg-amber-400/10 border-amber-400/30"
                      : "bg-white/[0.02] border-white/5 opacity-50"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                    {isTesting ? "●" : isReleased ? "✓" : "3"}
                  </span>
                  <div className="text-xs">
                    <div className="font-bold text-white">3. Laboratoriya</div>
                    <div className="text-[10px] text-amber-300">Yog' & SNF titratsiya</div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                    isReleased
                      ? "bg-[#00ffc8]/10 border-[#00ffc8]/30"
                      : "bg-white/[0.02] border-white/5 opacity-50"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-[#00ffc8]/20 text-[#00ffc8] font-mono text-xs font-bold flex items-center justify-center">
                    {isReleased ? "✓" : "4"}
                  </span>
                  <div className="text-xs">
                    <div className="font-bold text-white">4. Bank Eskrou</div>
                    <div className="text-[10px] text-[#00ffc8]">Hisobga o'tkazildi</div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="text-xs text-white/50 flex items-center gap-2">
                  <span>Tanker haydovchisi:</span>
                  <strong className="text-white">Bobur Rahimov (01 A 777 AA)</strong>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/dashboard/farmer/batches/${delivery.batchNumber}`}
                    className="px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:border-[#00d3e0] text-xs font-bold text-white hover:text-[#00ffc8] transition"
                  >
                    Batafsil Telematika →
                  </Link>
                  {isTesting && (
                    <Link
                      href={`/dashboard/farmer/dispute?batch=${delivery.batchNumber}`}
                      className="px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-xs font-bold text-amber-300 transition"
                    >
                      Nizo ochish
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
