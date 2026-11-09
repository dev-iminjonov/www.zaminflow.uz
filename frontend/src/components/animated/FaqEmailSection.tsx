"use client";

import React, { useState } from "react";
import { SplashDoodle } from "./DoodleAccents";
import { useLanguage } from "@/context/LanguageContext";

export default function FaqEmailSection({ isDark = false }: { isDark?: boolean }) {
  const { t, locale } = useLanguage();
  const faqs = t.faqSection.items;
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage(t.faqSection.errorEmailMsg);
      return;
    }

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setMessage(t.faqSection.successMsg);
      setEmail("");
    }, 900);
  };

  return (
    <section id="contact" className="relative w-full py-20 sm:py-28 overflow-hidden select-none scroll-mt-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          
          {/* Left Column (5 cols): Heading + Fused Email Dispatch */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black tracking-widest uppercase text-[#00d3e0]">
                {t.faqSection.badge}
              </span>
              <SplashDoodle size={24} color="#00ffc8" />
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.25] sm:leading-[1.3] mb-4 ${
                isDark ? "text-white" : "text-[#03045e]"
              }`}
            >
              {t.faqSection.titleStart}{" "}
              <span className={`inline ${
                isDark
                  ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#0369a1] bg-clip-text text-transparent"
              }`}>
                {t.faqSection.titleAccent}
              </span>
            </h2>

            <p
              className={`text-sm sm:text-base leading-relaxed mb-8 ${
                isDark ? "text-[#E8F1F2]/70" : "text-[#0077b6]"
              }`}
            >
              {t.faqSection.subtitle}
            </p>

            {/* Fused Pill Email Input Form (Reference 2.9) */}
            <form onSubmit={handleSubmit} className="relative">
              {/* Honeypot anti-spam field */}
              <input
                type="text"
                name="website_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div
                className={`rounded-full p-2 border flex items-center shadow-lg transition-all ${
                  isDark
                    ? "bg-[#14181d]/90 backdrop-blur-xl border-white/15 focus-within:border-[#00d3e0] focus-within:ring-2 focus-within:ring-[#00d3e0]/20"
                    : "bg-white/95 backdrop-blur-xl border-[#ade8f4] focus-within:border-[#00d3e0] focus-within:ring-2 focus-within:ring-[#00d3e0]/20 shadow-[0_10px_35px_rgba(0,153,255,0.12)]"
                }`}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.faqSection.emailPlaceholder}
                  className="w-full px-5 py-2.5 rounded-l-full bg-transparent text-xs sm:text-sm font-semibold border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:opacity-50 shadow-none"
                  style={{ outline: "none", boxShadow: "none" }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-extrabold text-[#070B14] bg-gradient-to-r from-[#00ffc8] to-[#0099ff] hover:opacity-90 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  {status === "loading" ? t.faqSection.sending : `${t.faqSection.sendBtn} →`}
                </button>
              </div>

              {message && (
                <div
                  className={`mt-3 text-xs font-bold ${
                    status === "success" ? "text-[#00ffc8]" : "text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* Right Column (7 cols): Smooth Expanding Accordions (Reference 2.9) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#00d3e0] mb-2 px-1">
              {locale === "ru"
                ? "Часто задаваемые вопросы"
                : locale === "en"
                ? "Frequently Asked Questions"
                : "Eng köp söraladigan savollar"}
            </div>

            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${
                    isDark
                      ? "bg-[#14181d]/80 border-white/10"
                      : "bg-white/90 border-[#ade8f4] shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base cursor-pointer"
                  >
                    <span className={isDark ? "text-white" : "text-[#03045e]"}>
                      {faq.question}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-transform duration-300 shrink-0 ${
                        isOpen
                          ? "rotate-180 bg-[#00ffc8] text-[#070B14] font-black border-[#00ffc8]"
                          : isDark
                          ? "border-white/10 text-gray-400"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      ↓
                    </span>
                  </button>

                  {isOpen && (
                    <div className={`px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm leading-relaxed border-t animate-in fade-in duration-300 ${
                      isDark ? "text-gray-400 border-white/5" : "text-slate-600 border-slate-100"
                    }`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
