"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getKybDossiers, KybDossier } from "@/lib/adminStore";

export default function AdminVerificationPage() {
  const [dossiers, setDossiers] = useState<KybDossier[]>([]);

  useEffect(() => {
    setDossiers(getKybDossiers());
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            KYB MUVOFIQLIK VA VERIFIKATSIYA
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            KYB Verifikatsiya &{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Dosyelar Navbati
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Soliq.uz va Davlat xizmatlari reyestri orqali tekshirilgan yuridik shaxslar arizalari
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:border-white/20 text-xs font-bold text-white/70 hover:text-white transition"
        >
          ← Umumiy Ko'rinishga Qaytish
        </Link>
      </header>

      {/* 2. QUEUE METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase flex items-center justify-between">
            <span>Ko'rib Chiqilmoqda</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-amber-300">9</span>
            <span className="text-xs text-white/50">ta dosye navbatda</span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
            Soliq.uz STIR Integratsiyasi
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-3xl font-black text-[#00ffc8]">100%</span>
            <span className="text-xs text-[#00ffc8]">✓ Avto-Tasdiqlangan</span>
          </div>
        </div>

        <div className="rounded-[24px] p-5 bg-white/[0.03] border border-white/10 hover:border-[#00d3e0]/40 transition-all flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
            Bank IBAN Kliring
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono text-xl font-black text-white">Agrobank API</span>
            <span className="ml-auto text-[10px] font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-2.5 py-0.5">
              Faol
            </span>
          </div>
        </div>
      </section>

      {/* 3. DOSSIERS LIST */}
      <section className="rounded-[28px] bg-white/[0.03] border border-white/10 p-6 shadow-lg flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-[#00d3e0] uppercase">
              OPERATOR TEKSHIRUVI KUTILMOQDA
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">
              Topshirilgan KYB Arizalari
            </h2>
          </div>
          <span className="text-xs text-white/50 font-mono">
            Jami: {dossiers.length} ta
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          {dossiers.map((dossier) => (
            <div
              key={dossier.id}
              className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#00d3e0]/40 hover:bg-white/[0.04] transition"
            >
              <div className="flex-[1_1_280px]">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-bold text-base text-white">
                    {dossier.organizationName}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-[#00ffc8] rounded-full px-2 py-0.5">
                    {dossier.role}
                  </span>
                </div>
                <div className="text-xs text-white/60">
                  Viloyat: <strong className="text-white">{dossier.region}</strong> • STIR: <strong className="font-mono text-white">{dossier.taxId}</strong>
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  Topshirilgan: {dossier.submittedTimeAgo}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-xs">
                <div>
                  <div className="text-white/40 text-[11px]">Direktor: <strong className="text-white">{dossier.directorName}</strong></div>
                  <div className="text-white/40 text-[11px]">Hujjatlar: <strong className="text-[#00d3e0]">{dossier.documents.length} ta tasdiqlangan ilova</strong></div>
                </div>

                <div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                      dossier.status === "approved"
                        ? "bg-[#00ffc8]/15 border-[#00ffc8]/30 text-[#00ffc8]"
                        : "bg-amber-400/15 border-amber-400/30 text-amber-300"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dossier.status === "approved" ? "bg-[#00ffc8]" : "bg-amber-400 animate-pulse"}`} />
                    {dossier.status === "approved" ? "Tasdiqlangan" : "Ko'rib chiqish lozim"}
                  </span>
                </div>

                <Link
                  href={`/dashboard/admin/verification/${dossier.applicantKey}`}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition"
                >
                  Dosyeni Tekshirish →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
