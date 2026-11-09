"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getDairyOrders, DairyOrder } from "@/lib/dairyStore";

export default function DairyOrdersPage() {
  const [orders, setOrders] = useState<DairyOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setOrders(getDairyOrders());
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  const totalContractedLiters = orders.reduce((acc, curr) => acc + curr.targetVolumeLiters, 0);
  const totalReceivedLiters = orders.reduce((acc, curr) => acc + curr.fulfilledVolumeLiters, 0);
  const totalLockedEscrow = orders.reduce((acc, curr) => acc + curr.lockedEscrowUZS, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            XARID VA SHARTNOMALAR
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sut Xarid Buyurtmalari &{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Kontraktlar
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Sut zavodi uchun fermerlar kooperativi bilan tuzilgan ta'minot shartnomalari
          </p>
        </div>

        <Link
          href="/dashboard/dairy/place-order"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 text-[#070B14] font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,211,224,0.35)] transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <span className="text-base leading-none font-black">+</span>
          <span>Yangi buyurtma berish</span>
        </Link>
      </header>

      {/* 2. PROCUREMENT FULFILLMENT KPIS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
            Shartnoma Qilingan Hajm
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-white">
              {totalContractedLiters.toLocaleString()}
            </span>
            <span className="text-xs text-[#00d3e0] font-mono">L</span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Haqiqiy Qabul Qilingan</span>
            <span className="text-[10px] font-bold bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 rounded-full px-2 py-0.5">
              {Math.round((totalReceivedLiters / totalContractedLiters) * 100)}% Bajarildi
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-[#00ffc8]">
              {totalReceivedLiters.toLocaleString()}
            </span>
            <span className="text-xs text-[#00ffc8] font-mono">L</span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
            Depozit Qilingan Eskrou
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-white">
              {totalLockedEscrow.toLocaleString()}
            </span>
            <span className="text-xs text-white/60 font-mono">UZS</span>
          </div>
        </div>
      </section>

      {/* 3. FILTER TABS */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: "all", label: "Barcha Buyurtmalar" },
          { id: "in_transit", label: "Yetkazilmoqda / Tranzitda" },
          { id: "open", label: "Fermer Tanlanmoqda" },
          { id: "fulfilled", label: "Tugatilgan Buyurtmalar" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              statusFilter === tab.id
                ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] shadow-md font-black"
                : "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. ORDERS CARDS */}
      <section className="flex flex-col gap-4">
        {filteredOrders.map((order) => {
          const percent = Math.round((order.fulfilledVolumeLiters / order.targetVolumeLiters) * 100);

          return (
            <div
              key={order.id}
              className="rounded-[28px] p-6 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 shadow-lg flex flex-wrap items-center justify-between gap-6 transition-all"
            >
              <div className="flex-[1_1_260px]">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="font-mono font-bold text-lg text-white">
                    {order.orderNumber}
                  </span>
                  <span className="text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2 py-0.5">
                    Kerakli sinf: {order.requiredGrade}
                  </span>
                </div>
                <div className="text-xs text-white/80">
                  Zavod: <strong className="text-white">{order.destinationPlant}</strong>
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  Muddat: {order.deliveryDate} • {order.supplierCount} ta fermer biriktirilgan
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex-[1_1_220px]">
                <div className="flex justify-between text-xs mb-1.5 font-semibold text-white/60">
                  <span>Yetkazib berish ({percent}%)</span>
                  <span className="font-mono text-white">
                    {order.fulfilledVolumeLiters.toLocaleString()} / {order.targetVolumeLiters.toLocaleString()} L
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#00ffc8] to-[#0099ff]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Pricing & Escrow */}
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-[11px] text-white/40 uppercase font-semibold">Chegara Narx</div>
                  <div className="font-mono font-bold text-sm text-white">
                    {order.maxPricePerLiter.toLocaleString()} UZS / L
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-white/40 uppercase font-semibold">Bloklangan Eskrou</div>
                  <div className="font-mono font-bold text-base text-[#00ffc8]">
                    {order.lockedEscrowUZS.toLocaleString()} UZS
                  </div>
                </div>

                <Link
                  href="/dashboard/dairy/shipments"
                  className="px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:border-[#00d3e0] text-xs font-bold text-white hover:text-[#00ffc8] transition"
                >
                  Flot Telematikasi →
                </Link>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
