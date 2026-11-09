"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SplashDoodle } from "./DoodleAccents";
import { useLanguage } from "@/context/LanguageContext";

export default function LiveWorkflowSimulatorSection({ isDark = false }: { isDark?: boolean }) {
  const { t, locale } = useLanguage();
  const steps = t.simulatorSection.steps;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const safeIndex = currentStepIndex < steps.length ? currentStepIndex : 0;
  const currentStep = steps[safeIndex];

  // Auto-advance through the workflow simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % steps.length);
      }, 4200);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, steps.length]);

  const handleNext = () => {
    setCurrentStepIndex((prev) => (prev + 1) % steps.length);
  };

  const handleStepClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentStepIndex(index);
  };

  return (
    <section id="simulator" className="relative w-full py-20 sm:py-28 select-none overflow-hidden scroll-mt-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-black tracking-widest uppercase text-[#00d3e0]">
              {t.simulatorSection.badge}
            </span>
            <SplashDoodle size={22} color="#00ffc8" />
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.25] sm:leading-[1.3] mb-4 ${
              isDark ? "text-white" : "text-[#081c15]"
            }`}
          >
            {t.simulatorSection.titleStart}{" "}
            <span className={`inline ${
              isDark
                ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent"
                : "bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#0369a1] bg-clip-text text-transparent"
            }`}>
              {t.simulatorSection.titleAccent}
            </span>
          </h2>

          <p className={`text-xs sm:text-sm max-w-xl mx-auto mb-6 ${isDark ? "text-gray-400" : "text-slate-600"}`}>
            {t.simulatorSection.subtitle}
          </p>

          {/* Auto-Play Toggle & Step Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 transition-all border ${
                isAutoPlaying
                  ? "bg-[#00ffc8] text-[#070B14] border-[#00ffc8] shadow-[0_0_20px_rgba(0,255,200,0.4)]"
                  : isDark
                  ? "bg-[#14181d]/80 text-white border-white/10 hover:border-[#00d3e0]/50"
                  : "bg-white text-slate-800 border-slate-200 hover:border-emerald-500 shadow-xs"
              }`}
            >
              <span>
                {isAutoPlaying
                  ? locale === "ru"
                    ? "⏸ Пауза"
                    : locale === "en"
                    ? "⏸ Pause"
                    : "⏸ Töxtatiş"
                  : locale === "ru"
                  ? "▶ Запустить авто-симуляцию"
                  : locale === "en"
                  ? "▶ Start Auto-Simulation"
                  : "▶ Avto-Simulyatsiyani Boshlash"}
              </span>
              {isAutoPlaying && <span className="w-2 h-2 rounded-full bg-[#070B14] animate-ping" />}
            </button>

            <button
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentStepIndex(0);
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors border ${
                isDark
                  ? "bg-[#14181d]/50 text-gray-400 hover:text-white border-white/10"
                  : "bg-white text-slate-500 hover:text-slate-900 border-slate-200 shadow-xs"
              }`}
              title="Qayta boshlash"
            >
              {locale === "ru" ? "↺ Сброс" : locale === "en" ? "↺ Restart" : "↺ Qayta Boshlash"}
            </button>
          </div>
        </div>

        {/* 5-Stage Stepper Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-8">
          {steps.map((s, idx) => {
            const isActive = currentStepIndex === idx;
            const isCompleted = currentStepIndex > idx;

            return (
              <button
                key={s.step}
                onClick={() => handleStepClick(idx)}
                className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border text-left transition-all relative overflow-hidden group ${
                  isActive
                    ? isDark
                      ? "bg-gradient-to-br from-[#182029] to-[#0e1319] border-[#00ffc8] shadow-[0_10px_30px_rgba(0,255,200,0.22)] scale-[1.02]"
                      : "bg-white border-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.18)] scale-[1.02]"
                    : isCompleted
                    ? isDark
                      ? "bg-[#14181d]/60 border-[#00ffc8]/30 text-gray-300 hover:bg-[#14181d]"
                      : "bg-emerald-50/50 border-emerald-200 text-slate-700 hover:bg-emerald-50"
                    : isDark
                    ? "bg-[#14181d]/30 border-white/5 text-gray-500 hover:bg-[#14181d]/60 hover:text-gray-300"
                    : "bg-white/60 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                {/* Active Top Glow Line */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ffc8] to-[#0099ff]" />
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl sm:text-2xl">{s.icon}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      isActive
                        ? "bg-[#00ffc8] text-[#070B14]"
                        : isCompleted
                        ? "bg-[#00ffc8]/20 text-[#00ffc8]"
                        : "bg-white/5 text-gray-500"
                    }`}
                  >
                    {isCompleted ? "✓ 0" + s.step : "0" + s.step}
                  </span>
                </div>

                <div
                  className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-2 break-words leading-tight min-h-[32px] mb-0.5"
                  title={s.title}
                >
                  {s.title}
                </div>
                <div
                  className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-1 break-words"
                  title={s.roleTitle}
                >
                  {s.roleTitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Interactive Showcase Card */}
        <div className={`relative rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border shadow-2xl backdrop-blur-2xl transition-all ${
          isDark
            ? "bg-gradient-to-br from-[#151b22]/95 via-[#10141a]/95 to-[#0b0e12]/95 border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
            : "bg-white/95 border-slate-200 shadow-[0_25px_70px_rgba(15,23,42,0.08)]"
        }`}>
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ffc8]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0099ff]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column (7 cols): Stage Narrative & Specs Grid */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Header Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14]">
                  {t.simulatorSection.stepBadge} 0{currentStep.step} / 05
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  isDark ? "bg-white/5 text-gray-300 border-white/10" : "bg-slate-100 text-slate-700 border-slate-200"
                }`}>
                  <span>{currentStep.icon}</span>
                  <span>{currentStep.roleTitle}</span>
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: isDark ? `${currentStep.badgeColor}20` : `${currentStep.badgeColor}15`,
                    color: isDark ? currentStep.badgeColor : "#047857",
                    borderColor: `${currentStep.badgeColor}40`,
                    borderWidth: 1,
                  }}
                >
                  {currentStep.badge}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  {currentStep.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  isDark ? "text-gray-300" : "text-slate-600"
                }`}>
                  {currentStep.subtitle}
                </p>
              </div>

              {/* Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentStep.details.map((d, i) => (
                  <div
                    key={i}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                      d.highlight
                        ? isDark
                          ? "bg-[#00ffc8]/10 border-[#00ffc8]/30 shadow-sm"
                          : "bg-emerald-50 border-emerald-200 shadow-xs"
                        : isDark
                        ? "bg-[#14181d]/60 border-white/5"
                        : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                      isDark ? "text-gray-400" : "text-slate-500"
                    }`}>
                      {d.label}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-extrabold truncate ${
                        d.highlight
                          ? isDark ? "text-[#00ffc8]" : "text-emerald-700"
                          : isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {d.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* System Audit Log Ribbon */}
              <div className={`p-3 rounded-2xl border font-mono text-xs flex items-center gap-2 ${
                isDark ? "bg-black/50 border-white/5 text-gray-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <span className={isDark ? "text-[#00ffc8] animate-pulse" : "text-emerald-600 animate-pulse"}>●</span>
                <span className={isDark ? "text-gray-400" : "text-slate-500"}>
                  {locale === "ru" ? "Системный лог:" : locale === "en" ? "System Log:" : "Tizim Yozuvi:"}
                </span>
                <span className={`truncate font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{currentStep.systemLog}</span>
              </div>
            </div>

            {/* Right Column (5 cols): Interactive Simulation Visual & CTA */}
            <div className={`lg:col-span-5 flex flex-col items-center justify-between h-full border rounded-3xl p-6 sm:p-8 space-y-6 ${
              isDark ? "bg-[#14181d]/80 border-white/10" : "bg-slate-50 border-slate-200"
            }`}>
              
              {/* Visual Reactor Core */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                {/* Rotating Glowing Rings */}
                <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-spin ${
                  isDark ? "border-[#00ffc8]/40" : "border-emerald-400/50"
                }`} style={{ animationDuration: "20s" }} />
                <div className={`absolute inset-3 rounded-full border-2 ${
                  isDark ? "border-[#00d3e0]/20" : "border-emerald-300/30"
                }`} />
                <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#00ffc8]/20 to-[#0099ff]/20 blur-md" />

                {/* Center Icon */}
                <div className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex flex-col items-center justify-center text-4xl sm:text-5xl shadow-xl ${
                  isDark
                    ? "bg-[#0d1013] border-[#00ffc8] text-white"
                    : "bg-white border-emerald-500 text-slate-900 shadow-emerald-500/10"
                }`}>
                  <span>{currentStep.icon}</span>
                  <span className={`text-[9px] font-black uppercase mt-1 ${
                    isDark ? "text-[#00ffc8]" : "text-emerald-600"
                  }`}>
                    {t.simulatorSection.stepBadge} 0{currentStep.step}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Status */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={isDark ? "text-gray-400" : "text-slate-500"}>
                    {locale === "ru" ? "Статус процесса" : locale === "en" ? "Process Status" : "Jarayon Holati"}
                  </span>
                  <span className={isDark ? "text-[#00ffc8]" : "text-emerald-700"}>
                    {currentStep.step * 20}% {locale === "ru" ? "Завершено" : locale === "en" ? "Ready" : "Tayyor"}
                  </span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff]"
                    style={{ width: `${currentStep.step * 20}%` }}
                  />
                </div>
              </div>

              {/* Step Navigation Action Button */}
              <div className="w-full space-y-2.5">
                <button
                  onClick={handleNext}
                  className="w-full py-4 rounded-full font-black text-xs sm:text-sm text-[#070B14] bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-95 shadow-[0_10px_30px_rgba(0,255,200,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentStep.actionText}</span>
                  <span>➔</span>
                </button>

                {currentStep.step === 5 && (
                  <Link
                    href="/sign-up"
                    className={`w-full py-3 rounded-full text-xs font-bold text-center transition-colors block border ${
                      isDark
                        ? "text-white bg-white/10 hover:bg-white/20 border-white/10"
                        : "text-slate-800 bg-white hover:bg-slate-100 border-slate-200 shadow-xs"
                    }`}
                  >
                    {locale === "ru"
                      ? "Подключить вашу ферму или завод →"
                      : locale === "en"
                      ? "Connect Your Farm or Dairy Plant →"
                      : "Öz Ferma yoki Zavodingizni Ulaş →"}
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
