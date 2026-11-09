"use client";

import React, { useState } from "react";
import Link from "next/link";

interface PlatformUser {
  id: string;
  fullName: string;
  legalName: string;
  role: "farmer" | "dairy" | "driver" | "admin";
  taxId: string;
  region: string;
  kybStatus: "VERIFIED" | "PENDING_REVIEW" | "SUSPENDED";
  status: "active" | "inactive";
  joinedDate: string;
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const users: PlatformUser[] = [
    {
      id: "u-1",
      fullName: "Muhammadaziz Iminjonov",
      legalName: "Baraka Agro Cooperative",
      role: "farmer",
      taxId: "308112940",
      region: "Tashkent",
      kybStatus: "VERIFIED",
      status: "active",
      joinedDate: "12 Oct 2026",
    },
    {
      id: "u-2",
      fullName: "Malika Karimova",
      legalName: "Toshkent Sut Kombinati LLC",
      role: "dairy",
      taxId: "201948512",
      region: "Tashkent",
      kybStatus: "VERIFIED",
      status: "active",
      joinedDate: "04 Sep 2026",
    },
    {
      id: "u-3",
      fullName: "Bobur Rahimov",
      legalName: "Chilled Trans Logistics LLC",
      role: "driver",
      taxId: "309114820",
      region: "Samarqand",
      kybStatus: "VERIFIED",
      status: "active",
      joinedDate: "18 Oct 2026",
    },
    {
      id: "u-4",
      fullName: "Alisher Valiyev",
      legalName: "Samarqand Chorva Invest",
      role: "farmer",
      taxId: "305882199",
      region: "Samarqand",
      kybStatus: "PENDING_REVIEW",
      status: "active",
      joinedDate: "05 Nov 2026",
    },
    {
      id: "u-5",
      fullName: "Dilnoza Usmanova",
      legalName: "Fergana Valley Dairy MCHJ",
      role: "dairy",
      taxId: "208771940",
      region: "Fergana",
      kybStatus: "PENDING_REVIEW",
      status: "active",
      joinedDate: "06 Nov 2026",
    },
  ];

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.legalName.toLowerCase().includes(q) ||
        u.taxId.includes(q) ||
        u.region.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. HEADER ROW */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black tracking-widest bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent uppercase mb-1">
            FOYDALANUVCHILAR VA TIZIM RO'YXATI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Foydalanuvchilar & Korporativ{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              Kirish Katalogi
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Barcha fermerlar, sut zavodlari va logistika parki akkauntlarini boshqarish
          </p>
        </div>

        <Link
          href="/dashboard/admin/verification"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 text-[#070B14] font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,211,224,0.35)] transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <span>Kutilayotgan Dosyelar (2) →</span>
        </Link>
      </header>

      {/* 2. SEARCH & FILTERS */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: `Barchasi (${users.length})` },
            { id: "farmer", label: `Fermerlar (${users.filter((u) => u.role === "farmer").length})` },
            { id: "dairy", label: `Sut Zavodlari (${users.filter((u) => u.role === "dairy").length})` },
            { id: "driver", label: `Haydovchilar (${users.filter((u) => u.role === "driver").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                roleFilter === tab.id
                  ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] shadow-md font-black"
                  : "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Nomi, STIR (INN) yoki viloyat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-full bg-white/5 border border-white/10 px-4 text-xs font-semibold text-white placeholder:text-white/30 focus:border-[#00d3e0] outline-none"
          />
        </div>
      </div>

      {/* 3. USERS TABLE */}
      <section className="rounded-[28px] bg-white/[0.03] border border-white/10 p-6 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase font-mono text-[10px]">
                <th className="py-3 px-3">Tashkilot / Vakil</th>
                <th className="py-3 px-3">Rol</th>
                <th className="py-3 px-3">STIR (INN)</th>
                <th className="py-3 px-3">Viloyat</th>
                <th className="py-3 px-3">KYB Holati</th>
                <th className="py-3 px-3">Akkaunt</th>
                <th className="py-3 px-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white text-sm">{u.legalName}</div>
                    <div className="text-xs text-white/50">{u.fullName}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00ffc8] bg-[#00ffc8]/10 border border-[#00ffc8]/20 px-2.5 py-0.5 rounded-full">
                      {u.role === "farmer" ? "Fermer" : u.role === "dairy" ? "Zavod" : u.role === "driver" ? "Haydovchi" : "Admin"}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    {u.taxId}
                  </td>
                  <td className="py-3.5 px-3 text-white/80">
                    {u.region}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 inline-flex items-center gap-1 border ${
                        u.kybStatus === "VERIFIED"
                          ? "bg-[#00ffc8]/15 border-[#00ffc8]/30 text-[#00ffc8]"
                          : "bg-amber-400/15 border-amber-400/30 text-amber-300"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.kybStatus === "VERIFIED" ? "bg-[#00ffc8]" : "bg-amber-400 animate-pulse"}`} />
                      {u.kybStatus === "VERIFIED" ? "Tasdiqlangan" : "Ko'rib chiqilmoqda"}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-bold text-[#00ffc8] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8]" />
                      Faol
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {u.kybStatus !== "VERIFIED" ? (
                      <Link
                        href={`/dashboard/admin/verification/${encodeURIComponent(u.role + "-" + u.region)}`}
                        className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs hover:opacity-95 transition"
                      >
                        Dosyeni ko'rish →
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/profile/${encodeURIComponent(u.id)}`}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#00ffc8] text-white/80 hover:text-white text-xs font-semibold transition"
                      >
                        Dosye ↗
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
