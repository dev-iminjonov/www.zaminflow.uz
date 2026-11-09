"use client";

import React from "react";
import { SplashDoodle } from "./DoodleAccents";
import { useLanguage } from "@/context/LanguageContext";

export default function BenefitsSection({ isDark = true }: { isDark?: boolean }) {
  const { t } = useLanguage();
  const benefits = t.benefitsSection.cards;

  return (
    <section id="benefits" className="relative w-full py-20 sm:py-28 select-none overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Top Grid: Left Title + Subtitle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14 sm:mb-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black tracking-widest uppercase text-[#00d3e0]">
                {t.benefitsSection.badge}
              </span>
              <SplashDoodle size={24} color="#00ffc8" />
            </div>
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.25] sm:leading-[1.3] ${
                isDark ? "text-white" : "text-[#03045e]"
              }`}
            >
              {t.benefitsSection.title1}
              <span className={`inline ${
                isDark
                  ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#0369a1] bg-clip-text text-transparent"
              }`}>
                {t.benefitsSection.title2}
              </span>
            </h2>
          </div>

          <p
            className={`text-sm sm:text-base max-w-md leading-relaxed font-normal ${
              isDark ? "text-[#E8F1F2]/70" : "text-[#0077b6]"
            }`}
          >
            {t.benefitsSection.subtitle}
          </p>
        </div>

        {/* 3 Interactive Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((card, idx) => (
            <div
              key={idx}
              className={`group relative rounded-[32px] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,153,255,0.18)] border flex flex-col justify-between ${
                isDark
                  ? "bg-[#14181d]/80 backdrop-blur-xl border-white/10 hover:border-[#00d3e0]/50"
                  : "bg-white/90 backdrop-blur-xl border-[#ade8f4] hover:border-[#00d3e0]/60 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
              }`}
            >
              {/* Subtle Card Glow Header Gradient */}
              <div
                className={`absolute inset-x-0 top-0 h-32 rounded-t-[32px] bg-gradient-to-b ${card.gradient} pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`}
              />

              <div className="relative z-10">
                {/* 3D-styled floating icon container */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00ffc8]/20 to-[#0099ff]/20 border border-white/20 flex items-center justify-center text-3xl shadow-md mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {card.icon}
                </div>

                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-tight text-[#00a8f7] bg-[#00a8f7]/10 border border-[#00a8f7]/25 mb-3">
                  {card.badge}
                </span>

                <h3
                  className={`text-xl font-bold tracking-tight mb-3 ${
                    isDark ? "text-white" : "text-[#03045e]"
                  }`}
                >
                  {card.title}
                </h3>

                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? "text-[#E8F1F2]/65" : "text-[#0077b6]"
                  }`}
                >
                  {card.description}
                </p>
              </div>

              {/* Bottom Card Micro-Interaction Link */}
              <div className="relative z-10 pt-6 mt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <span className={`text-xs font-bold transition-colors ${
                  isDark ? "text-[#00d3e0] group-hover:text-[#00ffc8]" : "text-emerald-700 group-hover:text-emerald-800"
                }`}>
                  Batafsil ma'lumot
                </span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:translate-x-1 ${
                  isDark ? "bg-[#00d3e0]/10 text-[#00d3e0]" : "bg-emerald-100/70 text-emerald-800"
                }`}>
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
