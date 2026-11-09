"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

// New Animated Design System Components
import { HandDrawnUnderline, SplashDoodle, CurvedConnectorLine } from "@/components/animated/DoodleAccents";
import HeroPhoneHandMockup from "@/components/animated/HeroPhoneHandMockup";
import AnimatedStatsBar from "@/components/animated/AnimatedStatsBar";
import BenefitsSection from "@/components/animated/BenefitsSection";
import TeamSection from "@/components/animated/TeamSection";
import RegionalMapSearchSection from "@/components/animated/RegionalMapSearchSection";
import TestimonialsSlider from "@/components/animated/TestimonialsSlider";
import LiveWorkflowSimulatorSection from "@/components/animated/LiveWorkflowSimulatorSection";
import FaqEmailSection from "@/components/animated/FaqEmailSection";
import AnimatedFooter from "@/components/animated/AnimatedFooter";

export default function LandingPage() {
  const { t, locale } = useLanguage();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const [activeSection, setActiveSection] = useState<string>("benefits");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "benefits", label: t.nav.benefits },
    { id: "simulator", label: t.nav.demo },
    { id: "team", label: t.nav.team },
    { id: "stats", label: t.nav.stats },
    { id: "contact", label: t.nav.contact },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialHash = window.location.hash.replace("#", "");
    if (["benefits", "simulator", "team", "stats", "contact"].includes(initialHash)) {
      setActiveSection(initialHash);
      setTimeout(() => {
        const el = document.getElementById(initialHash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 120);
    }

    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (["benefits", "simulator", "team", "stats", "contact"].includes(hash)) {
        setActiveSection(hash);
      }
    };

    window.addEventListener("hashchange", handleHash);
    window.addEventListener("popstate", handleHash);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -40% 0px",
        threshold: [0.1, 0.3],
      }
    );

    ["benefits", "simulator", "team", "stats", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("popstate", handleHash);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`min-h-screen font-sans selection:bg-[#00ffc8]/30 overflow-x-hidden relative transition-colors duration-500 scroll-smooth flex flex-col justify-between ${
        isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f4fbfe] text-[#03045e]"
      }`}
    >
      {/* 0. ORGANIZATION JSON-LD STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ZaminFlow",
            url: "https://zaminflow.uz",
            logo: "https://zaminflow.uz/images/zaminflow-logo.png",
            description: "B2B Dairy Supply Chain & FinTech Escrow Platform in Uzbekistan",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+998 71 200 45 67",
              contactType: "Customer Support",
              email: "support@zaminflow.uz",
              areaServed: "UZ",
              availableLanguage: ["Uzbek", "Russian", "English"],
            },
          }),
        }}
      />

      {/* 1. SOFT BACKGROUND GRADIENT BLOBS (Turquoise Dreamland Glows) */}
      <div className="absolute top-0 right-0 w-[550px] lg:w-[850px] h-[550px] lg:h-[850px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[140px] opacity-40 dark:opacity-25"
          style={{
            background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 40%, #0099ff 70%, transparent 100%)",
          }}
        />
      </div>

      <div className="absolute top-[35%] left-0 w-[450px] h-[450px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[130px] opacity-35 dark:opacity-20"
          style={{
            background: "radial-gradient(circle, #00d3e0 0%, #0099ff 50%, transparent 100%)",
          }}
        />
      </div>

      {/* 2. STICKY FROSTED NAVBAR (Reference 2.2) */}
      <header className="sticky top-4 inset-x-0 z-50 flex justify-center px-4 w-full">
        <nav
          className={`w-[96%] max-w-[1240px] h-16 sm:h-18 rounded-full px-4 sm:px-8 flex items-center justify-between transition-all duration-300 shadow-lg ${
            isDark
              ? "bg-[#14181d]/85 backdrop-blur-xl border border-white/10 text-white"
              : "bg-white/90 backdrop-blur-xl border border-[#ade8f4] text-[#03045e] shadow-[0_8px_32px_rgba(0,153,255,0.08)]"
          }`}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <ZaminFlowLogo mode={themeMode} size="md" />
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-6 2xl:gap-7 text-xs sm:text-sm font-bold tracking-tight min-w-0">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`transition-all pb-0.5 whitespace-nowrap ${
                    isActive
                      ? "text-emerald-700 dark:text-[#00ffc8] border-b-2 border-emerald-600 dark:border-[#00d3e0] font-black"
                      : "text-slate-700 dark:text-white/70 hover:text-emerald-600 dark:hover:text-[#00d3e0] font-semibold"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Right Actions: Lang + Theme + Login/Register Pill Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <LanguageSwitcher isDark={isDark} />

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition border ${
                isDark
                  ? "bg-[#1a2026] border-white/10 text-[#00ffc8] hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-xs"
              }`}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Login Pill (Desktop) */}
            <Link
              href="/sign-in"
              className={`hidden sm:inline-flex px-4 py-2 rounded-full font-bold text-xs transition border ${
                isDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-slate-300 text-slate-800 hover:bg-slate-100"
              }`}
            >
              {t.nav.signIn}
            </Link>

            {/* Register / Get Started Dark Pill */}
            <Link
              href="/sign-up"
              className="px-5 py-2 sm:py-2.5 rounded-full font-extrabold text-xs sm:text-sm text-[#070B14] bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-95 shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>{t.nav.signUp}</span>
              <span className="text-xs font-black">→</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold border border-slate-300 dark:border-white/15"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </nav>

        {/* Mobile Slide-In Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden fixed top-24 inset-x-4 p-6 rounded-3xl border shadow-2xl backdrop-blur-2xl z-50 flex flex-col gap-4 animate-in fade-in zoom-in-95 ${
              isDark
                ? "bg-[#14181d]/95 border-white/15 text-white"
                : "bg-white/95 border-[#ade8f4] text-[#03045e]"
            }`}
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold py-2 border-b border-black/5 dark:border-white/5"
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-3 text-center rounded-full font-bold text-sm border border-slate-300 dark:border-white/20"
              >
                {t.nav.signIn}
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-3 text-center rounded-full font-black text-sm text-[#070B14] bg-gradient-to-r from-[#00ffc8] to-[#0099ff]"
              >
                {t.nav.signUp}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (Reference 2.3 — 3-Line Headline with Doodles + Hand Phone Mockup) */}
      <main id="hero" className="relative z-10 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 min-h-[calc(100vh-5rem)] flex items-center scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Column (6 cols): Typography, Doodle Splash, Hand-drawn Underline, CTAs */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* 3-Line Confident Headline with Hand-Drawn Underline */}
            <h1
              className={`font-black tracking-tight leading-[1.12] pb-2 ${
                locale === "ru"
                  ? "text-3xl sm:text-5xl lg:text-[2.8rem] xl:text-[3.2rem]"
                  : "text-4xl sm:text-5xl lg:text-[3.2rem] xl:text-[3.8rem]"
              }`}
            >
              <span>{t.hero.headlineLine1}</span>
              <br />
              <span>{t.hero.headlineLine2}</span>
              <br />
              <span className="relative inline-block text-[#00d3e0]">
                {t.hero.headlineLine3}
                <HandDrawnUnderline color="#00ffc8" />
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              className={`mt-6 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-normal ${
                isDark ? "text-[#E8F1F2]/75" : "text-[#0077b6]"
              }`}
            >
              {t.hero.subheadline}
            </p>

            {/* Dual CTAs (Reference 2.3: Dark Pill + Ghost Button) */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full">
              {/* Primary Dark Pill with Turquoise Glow */}
              <Link
                href="/sign-up"
                className="px-8 py-4 rounded-full font-extrabold text-sm sm:text-base text-[#070B14] bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] hover:opacity-95 active:scale-95 shadow-[0_12px_36px_rgba(0,153,255,0.28)] transition-all flex items-center gap-2"
              >
                <span>{t.hero.joinUs}</span>
                <span className="text-base font-black">→</span>
              </Link>

              {/* Ghost Button: Live Stats Explorer */}
              <a
                href="#stats"
                className={`px-7 py-4 rounded-full text-sm sm:text-base font-bold transition-all flex items-center gap-2.5 backdrop-blur-md shadow-sm hover:shadow border ${
                  isDark
                    ? "bg-[#14181d]/80 border-white/15 text-white hover:bg-white/10"
                    : "bg-white border-[#ade8f4] text-[#03045e] hover:bg-slate-100"
                }`}
              >
                <svg className="w-4 h-4 text-[#00d3e0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18 9l-5 5-4-4-4 4" />
                </svg>
                <span>{t.hero.exploreStats}</span>
              </a>
            </div>
          </div>

          {/* Right Column (6 cols): Harmonic Duo Mockup (Open Laptop + Companion Phone) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <HeroPhoneHandMockup isDark={isDark} />
          </div>

        </div>
      </main>

      {/* 4. ANIMATED STATS BAR (Full-Width Royal/Turquoise Band Overlapping Bottom of Hero) */}
      <AnimatedStatsBar isDark={isDark} />

      {/* 5. CURVED CONNECTOR LINE */}
      <CurvedConnectorLine variant="loop" className="my-8" />

      {/* 6. BENEFITS SECTION ("Nima Uchun ZaminFlow?") */}
      <BenefitsSection isDark={isDark} />

      {/* 6.5. JONLI SHARTNOMA VA ESKROU SIMULYATORI (5-Stage Interactive Demo) */}
      <LiveWorkflowSimulatorSection isDark={isDark} />

      {/* 7. TEAM SECTION ("Bizning Jamoa") */}
      <TeamSection isDark={isDark} />

      {/* 8. CURVED CONNECTOR LINE */}
      <CurvedConnectorLine variant="wave" className="my-8" />

      {/* 9. REGIONAL MAP OF UZBEKISTAN & DESTINATION SEARCH */}
      <RegionalMapSearchSection isDark={isDark} />

      {/* 11. TESTIMONIALS CAROUSEL (Real Producer Quotes & Star Ratings) */}
      <TestimonialsSlider isDark={isDark} />

      {/* 12. FAQ ACCORDION & INSTANT EMAIL DISPATCH */}
      <FaqEmailSection isDark={isDark} />

      {/* 13. B2B LEGAL & COMPLIANT FOOTER */}
      <AnimatedFooter isDark={isDark} />
    </div>
  );
}
