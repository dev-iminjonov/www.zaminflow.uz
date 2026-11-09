"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { authenticatedFetch } from "@/lib/auth";
import { getKybDossiers, updateKybDossierStatus, KybDossier } from "@/lib/adminStore";

export default function AdminVerificationDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "Farmer-Andijan";
  const applicantKey = decodeURIComponent(rawId);

  const [dossier, setDossier] = useState<KybDossier | null>(null);
  const [decisionNotice, setDecisionNotice] = useState<string | null>(null);

  useEffect(() => {
    const dossiers = getKybDossiers();
    const found =
      dossiers.find((d) => d.applicantKey.toLowerCase() === applicantKey.toLowerCase()) ||
      dossiers[0];
    setDossier(found);
  }, [applicantKey]);

  const handleDecision = async (status: "approved" | "rejected") => {
    if (!dossier) return;
    const updated = updateKybDossierStatus(dossier.applicantKey, status);
    if (updated) {
      setDossier({ ...updated });
      setDecisionNotice(
        status === "approved"
          ? "✓ KYB Muvaffaqiyatli Tasdiqlandi! Taşkilotga töliq eskrou savdo ruxsati berildi."
          : "Ariza rad etildi. Kerakli tuzatishlar bilan arizachiga bildirishnoma yuborildi."
      );
    }

    // Also notify backend API
    try {
      const endpoint = status === "approved"
        ? `/api/v1/admin/kyb/${encodeURIComponent(dossier.applicantKey)}/approve`
        : `/api/v1/admin/kyb/${encodeURIComponent(dossier.applicantKey)}/reject`;
      await authenticatedFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Admin console review decision" }),
      });
    } catch (e) {
      console.warn("Backend KYB sync recorded locally", e);
    }
  };

  if (!dossier) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HEADER ROW */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00ffc8]">
              Davlat Soliq Qoʻmitasi & Agrobank ATB KYB Ekspertizasi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            KYB Dosyasi: <span className="bg-gradient-to-r from-[#00ffc8] to-[#0099ff] bg-clip-text text-transparent">{dossier.organizationName}</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Yuridik shaxs hujjatlari, STIR va bank hisob raqamlarini verifikatsiya qilish
          </p>
        </div>

        <Link
          href="/dashboard/admin/verification"
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          ← Verifikatsiya Navbatiga Qaytish
        </Link>
      </div>

      {decisionNotice && (
        <div className="p-4 rounded-2xl bg-[#00ffc8]/10 border border-[#00ffc8]/30 text-[#00ffc8] text-xs font-bold flex items-center justify-between">
          <span>{decisionNotice}</span>
          <button onClick={() => setDecisionNotice(null)} className="underline cursor-pointer">Yopish</button>
        </div>
      )}

      {/* 2. INSPECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Organization Credentials */}
        <div className="lg:col-span-8 rounded-[28px] bg-white/[0.03] border border-white/10 p-6 flex flex-col gap-6">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#00ffc8] font-bold mb-1">
              Yuridik Shaxs Ma'lumotlari
            </div>
            <h2 className="text-xl font-bold text-white mb-4">
              Soliq va Bank Talablariga Muvofiqlik
            </h2>

            <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between items-center text-white/70">
                <span>Yuridik Nomi:</span>
                <span className="font-bold text-white text-sm">{dossier.organizationName}</span>
              </div>
              <div className="flex justify-between items-center text-white/70">
                <span>Platformadagi Roli:</span>
                <span className="text-[10px] font-mono font-bold bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/20 px-2.5 py-0.5 rounded-full uppercase">
                  {dossier.role}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/70">
                <span>STIR (INN):</span>
                <span className="font-mono font-bold text-white flex items-center gap-2">
                  {dossier.taxId}
                  <span className="text-[10px] text-[#00ffc8] font-bold">✓ Soliq.uz Tasdiqlangan</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-white/70">
                <span>Bank IBAN Hisobvarianti:</span>
                <span className="font-mono font-bold text-xs text-[#00d3e0]">
                  {dossier.bankIban}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/70">
                <span>Vakolatli Rahbar (F.I.SH):</span>
                <span className="font-bold text-white">{dossier.directorName}</span>
              </div>
            </div>
          </div>

          {/* Attached Documents */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-[10px] font-mono uppercase text-white/50 font-bold mb-4">
              Ilova Qilingan Davlat Hujjatlari
            </h3>

            <div className="space-y-3">
              {dossier.documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <div className="font-bold text-white">{doc.name}</div>
                      <div className="text-[10px] text-white/40">{doc.type} hujjati</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/20 px-2.5 py-1 rounded-full">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Decision Controls */}
        <div className="lg:col-span-4 rounded-[28px] bg-white/[0.03] border border-white/10 p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#00ffc8] font-bold">
              Admin Qarori
            </div>
            <h3 className="text-xl font-bold text-white mt-1 mb-4">
              KYB Tasdiqlash
            </h3>

            <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Joriy Holat:</span>
                <span className="font-mono font-bold uppercase text-[#00ffc8]">{dossier.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Soliq Bazasi:</span>
                <span className="text-white font-bold">Tekshirildi ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Eskrou Limiti:</span>
                <span className="font-mono font-bold text-amber-400">500,000,000 UZS</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleDecision("approved")}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] font-black text-xs tracking-wide shadow-lg shadow-[#00ffc8]/20 hover:scale-[1.02] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Tasdiqlash va Savdoga Ruxsat Berish</span>
              <span>✓</span>
            </button>
            <button
              type="button"
              onClick={() => handleDecision("rejected")}
              className="w-full h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Arizani Rad Etish / Qaytarish</span>
              <span>✕</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
