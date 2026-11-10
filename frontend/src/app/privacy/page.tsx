"use client";

import React from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggleButton, useTheme } from "@/context/ThemeContext";

export default function PrivacyPage() {
  const { themeMode, isDark } = useTheme();

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none transition-colors duration-300 ${
      isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f4fbfe] text-[#03045e]"
    }`}>
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
        <header className={`flex items-center justify-between border-b pb-6 mb-8 ${isDark ? "border-white/10" : "border-[#ade8f4]/60"}`}>
          <Link href="/" className="inline-flex transition-transform hover:scale-105">
            <ZaminFlowLogo size="md" mode={themeMode} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher isDark={isDark} />
            <ThemeToggleButton size="sm" />
            <Link
              href="/"
              className={`text-xs font-bold px-4 py-2 rounded-full border transition flex items-center gap-1.5 shadow-xs ${
                isDark
                  ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  : "border-[#ade8f4] bg-white hover:bg-[#ade8f4]/20 text-[#03045e] shadow-xs"
              }`}
            >
              <span>&larr;</span>
              <span>Boş sahifaga qaytiş</span>
            </Link>
          </div>
        </header>

        {/* Content Card */}
        <article className={`rounded-[36px] p-8 sm:p-12 border shadow-xl space-y-8 backdrop-blur-2xl ${
          isDark
            ? "bg-[#14181d]/90 border-white/10 shadow-[0_25px_80px_rgba(0,153,255,0.18)]"
            : "bg-white border-[#ade8f4] shadow-[0_10px_35px_rgba(0,153,255,0.06)]"
        }`}>
          <div>
            <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${
              isDark ? "bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent" : "text-emerald-700"
            }`}>
              Maxfiylik Siyosati &bull; Privacy Policy
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Şaxsiy maʼlumotlarni qayta işlaş siyosati
            </h1>
            <p className={`text-xs mt-2 font-mono ${isDark ? "text-white/50" : "text-slate-500"}`}>
              Özbekiston Respublikasining 2019-yil 2-iyuldagi ÖRQ-547-sonli &ldquo;Şaxsiy maʼlumotlar töğrisida&rdquo;gi Qonuniga muvofiq
            </p>
          </div>

          <div className={`h-px ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>1. Umumiy qoidalar</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-white/80" : "text-slate-600"}`}>
              Mazkur Siyosat &ldquo;ZaminFlow&rdquo; MÇJ (keyingi örinlarda &mdash; &ldquo;Operator&rdquo;) tomonidan yuritiladigan raqamli sut taʼminoti zanjiri va fintex ekotizimidan foydalanişda jismoniy va yuridik şaxslarning şaxsiy maʼlumotlarini yiğiş, saqlaş va qayta işlaş tartibini belgilaydi.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>2. Maʼlumotlarni mahalliylaştiriş (ÖRQ-547, 27¹-modda)</h2>
            <div className={`p-4 rounded-2xl border text-sm leading-relaxed ${
              isDark
                ? "bg-[#00ffc8]/10 border-[#00ffc8]/30 text-[#00ffc8]"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}>
              <strong>Qonuniy talab:</strong> Özbekiston Respublikasi fuqarolarining şaxsiy maʼlumotlari (F.I.Ş., STIR, telefon raqamlari, transport vositalari GPS telemetriyasi) Operatorning Özbekiston Respublikasi hududida jismonan joylaşgan serverlarida saqlanadi va qayta işlanadi.
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>3. Qayta işlanadigan maʼlumotlar toifalari</h2>
            <ul className={`list-disc pl-5 space-y-2 text-sm ${isDark ? "text-white/80" : "text-slate-600"}`}>
              <li>Identifikatsiya maʼlumotlari: F.I.Ş., STIR / JŞŞIR, taşkilot nomi, bank hisob raqamlari.</li>
              <li>Aloqa maʼlumotlari: telefon raqami, elektron poçta manzili, yuridik manzil.</li>
              <li>Logistika va IoT telemetriya: transport vositasining real vaqtdagi GPS koordinatalari, sisterna harorati (sovuq zanjir datçiklari), yöl varaqalari raqamlari.</li>
              <li>Laboratoriya va sifat körsatkiçlari: xom sut yoğliligi, ziçligi, kislotaliligi, oqsil miqdori.</li>
              <li>Tranzaksiya maʼlumotlari: Agrobank ATB orqali amalga oşirilgan eskrou tölovlari va ISO 20022 kliring xabarlari.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>4. Xavfsizlik çoralari</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-white/80" : "text-slate-600"}`}>
              Operator barça uzatiladigan maʼlumotlarni TLS 1.3 şifrlaş protokollari bilan himoyalaydi. Bank kliring operatsiyalari Markaziy Bankning xavfsizlik reglamentlari va ikki yoqlama buxgalteriya yozuvlariga muvofiq olib boriladi.
            </p>
          </section>

          <div className={`pt-6 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
            isDark ? "border-white/10 text-white/50" : "border-slate-200 text-slate-500"
          }`}>
            <span>Oxirgi yangilaniş: 2026-yil 8-noyabr</span>
            <Link href="/terms" className={`font-bold hover:underline ${isDark ? "text-[#00ffc8]" : "text-emerald-700"}`}>
              Foydalaniş şartlari bilan tanişiş &rarr;
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
