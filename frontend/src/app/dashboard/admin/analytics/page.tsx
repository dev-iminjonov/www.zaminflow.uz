"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AdminAnalyticsPage() {
  const [metricFilter, setMetricFilter] = useState<"volume" | "escrow" | "quality">("volume");

  const regionsData = [
    { region: "Toshkent viloyati", volume: "420,000 L", escrow: "2.6B UZS", quality: "96% Grade A+" },
    { region: "Samarqand viloyati", volume: "385,000 L", escrow: "2.2B UZS", quality: "94% Grade A+" },
    { region: "Fargʻona vodiysi", volume: "290,000 L", escrow: "1.6B UZS", quality: "92% Grade A" },
    { region: "Buxoro viloyati", volume: "180,000 L", escrow: "1.0B UZS", quality: "95% Grade A+" },
    { region: "Qashqadaryo viloyati", volume: "210,000 L", escrow: "1.2B UZS", quality: "91% Grade A" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            NATIONAL AGRI-COMMODITY ANALYTICS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Ekotizim Tahlili &{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Makroiqtisodiy Koʻrsatkichlar
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Oʻzbekiston boʻyicha xom sut bozori aylanmasi, narxlar indeksi va sifat monitoringi
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:border-white/20 text-xs font-bold text-white/70 hover:text-white transition"
        >
          ← Umumiy Koʻrinishga Qaytish
        </Link>
      </header>

      {/* METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[24px] p-5 bg-gradient-to-br from-[#0c2e28] to-[#081a28] border border-[#00ffc8]/30 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase text-[#00ffc8] font-bold">Oylik Tovarlar Aylanmasi</span>
          <div className="text-3xl font-black font-mono text-white mt-1">1,485,000 L</div>
          <span className="text-[10px] text-[#00ffc8] font-mono mt-1">+14.2% oʻtgan oyga nisbatan</span>
        </div>
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-white/50">Oʻrtacha Respublika Narxi</span>
          <div className="text-3xl font-black font-mono text-white mt-1">5,820 UZS/L</div>
          <span className="text-[10px] text-[#00d3e0] font-mono mt-1">Standart 3.4% yogʻlik uchun</span>
        </div>
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-white/50">Muvaffaqiyatli Kliring Ulushi</span>
          <div className="text-3xl font-black font-mono text-[#00ffc8] mt-1">99.8%</div>
          <span className="text-[10px] text-white/40 font-mono mt-1">ISO 20022 kafolati ostida</span>
        </div>
      </section>

      {/* REGIONAL TABLE */}
      <div className="bg-white/[0.03] rounded-[28px] p-6 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00d3e0]">Viloyatlar Boʻyicha Tahlil</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Xom Sut Oqimi va Eskrou Kafolatlari</h3>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 text-xs font-bold">
            <button
              onClick={() => setMetricFilter("volume")}
              className={`px-3 py-1 rounded-full transition ${
                metricFilter === "volume"
                  ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Hajm
            </button>
            <button
              onClick={() => setMetricFilter("escrow")}
              className={`px-3 py-1 rounded-full transition ${
                metricFilter === "escrow"
                  ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Eskrou
            </button>
            <button
              onClick={() => setMetricFilter("quality")}
              className={`px-3 py-1 rounded-full transition ${
                metricFilter === "quality"
                  ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sifat
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/5 mt-2">
          {regionsData.map((item) => (
            <div key={item.region} className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-white text-sm block">{item.region}</span>
                <span className="text-[11px] text-white/40 font-mono">Faol fermerlar: 240+ &bull; Zavodlar: 12</span>
              </div>

              <div className="flex items-center gap-6 font-mono">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Yetkazilgan Hajm</span>
                  <span className="font-bold text-white text-sm">{item.volume}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Eskrou Aylanmasi</span>
                  <span className="font-bold text-[#00ffc8] text-sm">{item.escrow}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Oʻrtacha Sifat</span>
                  <span className="font-bold text-[#00d3e0] text-sm">{item.quality}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
