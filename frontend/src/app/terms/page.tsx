"use client";

import React from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { ThemeToggleButton } from "@/context/ThemeContext";

export default function TermsPage() {
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
              Foydalanish Shartlari &bull; Terms of Service
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              ZaminFlow B2B platformasidan foydalanish shartlari
            </h1>
            <p className="text-xs text-white/50 mt-2 font-mono">
              Oʻzbekiston Respublikasining Fuqarolik Kodeksi va &ldquo;Elektron tijorat toʻgʻrisida&rdquo;gi Qonuni asosida
            </p>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Platforma maqomi va ishtirokchilar</h2>
            <p className="text-sm leading-relaxed text-white/80">
              ZaminFlow sut ishlab chiqaruvchi fermer xoʻjaliklari, sutni qayta ishlovchi sanoat korxonalari va ixtisoslashtirilgan sut tashuvchi logistika operatorlari oʻrtasida shartnomalar tuzish, sifat nazoratini olib borish va xavfsiz hisob-kitoblarni amalga oshirish uchun raqamli infratuzilma hisoblanadi.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Bank eskrou va moliyaviy kliring</h2>
            <div className="p-4 rounded-2xl bg-[#00ffc8]/10 border border-[#00ffc8]/30 text-sm leading-relaxed text-[#00ffc8]">
              <strong>Eskrou kafolati:</strong> Barcha xarid operatsiyalari buyurtmachi zavod tomonidan Agrobank ATB maxsus hisobvaragʻida toʻliq mablagʻ bloklangandan soʻng boshlanadi. Sut qabul qilish bunkerida sifat testi muvaffaqiyatli oʻtgach, mablagʻ fermer hisobiga ISO 20022 standarti boʻyicha avtomatik oʻtkaziladi.
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Sifat standartlari va nizolarni hal qilish (Arbitraj)</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Xom sut GOST 31449-2013 va OʻzDSt standartlariga muvofiq boʻlishi shart. Agar qabul qilish vaqtida yogʻlilik yoki zichlik koʻrsatkichlari shartnomaga mos kelmasa, partiya platformaning arbitraj rejimiga oʻtkaziladi va mustaqil laboratoriya tekshiruvi natijasiga koʻra toʻlov summasi qayta hisoblanadi.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Sovuq zanjir va logistika masʼuliyati</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Tashuvchi haydovchi tashish davomida sut haroratini 2°C – 4°C oraligʻida saqlashga javobgardir. IoT datchiklari orqali harorat meʼyordan oshgani qayd etilsa, jarima choralari shartnoma shartlariga muvofiq qoʻllaniladi.
            </p>
          </section>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
            <span>Oxirgi tahrir: 2026-yil 8-noyabr</span>
            <Link href="/privacy" className="text-[#00ffc8] hover:underline font-bold">
              Maxfiylik siyosati bilan tanishish &rarr;
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
