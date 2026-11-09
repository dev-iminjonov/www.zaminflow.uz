"use client";

import React from "react";
import Link from "next/link";
import { SplashDoodle } from "./DoodleAccents";

interface RoleActor {
  role: string;
  name: string;
  avatar: string;
  chatBubble: string;
  badge: string;
  color: string;
}

const actors: RoleActor[] = [
  {
    role: "Fermer",
    name: "Baraka Agro Fermasi",
    avatar: "🌾",
    chatBubble: "12,000 L sut topshirildi! Sifat: A+",
    badge: "Sayxunobod",
    color: "#00ffc8",
  },
  {
    role: "Sut Zavodi",
    name: "Toshkent Sut Kombinati",
    avatar: "🏭",
    chatBubble: "Laboratoriya qabul qildi, tölov tasdiqlandi!",
    badge: "Yirik Xaridor",
    color: "#0099ff",
  },
  {
    role: "Haydovchi",
    name: "MAN TGS Sovuq Tanker",
    avatar: "🚛",
    chatBubble: "+3.2°C saqlandi, yetib keldim!",
    badge: "IoT Telematika",
    color: "#00d3e0",
  },
  {
    role: "Bank Eskrou",
    name: "AgroBank Hamkor",
    avatar: "🏦",
    chatBubble: "Eskrou mablaği fermer hisobiga çiqarildi!",
    badge: "Kafolatlangan",
    color: "#00c5e7",
  },
];

export default function EcosystemCommunitySection({ isDark = false }: { isDark?: boolean }) {
  return (
    <section className="relative w-full py-20 sm:py-28 overflow-hidden select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading + Value Proposition + Action Pill */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black tracking-widest uppercase text-[#00d3e0]">
                EKOTIZIM & ISHONCH
              </span>
              <SplashDoodle size={24} color="#00ffc8" />
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.25] sm:leading-[1.3] mb-6 ${
                isDark ? "text-white" : "text-[#081c15]"
              }`}
            >
              Yetkazuvchidan Zavodgacha:{" "}
              <span className={`inline ${
                isDark
                  ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#0369a1] bg-clip-text text-transparent"
              }`}>
                Yagona Ishonch Zanjiri
              </span>
            </h2>

            <p
              className={`text-base sm:text-lg leading-relaxed mb-8 ${
                isDark ? "text-[#E8F1F2]/75" : "text-[#2d6a4f]"
              }`}
            >
              Fermerlar sifatli sut yetkazadi, haydovchilar sovuq zanjirni kafolatlaydi,
              qayta ishlovchilar xomashyo taqchilligidan qutuladi va bank to'lovlarni kafolatlaydi.
              Barchasi ZaminFlow ekotizimida birlashgan.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/sign-up"
                className="px-8 py-4 rounded-full font-extrabold text-sm sm:text-base text-[#070B14] bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-95 shadow-[0_12px_36px_rgba(0,153,255,0.28)] transition-all flex items-center gap-2"
              >
                <span>Ekotizimga Qöşiling</span>
                <span>→</span>
              </Link>
              <Link
                href="/sign-in"
                className={`px-7 py-4 rounded-full font-bold text-sm sm:text-base border transition-all ${
                  isDark
                    ? "border-white/20 text-white hover:bg-white/10"
                    : "border-slate-300 text-slate-800 hover:bg-slate-100"
                }`}
              >
                Kabinetga Kirish
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Actor Cluster with Dynamic Chat Bubbles */}
          <div className="relative flex flex-col gap-4">
            {actors.map((actor, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-[24px] border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] shadow-lg flex items-center gap-4 ${
                  isDark
                    ? "bg-[#14181d]/85 border-white/10"
                    : "bg-white/95 border-[#b7e4c7] shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
                }`}
                style={{
                  transform: `translateX(${idx % 2 === 0 ? "0px" : "12px"})`,
                }}
              >
                {/* Avatar Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0"
                  style={{
                    backgroundColor: `${actor.color}20`,
                    border: `1.5px solid ${actor.color}40`,
                  }}
                >
                  {actor.avatar}
                </div>

                {/* Actor Info & Chat Bubble */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-sm font-extrabold truncate ${
                        isDark ? "text-white" : "text-[#081c15]"
                      }`}
                    >
                      {actor.name}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                      style={{
                        backgroundColor: `${actor.color}20`,
                        color: actor.color,
                        border: `1px solid ${actor.color}40`,
                      }}
                    >
                      {actor.badge}
                    </span>
                  </div>

                  {/* Dark Chat Bubble */}
                  <div className="p-2.5 rounded-xl bg-[#070B14] text-white/90 text-xs font-medium flex items-center gap-1.5 shadow-inner">
                    <span className="text-[#00ffc8] text-sm">💬</span>
                    <span className="truncate">{actor.chatBubble}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
