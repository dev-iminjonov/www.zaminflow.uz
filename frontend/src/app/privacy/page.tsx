"use client";

import React from "react";
import Link from "next/link";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { locale } = useLanguage();

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
              Maxfiylik Siyosati &bull; Privacy Policy
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Shaxsiy maʼlumotlarni qayta ishlash siyosati
            </h1>
            <p className="text-xs text-white/60 mt-2 font-mono">
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
            <div className="p-4 rounded-2xl bg-[#00C853]/10 border border-[#00C853]/30 text-sm leading-relaxed text-[#22d36b]">
              <strong>Qonuniy talab:</strong> Oʻzbekiston Respublikasi fuqarolarining shaxsiy maʼlumotlari (F.I.Sh., STIR, telefon raqamlari, transport vositalari GPS telemetriyasi) Operatorning Oʻzbekiston Respublikasi hududida jismonan joylashgan serverlarida saqlanadi va qayta ishlanadi.
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Qayta ishlanadigan maʼlumotlar tarkibi</h2>
            <ul className="list-disc pl-5 text-sm space-y-2 text-white/80">
              <li><strong>Fermerlar va korxonalar:</strong> Yuridik nomi, STIR, bank rekvizitlari, aloqa raqamlari, ferma joylashuvi koordinatalari, kunlik sut hajmi va sifat koʻrsatkichlari (yogʻlilik, QAYQ, kislotalilik).</li>
              <li><strong>Logistika haydovchilari:</strong> Shaxsni tasdiqlovchi maʼlumotlar, avtotransport davlat raqami, yetkazib berish vaqtida sovuq zanjir harorat datchiklari va GPS marshruti.</li>
              <li><strong>Moliya va toʻlovlar:</strong> Eskrou hisobvaraqlaridagi tranzaksiyalar, qabul aktlari va bank oʻtkazmalari tarixi.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Maʼlumotlar xavfsizligi</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Barcha sessiyalar xavfsiz shifrlangan <code>HttpOnly; Secure; SameSite=Lax</code> kukilar orqali himoyalanadi. Tranzaksiya maʼlumotlari ikki tomonlama buxgalteriya balansi reestrida va kriptografik xeshlar bilan himoyalangan.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Bogʻlanish</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Shaxsiy maʼlumotlaringiz boʻyicha savollar yoki soʻrovlar uchun:
              <br />
              Email: <a href="mailto:privacy@zaminflow.uz" className="text-[#22d36b] underline">privacy@zaminflow.uz</a>
              <br />
              Manzil: Toshkent sh., Mirzo Ulugʻbek tumani, Mustaqillik shoh koʻchasi, 105
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
