"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/lib/auth";
import { addDairyOrder } from "@/lib/dairyStore";

export default function PlaceOrderPage() {
  // Form inputs
  const [targetVolumeLiters, setTargetVolumeLiters] = useState<number>(30000);
  const [destinationPlant, setDestinationPlant] = useState<string>("Tashkent Central Dairy");
  const [requiredGrade, setRequiredGrade] = useState<"A+" | "A" | "B">("A+");
  const [maxPricePerLiter, setMaxPricePerLiter] = useState<number>(4380);
  const [deliveryDate, setDeliveryDate] = useState<string>("Ertaga, 16:00");
  const [supplierCount, setSupplierCount] = useState<number>(6);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");
  const [catalogSuppliers, setCatalogSuppliers] = useState<Array<{ organization_id: string; legal_name: string; daily_capacity_liters: number; trust_score: number }>>([]);

  useEffect(() => {
    authenticatedFetch("/dairy/catalog")
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setCatalogSuppliers(list);
          setSupplierCount(list.length);
        }
      })
      .catch(() => {});
  }, []);

  const totalEscrowRequired = targetVolumeLiters * maxPricePerLiter;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addDairyOrder({
      targetVolumeLiters,
      requiredGrade,
      destinationPlant,
      maxPricePerLiter,
      deliveryDate,
      status: "open",
      supplierCount,
      lockedEscrowUZS: totalEscrowRequired,
    });
    setCreatedOrderNumber(created.orderNumber);
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HEADER ROW */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00ffc8]">
              Agrobank ATB Eskrou Avtokafolati
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Yangi Xom Sut <span className="bg-gradient-to-r from-[#00ffc8] to-[#0099ff] bg-clip-text text-transparent">Buyurtmasi</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Kooperativ va fermalardan markazlashtirilgan sut xarid buyurtmasini joylashtirish va eskrou depozitini bloklash
          </p>
        </div>

        <Link
          href="/dashboard/dairy/orders"
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          ← Buyurtmalar Roʻyxatiga Qaytish
        </Link>
      </div>

      {isSubmitted ? (
        <div className="rounded-[32px] bg-gradient-to-br from-[#00ffc8]/10 via-white/[0.03] to-[#0099ff]/10 border border-[#00ffc8]/30 p-8 sm:p-12 text-center flex flex-col items-center max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#070B14] text-2xl font-black flex items-center justify-center shadow-lg shadow-[#00ffc8]/25 mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Buyurtma Muvaffaqiyatli Joylashtirildi!</h2>
          <div className="font-mono text-sm px-4 py-1.5 rounded-full bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] font-bold mb-4">
            {createdOrderNumber}
          </div>
          <p className="text-xs text-white/70 max-w-md leading-relaxed mb-6">
            Buyurtma viloyatdagi {supplierCount} ta tasdiqlangan kooperativ va fermerlarga yuborildi. 
            Agrobank ATB maxsus eskrou hisobingizdan <strong className="text-white font-mono">{totalEscrowRequired.toLocaleString()} UZS</strong> mablagʻi kafolatli bloklandi.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard/dairy/orders"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs shadow-lg shadow-[#00ffc8]/20 hover:scale-105 transition"
            >
              Buyurtmalarni Koʻrish
            </Link>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition"
            >
              Yana Buyurtma Berish
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: ORDER CONFIGURATION FORM */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 rounded-[28px] bg-white/[0.03] border border-white/10 p-6 sm:p-8 flex flex-col gap-6"
          >
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Xarid Parametrlari</h2>
              <p className="text-xs text-white/50">Qabul qiluvchi zavod va sut sifat talablari</p>
            </div>

            {/* Target Volume */}
            <div>
              <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                Talab Qilinadigan Hajm (Litr)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={targetVolumeLiters}
                  onChange={(e) => setTargetVolumeLiters(Number(e.target.value))}
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/15 px-4 font-mono text-base font-bold text-white focus:border-[#00ffc8] outline-none transition"
                  required
                />
                <span className="absolute right-4 top-3 text-xs font-mono text-white/40">LITR</span>
              </div>
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                Minimal Qabul Qilinadigan Sifat Sinfi
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "A+", label: "A+ Oliy Sinf", desc: "Yogʻ ≥ 4.0%, Kislotalik ≤ 17°T" },
                  { id: "A", label: "A 1-Sinf", desc: "Yogʻ ≥ 3.6%, Kislotalik ≤ 19°T" },
                  { id: "B", label: "B 2-Sinf", desc: "Yogʻ ≥ 3.2%, Kislotalik ≤ 21°T" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setRequiredGrade(g.id as any)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                      requiredGrade === g.id
                        ? "bg-[#00ffc8]/15 border-[#00ffc8] text-white shadow-md shadow-[#00ffc8]/10"
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{g.label}</div>
                    <div className="text-[10px] text-white/50 leading-tight">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Per Liter */}
            <div>
              <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                Maksimal Qabul Narxi (1 litr uchun UZS)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="2000"
                  step="50"
                  value={maxPricePerLiter}
                  onChange={(e) => setMaxPricePerLiter(Number(e.target.value))}
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/15 px-4 font-mono text-base font-bold text-white focus:border-[#00ffc8] outline-none transition"
                  required
                />
                <span className="absolute right-4 top-3 text-xs font-mono text-white/40">UZS / L</span>
              </div>
            </div>

            {/* Destination Plant & Delivery Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                  Qabul Qiluvchi Zavod / Filial
                </label>
                <select
                  value={destinationPlant}
                  onChange={(e) => setDestinationPlant(e.target.value)}
                  className="w-full h-12 rounded-2xl bg-[#0d1013] border border-white/15 px-4 text-xs font-bold text-white focus:border-[#00ffc8] outline-none"
                >
                  <option value="Tashkent Central Dairy">Toshkent Markaziy Sut Zavodi</option>
                  <option value="Samarkand Plant No 2">Samarqand Qayta Ishlash Markazi</option>
                  <option value="Fergana Valley Dairy">Fargʻona Valley Dairy MCHJ</option>
                  <option value="Sayxunobod Intake Station">Sayxunobod Qabul Punkti</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-2">
                  Yetkazib Berish Muddati
                </label>
                <input
                  type="text"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/15 px-4 text-xs font-bold text-white focus:border-[#00ffc8] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full h-13 rounded-2xl bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] font-black text-sm tracking-wide shadow-xl shadow-[#00ffc8]/25 hover:shadow-[#00ffc8]/40 hover:scale-[1.01] transition cursor-pointer"
            >
              Buyurtmani Tasdiqlash va Eskrou Depozitini Bloklash →
            </button>
          </form>

          {/* RIGHT: ESCROW & CLEARING SIDEBAR */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-[28px] bg-white/[0.03] border border-white/10 p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono uppercase text-white/50">Hisoblangan Eskrou Budjeti</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30">
                  Agrobank ATB
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black font-mono text-[#00ffc8]">
                  {totalEscrowRequired.toLocaleString()} UZS
                </span>
                <span className="text-xs text-white/50">
                  {targetVolumeLiters.toLocaleString()} litr × {maxPricePerLiter.toLocaleString()} UZS
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Asosiy xarid qiymati:</span>
                  <span className="font-mono font-bold text-white">{totalEscrowRequired.toLocaleString()} UZS</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Platforma komissiyasi:</span>
                  <span className="font-mono text-[#00ffc8]">0.0% (Subsidiyalangan)</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Kliring turi:</span>
                  <span className="font-mono text-white/90">ISO 20022 pacs.008</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Sovuq zanjir monitoringi:</span>
                  <span className="font-mono text-[#00ffc8]">Faol (BLE + GPS)</span>
                </div>
              </div>

              <div className="text-[11px] text-white/50 leading-relaxed">
                ℹ Buyurtma joylashtirilganda, mablagʻ darhol zavod hisobidan chiqarilmaydi, balki Agrobankdagi maxsus eskrou hisobingizda kafolat sifatida bloklanadi va faqatgina zavod laboratoriyasi qabul qilganidan soʻng fermerlarga toʻlanadi.
              </div>
            </div>

            {/* Regional Suppliers Matched */}
            <div className="rounded-[28px] bg-white/[0.03] border border-white/10 p-5 flex flex-col gap-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Mintaqadagi Mos Yetkazib Beruvchilar</span>
                <span className="text-[10px] font-mono text-[#00ffc8] bg-[#00ffc8]/10 px-2 py-0.5 rounded-full">
                  {catalogSuppliers.length || 6} ta faol
                </span>
              </div>
              <div className="divide-y divide-white/5 text-xs">
                {(catalogSuppliers.length > 0 ? catalogSuppliers : [
                  { organization_id: "s-1", legal_name: "Baraka Agro Kooperativ", daily_capacity_liters: 14500, trust_score: 98 },
                  { organization_id: "s-2", legal_name: "Chorva Invest MCHJ", daily_capacity_liters: 12000, trust_score: 95 },
                  { organization_id: "s-3", legal_name: "Zarafshon Agro Hamkor", daily_capacity_liters: 8500, trust_score: 92 },
                ]).slice(0, 3).map((s, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{s.legal_name}</div>
                      <div className="text-[10px] text-white/50 font-mono">Kunlik: {s.daily_capacity_liters?.toLocaleString()} L</div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#00ffc8] bg-[#00ffc8]/10 px-2 py-0.5 rounded-full">
                      ★ {s.trust_score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
