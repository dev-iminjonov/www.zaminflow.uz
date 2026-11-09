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
            className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4 ${
              isDark ? "text-white" : "text-[#081c15]"
            }`}
          >
            {t.simulatorSection.titleStart}{" "}
            <span className="bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent">
              {t.simulatorSection.titleAccent}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto mb-6">
            {t.simulatorSection.subtitle}
          </p>

          {/* Auto-Play Toggle & Step Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 transition-all border ${
                isAutoPlaying
                  ? "bg-[#00ffc8] text-[#070B14] border-[#00ffc8] shadow-[0_0_20px_rgba(0,255,200,0.4)]"
                  : "bg-[#14181d]/80 text-white border-white/10 hover:border-[#00d3e0]/50"
              }`}
            >
              <span>
                {isAutoPlaying
                  ? locale === "ru"
                    ? "⏸ Пауза"
                    : locale === "en"
                    ? "⏸ Pause"
                    : "⏸ Toʻxtatish"
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
              className="px-3.5 py-2 rounded-full text-xs font-bold bg-[#14181d]/50 text-gray-400 hover:text-white border border-white/10 transition-colors"
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
                    ? "bg-gradient-to-br from-[#182029] to-[#0e1319] border-[#00ffc8] shadow-[0_10px_30px_rgba(0,255,200,0.22)] scale-[1.02]"
                    : isCompleted
                    ? "bg-[#14181d]/60 border-[#00ffc8]/30 text-gray-300 hover:bg-[#14181d]"
                    : "bg-[#14181d]/30 border-white/5 text-gray-500 hover:bg-[#14181d]/60 hover:text-gray-300"
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

                <div className="text-xs font-extrabold text-white truncate mb-0.5">
                  {s.title}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {s.roleTitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Interactive Showcase Card */}
        <div className="relative rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 bg-gradient-to-br from-[#151b22]/95 via-[#10141a]/95 to-[#0b0e12]/95 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          
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
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1.5">
                  <span>{currentStep.icon}</span>
                  <span>{currentStep.roleTitle}</span>
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${currentStep.badgeColor}20`,
                    color: currentStep.badgeColor,
                    borderColor: `${currentStep.badgeColor}40`,
                    borderWidth: 1,
                  }}
                >
                  {currentStep.badge}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
                  {currentStep.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
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
                        ? "bg-[#00ffc8]/10 border-[#00ffc8]/30 shadow-sm"
                        : "bg-[#14181d]/60 border-white/5"
                    }`}
                  >
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                      {d.label}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-extrabold truncate ${
                        d.highlight ? "text-[#00ffc8]" : "text-white"
                      }`}
                    >
                      {d.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* System Audit Log Ribbon */}
              <div className="p-3 rounded-2xl bg-black/50 border border-white/5 font-mono text-xs flex items-center gap-2 text-gray-300">
                <span className="text-[#00ffc8] animate-pulse">●</span>
                <span className="text-gray-400">
                  {locale === "ru" ? "Системный лог:" : locale === "en" ? "System Log:" : "Tizim Yozuvi:"}
                </span>
                <span className="text-white truncate">{currentStep.systemLog}</span>
              </div>
            </div>

            {/* Right Column (5 cols): Interactive Simulation Visual & CTA */}
            <div className="lg:col-span-5 flex flex-col items-center justify-between h-full bg-[#14181d]/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Visual Reactor Core */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                {/* Rotating Glowing Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00ffc8]/40 animate-spin" style={{ animationDuration: "20s" }} />
                <div className="absolute inset-3 rounded-full border-2 border-[#00d3e0]/20" />
                <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#00ffc8]/20 to-[#0099ff]/20 blur-md" />

                {/* Center Icon */}
                <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0d1013] border-2 border-[#00ffc8] shadow-[0_0_35px_rgba(0,255,200,0.5)] flex flex-col items-center justify-center text-4xl sm:text-5xl">
                  <span>{currentStep.icon}</span>
                  <span className="text-[9px] font-black text-[#00ffc8] uppercase mt-1">
                    {t.simulatorSection.stepBadge} 0{currentStep.step}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Status */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-400">
                    {locale === "ru" ? "Статус процесса" : locale === "en" ? "Process Status" : "Jarayon Holati"}
                  </span>
                  <span className="text-[#00ffc8]">
                    {currentStep.step * 20}% {locale === "ru" ? "Завершено" : locale === "en" ? "Ready" : "Tayyor"}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
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
                  className="w-full py-4 rounded-full font-black text-xs sm:text-sm text-[#070B14] bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-95 shadow-[0_10px_30px_rgba(0,255,200,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <span>{currentStep.actionText}</span>
                  <span>➔</span>
                </button>

                {currentStep.step === 5 && (
                  <Link
                    href="/sign-up"
                    className="w-full py-3 rounded-full text-xs font-bold text-center text-white bg-white/10 hover:bg-white/20 transition-colors block border border-white/10"
                  >
                    {locale === "ru"
                      ? "Подключить вашу ферму или завод →"
                      : locale === "en"
                      ? "Connect Your Farm or Dairy Plant →"
                      : "Oʻz Ferma yoki Zavodingizni Ulash →"}
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
