"use client";

import React, { useState } from "react";
import { SplashDoodle } from "./DoodleAccents";
import { useLanguage } from "@/context/LanguageContext";

export default function TestimonialsSlider({ isDark = false }: { isDark?: boolean }) {
  const { t } = useLanguage();
  const testimonials = t.testimonialsSection.items;
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIndex] || testimonials[0];

  return (
    <section className="relative w-full py-20 sm:py-28 overflow-hidden select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Row: Title & Subtitle + Hand-Drawn Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black tracking-widest uppercase text-[#00d3e0]">
                {t.testimonialsSection.badge}
              </span>
              <SplashDoodle size={24} color="#00ffc8" />
            </div>
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.25] sm:leading-[1.3] ${
                isDark ? "text-white" : "text-[#081c15]"
              }`}
            >
              {t.testimonialsSection.titleStart}{" "}
              <span className={`inline ${
                isDark
                  ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#0369a1] bg-clip-text text-transparent"
              }`}>
                {t.testimonialsSection.titleAccent}
              </span>
            </h2>
            <p
              className={`mt-3 text-sm sm:text-base max-w-lg ${
                isDark ? "text-[#E8F1F2]/70" : "text-[#2d6a4f]"
              }`}
            >
              {t.testimonialsSection.subtitle}
            </p>
          </div>

          {/* Thin Hand-Drawn Arrows (Reference 2.8) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Oldingi fikr"
              className={`w-12 h-12 rounded-full border hover:scale-105 active:scale-95 flex items-center justify-center transition-all ${
                isDark
                  ? "border-[#00d3e0] text-[#00d3e0] hover:bg-[#00d3e0]/10"
                  : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Keyingi fikr"
              className={`w-12 h-12 rounded-full border hover:scale-105 active:scale-95 flex items-center justify-center transition-all ${
                isDark
                  ? "border-[#00d3e0] text-[#00d3e0] hover:bg-[#00d3e0]/10"
                  : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* 3 Columns Display (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[0, 1, 2].map((offset) => {
            const index = (currentIndex + offset) % testimonials.length;
            const item = testimonials[index];
            return (
              <div
                key={index}
                className={`rounded-[32px] p-8 border backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,153,255,0.18)] flex flex-col justify-between ${
                  isDark
                    ? "bg-[#14181d]/85 border-white/10 hover:border-[#00d3e0]/50"
                    : "bg-white/95 border-[#b7e4c7] hover:border-[#00d3e0]/60 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
                }`}
              >
                <div>
                  {/* Quotation Mark */}
                  <span className={`text-4xl font-serif block mb-3 ${
                    isDark ? "text-[#00d3e0]" : "text-emerald-600"
                  }`}>“</span>
                  <p
                    className={`text-sm sm:text-base leading-relaxed italic mb-6 ${
                      isDark ? "text-white/90" : "text-[#081c15]"
                    }`}
                  >
                    {item.quote}
                  </p>
                </div>

                <div className="pt-6 border-t border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black flex items-center justify-center text-sm shadow-md shrink-0">
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-extrabold truncate ${
                          isDark ? "text-white" : "text-[#081c15]"
                        }`}
                      >
                        {item.name}
                      </div>
                      <div className={`text-[11px] font-semibold truncate ${
                        isDark ? "text-[#00d3e0]" : "text-emerald-700"
                      }`}>
                        {item.role} • {item.company}
                      </div>
                    </div>
                  </div>

                  {/* 5-Star Gold Rating */}
                  <div className="flex items-center gap-1 mt-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
