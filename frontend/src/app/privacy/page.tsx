"use client";

import React from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { ThemeToggleButton } from "@/context/ThemeContext";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d1013] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      {/* 1. AMBIENT TURQUOISE DREAMLAND BACKDROP AURORAS */}
      <div className="absolute top-10 -left-40 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-25 animate-pulse"
          style={{ background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 40%, transparent 70%)" }}
        />
      </div>
      <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle, #00d3e0 0%, #0099ff 50%, transparent 70%)" }}
        />
      </div>

      {/* Subtle Dot Grid Canvas Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00d3e0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-[920px] mx-auto relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <Link href="/" className="inline-flex transition-transform hover:scale-105">
            <ZaminFlowLogo size="md" mode="dark" />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggleButton size="sm" />
            <Link
              href="/"
              className="text-xs font-bold px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <span>&larr;</span>
              <span>Bosh sahifaga qaytish</span>
            </Link>
          </div>
        </header>

        {/* Content Card */}
        <article className="rounded-[36px] p-8 sm:p-12 bg-[#14181d]/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_80px_rgba(0,153,255,0.18)] space-y-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent mb-2">
              Maxfiylik Siyosati &bull; Privacy Policy
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Shaxsiy maʼlumotlarni qayta ishlash siyosati
            </h1>
            <p className="text-xs text-white/50 mt-2 font-mono">
              Oʻzbekiston Respublikasining 2019-yil 2-iyuldagi OʻRQ-547-sonli &ldquo;Shaxsiy maʼlumotlar toʻgʻrisida&rdquo;gi Qonuniga muvofiq
            </p>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Umumiy qoidalar</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Mazkur Siyosat &ldquo;ZaminFlow&rdquo; MCHJ (keyingi oʻrinlarda &mdash; &ldquo;Operator&rdquo;) tomonidan yuritiladigan raqamli sut taʼminoti zanjiri va fintex ekotizimidan foydalanishda jismoniy va yuridik shaxslarning shaxsiy maʼlumotlarini yigʻish, saqlash va qayta ishlash tartibini belgilaydi.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Maʼlumotlarni mahalliylashtirish (OʻRQ-547, 27¹-modda)</h2>
            <div className="p-4 rounded-2xl bg-[#00ffc8]/10 border border-[#00ffc8]/30 text-sm leading-relaxed text-[#00ffc8]">
              <strong>Qonuniy talab:</strong> Oʻzbekiston Respublikasi fuqarolarining shaxsiy maʼlumotlari (F.I.Sh., STIR, telefon raqamlari, transport vositalari GPS telemetriyasi) Operatorning Oʻzbekiston Respublikasi hududida jismonan joylashgan serverlarida saqlanadi va qayta ishlanadi.
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Qayta ishlanadigan maʼlumotlar toifalari</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-white/80">
              <li>Identifikatsiya maʼlumotlari: F.I.Sh., STIR / JShShIR, tashkilot nomi, bank hisob raqamlari.</li>
              <li>Aloqa maʼlumotlari: telefon raqami, elektron pochta manzili, yuridik manzil.</li>
              <li>Logistika va IoT telemetriya: transport vositasining real vaqtdagi GPS koordinatalari, sisterna harorati (sovuq zanjir datchiklari), yoʻl varaqalari raqamlari.</li>
              <li>Laboratoriya va sifat koʻrsatkichlari: xom sut yogʻliligi, zichligi, kislotaliligi, oqsil miqdori.</li>
              <li>Tranzaksiya maʼlumotlari: Agrobank ATB orqali amalga oshirilgan eskrou toʻlovlari va ISO 20022 kliring xabarlari.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Xavfsizlik choralari</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Operator barcha uzatiladigan maʼlumotlarni TLS 1.3 shifrlash protokollari bilan himoyalaydi. Bank kliring operatsiyalari Markaziy Bankning xavfsizlik reglamentlari va ikki yoqlama buxgalteriya yozuvlariga muvofiq olib boriladi.
            </p>
          </section>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
            <span>Oxirgi yangilanish: 2026-yil 8-noyabr</span>
            <Link href="/terms" className="text-[#00ffc8] hover:underline font-bold">
              Foydalanish shartlari bilan tanishish &rarr;
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
