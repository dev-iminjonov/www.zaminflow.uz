"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getRegionalPrices, saveRegionalPrices, RegionalPriceConfig } from "@/lib/dairyStore";

export default function RegionalPricingPage() {
  const [prices, setPrices] = useState<RegionalPriceConfig[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setPrices(getRegionalPrices());
  }, []);

  const handlePriceChange = (index: number, newPrice: number) => {
    const updated = [...prices];
    updated[index].basePriceUZS = newPrice;
    setPrices(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveRegionalPrices(prices);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HEADER ROW */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00ffc8]">
              Hududiy Bozor Iqtisodiyoti va Sifat Koeffitsientlari
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hududiy Narxlar <span className="bg-gradient-to-r from-[#00ffc8] to-[#0099ff] bg-clip-text text-transparent">Konfiguratori</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Viloyatlar kesimida bazaviy 1 litr xom sut xarid tariflarini va yogʻ/oqsillilik ustamalarini boshqarish
          </p>
        </div>

        <Link
          href="/dashboard/dairy"
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          ← Boshqaruv Paneliga Qaytish
        </Link>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-[#00ffc8]/10 border border-[#00ffc8]/30 text-[#00ffc8] text-xs font-bold flex items-center justify-between">
          <span>✓ Barcha hududiy tariflar va ustama koeffitsientlari muvaffaqiyatli yangilandi va saqlandi.</span>
          <span className="font-mono text-[10px] uppercase bg-[#00ffc8]/20 px-2 py-0.5 rounded-full">Faol</span>
        </div>
      )}

      {/* 2. PRICING FORM */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((p, idx) => (
            <div
              key={p.region || idx}
              className="rounded-[24px] bg-white/[0.03] border border-white/10 p-5 flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-base">{p.region}</span>
                  <span className="font-mono text-[10px] font-bold text-[#00ffc8] bg-[#00ffc8]/10 border border-[#00ffc8]/20 px-2 py-0.5 rounded-full">
                    {p.region.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-white/50 mb-3">
                  Standart yogʻlik 3.6% • Kislotalik 18°T
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">
                  1 Litr Bazaviy Narx (UZS)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="50"
                    min="2500"
                    max="6500"
                    value={p.basePriceUZS}
                    onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/15 px-3 font-mono font-bold text-sm text-white focus:border-[#00ffc8] outline-none"
                  />
                  <span className="absolute right-3 top-3 text-[10px] font-mono text-white/40">UZS</span>
                </div>
                <div className="mt-2 text-[10px] text-white/40 flex justify-between">
                  <span>Yogʻ bonusi (+0.1%):</span>
                  <span className="font-mono text-[#00ffc8]">+45 UZS</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Premium Formula Bento */}
        <div className="rounded-[28px] bg-white/[0.03] border border-white/10 p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-white">Avtomatlashtirilgan Sifat Ustamalari Formulasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="font-mono text-[10px] uppercase text-[#00ffc8] font-bold mb-1">Yogʻlilik Bonusi</div>
              <p className="text-white/70 text-[11px] leading-relaxed">
                Yogʻ miqdori 3.6% dan har 0.1% ga oshganda xarid narxiga avtomatik ravishda <strong>+45 UZS/L</strong> ustama qoʻshiladi.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="font-mono text-[10px] uppercase text-[#00d3e0] font-bold mb-1">Quruq Modda (SOMO / SNF)</div>
              <p className="text-white/70 text-[11px] leading-relaxed">
                SNF 8.5% dan yuqori boʻlganda zavod bonus fondidan <strong>+60 UZS/L</strong> qoʻshimcha mukofot toʻlanadi.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="font-mono text-[10px] uppercase text-amber-400 font-bold mb-1">Sovuq Zanjir Jarimasi</div>
              <p className="text-white/70 text-[11px] leading-relaxed">
                Agar harorat qabul vaqtida 4.5°C dan oshsa, harorat defitsiti uchun <strong>-120 UZS/L</strong> chegirma hisoblanadi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] font-black text-xs tracking-wide shadow-xl shadow-[#00ffc8]/25 hover:scale-105 transition cursor-pointer"
          >
            Tariflar va Qoidalarni Saqlash →
          </button>
        </div>
      </form>
    </div>
  );
}
