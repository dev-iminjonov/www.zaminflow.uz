"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getDairyShipments, DairyShipment } from "@/lib/dairyStore";

export default function DairyShipmentsPage() {
  const [shipments, setShipments] = useState<DairyShipment[]>([]);

  useEffect(() => {
    setShipments(getDairyShipments());
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            LOGISTIKA VA FLOT MONITORINGI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Kelayotgan Sut Tankerlari &{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Telematika
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Sovuq zanjir tankerlari, real vaqt datchiklari va zavod qabul darvozasi
          </p>
        </div>

        <Link
          href="/dashboard/dairy/regional-pricing"
          className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:border-[#00d3e0] text-xs font-bold text-white hover:text-[#00ffc8] transition"
        >
          Hududiy Narxlarni Sozlash →
        </Link>
      </header>

      {/* 2. FLEET KPI TELEMETRY GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Faol Kiruvchi Tankerlar</span>
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-ping" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-white">47</span>
            <span className="text-xs text-white/50">ta tanker</span>
            <span className="ml-auto text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2.5 py-0.5">
              +3.2°C Sovutilgan
            </span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
            Bugun Qabul Qilindi
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-[#00ffc8]">186,400</span>
            <span className="text-xs text-[#00ffc8] font-mono">L</span>
            <span className="ml-auto text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2.5 py-0.5">
              +3.8% reja
            </span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
            Darvozada Kutmoqda
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-amber-300">1</span>
            <span className="text-xs text-white/50">tanker navbatda</span>
            <span className="ml-auto text-[10px] font-bold bg-amber-400/15 border border-amber-400/30 text-amber-300 rounded-full px-2.5 py-0.5">
              Titratsiyaga Tayyor
            </span>
          </div>
        </div>
      </section>

      {/* 3. FLEET LIST */}
      <section className="flex flex-col gap-4">
        {shipments.map((shipment) => {
          const isTesting = shipment.status === "testing";
          const isReleased = shipment.status === "released";

          return (
            <div
              key={shipment.id}
              className="rounded-[28px] p-6 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 shadow-lg flex flex-wrap items-center justify-between gap-6 transition-all"
            >
              <div className="flex-[1_1_280px]">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="font-bold text-lg text-white">
                    {shipment.route}
                  </span>
                  <span className="font-mono text-xs font-bold bg-white/5 border border-white/10 text-[#00d3e0] rounded-full px-2.5 py-0.5">
                    {shipment.batchNumber}
                  </span>
                  {shipment.gpsLock && (
                    <span className="text-[10px] font-bold text-[#00ffc8] flex items-center gap-1 bg-[#00ffc8]/10 border border-[#00ffc8]/25 rounded-full px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] animate-pulse" />
                      GPS Qulflangan
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/70">
                  Haydovchi: <strong className="text-white">{shipment.driverName}</strong> • Tanker raqami: <strong className="text-white font-mono">{shipment.truckPlate}</strong>
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  Taxminiy yetib kelish (ETA): <span className="text-[#00ffc8] font-mono">{shipment.etaOrStatus}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-[11px] text-white/40 uppercase font-semibold">Hajm</div>
                  <div className="font-mono font-bold text-lg text-white">
                    {shipment.volumeLiters.toLocaleString()} L
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-white/40 uppercase font-semibold">Harorat</div>
                  <div className="font-mono font-bold text-lg text-[#00ffc8] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#00ffc8]" />
                    {shipment.tempC || shipment.temperatureC || 3.2}°C
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-white/40 uppercase font-semibold">Eskrou Holati</div>
                  <div className="font-mono font-bold text-sm text-[#00d3e0]">
                    {(shipment.lockedEscrowUZS || (shipment.volumeLiters * 4380)).toLocaleString()} UZS
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-white/40 uppercase font-semibold mb-1">Bosqich</div>
                  <span
                    className={`text-[10px] font-bold rounded-full px-3 py-1 inline-flex items-center gap-1.5 border ${
                      isReleased
                        ? "bg-[#00ffc8]/15 border-[#00ffc8]/30 text-[#00ffc8]"
                        : isTesting
                        ? "bg-amber-400/15 border-amber-400/30 text-amber-300"
                        : "bg-[#00d3e0]/15 border-[#00d3e0]/30 text-[#00d3e0]"
                    }`}
                  >
                    {isReleased && "✓ To'liq Qabul Qilindi"}
                    {isTesting && "● Darvoza Titratsiyasi"}
                    {!isReleased && !isTesting && "● Tranzitda (GPS)"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isTesting && (
                    <Link
                      href={`/dashboard/dairy/receive-batch?batch=${shipment.batchNumber}`}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition"
                    >
                      Tahlilni Tasdiqlash →
                    </Link>
                  )}
                  {!isTesting && (
                    <Link
                      href={`/dashboard/farmer/batches/${shipment.batchNumber}`}
                      className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:border-[#00d3e0] text-xs font-bold text-white/80 hover:text-white transition"
                    >
                      Marshrut →
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
