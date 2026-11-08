"use client";

import React from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070B14] text-[#E8F1F2] selection:bg-[#52b788]/25 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[880px] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
          <Link href="/" className="inline-flex">
            <ZaminFlowLogo size="md" mode="dark" />
          </Link>
          <Link
            href="/"
            className="text-xs font-bold px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white transition flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Bosh sahifaga qaytish</span>
          </Link>
        </header>

        {/* Content Card */}
        <article className="rounded-[32px] p-8 sm:p-12 bg-[#13293D]/80 backdrop-blur-xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.4)] space-y-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#22d36b] mb-2">
              Foydalanish Shartlari &bull; Terms of Service
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              ZaminFlow B2B platformasidan foydalanish shartlari
            </h1>
            <p className="text-xs text-white/60 mt-2 font-mono">
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
            <h2 className="text-xl font-bold text-white">2. Sifat parametrlari va narxni shakllantirish</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Xom sut partiyasi qabulida bazaviy fermer narxi davlat standartlari (yogʻlilik 3.60%, QAYQ 8.50%, harorat &le; 4.0&deg;C) asosida laboratoriya titratsiya xulosasiga koʻra avtomatik koeffitsiyentlar bilan qayta hisoblanadi.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Eskrou va toʻlov kafolati</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Xaridor korxona shartnoma boʻyicha mablagʻlarni hamkor bankdagi ajratilgan eskrou hisobvaragʻiga joylashtiradi. Sut partiyasi qabul qilingan va laboratoriya tahlili tasdiqlangan zahoti mablagʻlar avtomatik ravishda fermer hisobiga oʻtkaziladi.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Nizolarni hal qilish</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Laboratoriya koʻrsatkichlari boʻyicha kelishmovchilik vujudga kelganda (yogʻlilik farqi &gt;0.20%), partiya muzlatiladi va mustaqil akkreditatsiyadan oʻtgan laboratoriya tahlili oʻtkaziladi.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Yuridik maʼlumotlar</h2>
            <p className="text-sm leading-relaxed text-white/80">
              &ldquo;ZaminFlow&rdquo; MCHJ &bull; STIR: 309 845 120
              <br />
              Toshkent sh., Mirzo Ulugʻbek t., Mustaqillik shoh koʻchasi, 105
              <br />
              Telefon: +998 71 200 00 24 &bull; Email: legal@zaminflow.uz
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
