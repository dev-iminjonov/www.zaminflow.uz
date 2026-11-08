"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import HeroEcosystemVisual from "@/components/HeroEcosystemVisual";
import OurTeamCarousel from "@/components/OurTeamCarousel";
import LandingLiveStatistics from "@/components/LandingLiveStatistics";
import ContactUsSection from "@/components/ContactUsSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
  const { t } = useLanguage();
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [activeSection, setActiveSection] = useState<string>("company");

  const isDark = themeMode === "dark";

  const navItems = [
    { id: "company", label: t.nav.company },
    { id: "team", label: t.nav.team },
    { id: "stats", label: t.nav.stats },
    { id: "contact", label: t.nav.contact },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial hash detection
    const initialHash = window.location.hash.replace("#", "");
    if (["company", "team", "stats", "contact"].includes(initialHash)) {
      setActiveSection(initialHash);
    }

    // 2. Hash and History event listeners
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (["company", "team", "stats", "contact"].includes(hash)) {
        setActiveSection(hash);
      }
    };

    window.addEventListener("hashchange", handleHash);
    window.addEventListener("popstate", handleHash);

    // 3. Dynamic Scroll-Spy with IntersectionObserver
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

    ["company", "team", "stats", "contact"].forEach((id) => {
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
      className={`min-h-screen font-sans selection:bg-[#52b788]/25 overflow-x-hidden relative transition-colors duration-500 scroll-smooth flex flex-col justify-between ${
        isDark ? "text-[#E8F1F2]" : "text-[#081c15]"
      }`}
      style={{
        background: isDark
          ? "radial-gradient(circle at 75% 50%, #13293D 0%, #0A1926 70%)"
          : "radial-gradient(circle at 75% 50%, #d8f3dc 0%, #f6fbf8 60%)",
      }}
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
              telephone: "+998-71-200-00-24",
              contactType: "customer service",
              areaServed: "UZ",
              availableLanguage: ["Uzbek", "Russian", "English"],
            },
          }),
        }}
      />
      {/* 1. TOPOGRAPHIC CONTOUR LINES TEXTURE (SVG Overlay with subtle opacity) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.045] dark:opacity-[0.06]">
        <svg
          className="w-full h-full min-w-[1200px]"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 200 C300 150, 600 400, 1000 220 C1200 120, 1400 300, 1600 200"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M-100 280 C320 220, 580 460, 980 300 C1180 200, 1380 360, 1600 280"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M-100 360 C340 290, 560 520, 960 380 C1160 280, 1360 420, 1600 360"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M-100 440 C360 360, 540 580, 940 460 C1140 360, 1340 480, 1600 440"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M-100 520 C380 430, 520 640, 920 540 C1120 440, 1320 540, 1600 520"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M-100 600 C400 500, 500 700, 900 620 C1100 520, 1300 600, 1600 600"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M-100 680 C420 570, 480 760, 880 700 C1080 600, 1280 660, 1600 680"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* 2. SOFT GLOWING EMERALD LIGHT AURA (Right Side Illumination) */}
      <div className="absolute top-1/4 right-0 w-[550px] lg:w-[750px] h-[550px] lg:h-[750px] pointer-events-none z-0">
        <div
          className={`w-full h-full rounded-full blur-[140px] opacity-70 ${
            isDark
              ? "bg-gradient-to-br from-[#00C853]/15 via-[#1B98E0]/15 to-transparent"
              : "bg-gradient-to-br from-[#52b788]/25 via-[#74c69d]/20 to-transparent"
          }`}
        />
      </div>

      {/* 3. FLOATING PILL-SHAPED TOP NAVIGATION BAR */}
      <header className="sticky top-4 inset-x-0 z-50 flex justify-center px-4 w-full">
        <nav
          className={`w-[92%] max-w-[1240px] h-16 rounded-full px-4 sm:px-7 flex items-center justify-between transition-all duration-300 ${
            isDark
              ? "bg-[#13293D]/80 backdrop-blur-xl border border-[#247BA0]/40 shadow-[0_8px_32px_rgba(0,0,0,0.35)] text-[#E8F1F2]"
              : "bg-white/85 backdrop-blur-xl border border-[#b7e4c7] shadow-[0_8px_32px_rgba(8,28,21,0.06)] text-[#081c15]"
          }`}
        >
          {/* Logo "Zaminflow" (Exact Official Assets) */}
          <Link href="/" className="flex items-center shrink-0">
            <ZaminFlowLogo mode={themeMode} size="md" />
          </Link>

          {/* Center Navigation Links (Dynamic Scroll-Spy) */}
          <div className="hidden md:flex items-center gap-7 text-xs font-bold tracking-tight">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`transition pb-0.5 ${
                    isActive
                      ? "text-[#2d6a4f] dark:text-[#22d36b] border-b-2 border-[#2d6a4f] dark:border-[#22d36b] font-bold"
                      : `${
                          isDark
                            ? "text-[#E8F1F2]/80 hover:text-white"
                            : "text-[#1b4332]/85 hover:text-[#2d6a4f]"
                        } hover:underline underline-offset-4 font-semibold`
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Right Actions: Language Switcher + Dark Mode Toggle + Sign up Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher isDark={isDark} />

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition border ${
                isDark
                  ? "bg-[#006494]/50 border-[#247BA0] text-[#1B98E0] hover:bg-[#247BA0]/40"
                  : "bg-white/90 border-[#b7e4c7] text-[#081c15] hover:bg-[#d8f3dc] shadow-xs"
              }`}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Dark Navy Blue "Sign up" Button */}
            <Link
              href="/sign-up"
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-95 flex items-center gap-1.5 shrink-0 ${
                isDark
                  ? "bg-[#1B98E0] text-[#13293D] hover:bg-white"
                  : "bg-[#1b4332] text-white hover:bg-[#2d6a4f]"
              }`}
            >
              <span>{t.nav.signUp}</span>
              <span className="text-xs">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* 4. OUR COMPANY / HERO SECTION (ASYMMETRICAL SPLIT LAYOUT 1fr 1fr) */}
      <main id="company" className="relative z-10 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-24 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          
          {/* LEFT SIDE: TYPOGRAPHY & CTAs */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            {/* Massive, Bold Sans-Serif Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] select-none">
              <span className={isDark ? "text-[#E8F1F2]" : "text-[#081c15]"}>
                {t.hero.headlineStart}
              </span>
              <span className="bg-gradient-to-r from-[#52b788] via-[#40916c] to-[#2d6a4f] dark:from-[#00C853] dark:via-[#4ADE80] dark:to-[#64DD17] bg-clip-text text-transparent inline-block drop-shadow-xs">
                {t.hero.headlineAccent}
              </span>
            </h1>

            {/* Dark Grey Subheadline */}
            <p
              className={`mt-6 text-sm sm:text-base lg:text-lg leading-relaxed font-normal ${
                isDark ? "text-[#E8F1F2]/75" : "text-[#2d6a4f]"
              }`}
            >
              {t.hero.subheadline}
            </p>

            {/* Two Horizontal Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full">
              {/* Primary Dark Green "Join Us" Button */}
              <Link
                href="/sign-up"
                className={`px-8 py-3.5 rounded-full text-sm sm:text-base font-bold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 ${
                  isDark
                    ? "bg-[#1B98E0] text-[#13293D] hover:bg-white"
                    : "bg-[#1b4332] text-white hover:bg-[#2d6a4f]"
                }`}
              >
                <span>{t.hero.joinUs}</span>
                <span className="text-base font-extrabold">&rarr;</span>
              </Link>

              {/* Light Grey Ghost Button: "Explore Live Stats" with Line-Chart Icon */}
              <a
                href="#stats"
                className={`px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 flex items-center gap-2.5 backdrop-blur-md shadow-sm hover:shadow active:scale-95 border ${
                  isDark
                    ? "bg-[#006494]/30 border-[#247BA0]/40 text-[#E8F1F2] hover:bg-[#006494]/50"
                    : "bg-white/90 border-[#b7e4c7] text-[#081c15] hover:bg-[#d8f3dc] hover:border-[#74c69d]"
                }`}
              >
                {/* Line Chart Icon */}
                <svg
                  className={`w-4 h-4 ${isDark ? "text-[#1B98E0]" : "text-[#40916c]"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 9l-5 5-4-4-4 4" />
                </svg>
                <span>{t.hero.exploreStats}</span>
              </a>
            </div>
          </div>

          {/* RIGHT SIDE: 3D HERO VISUALS & FLOATING BENTO UI CARDS */}
          <div className="w-full flex justify-center lg:justify-end">
            <HeroEcosystemVisual isDark={isDark} />
          </div>

        </div>
      </main>

      {/* 5. OUR TEAM SECTION (Horizontal Carousel with Studio Portraits & Sleek Progress Track) */}
      <OurTeamCarousel isDark={isDark} />

      {/* 6. LIVE PLATFORM STATISTICS (ARTBOARD: "Real deals, real milk, real prices") */}
      <LandingLiveStatistics isDark={isDark} />

      {/* 7. CONTACT US SECTION (Artboard Glassmorphism Card & Direct Dispatch Channels) */}
      <ContactUsSection isDark={isDark} />

      {/* 8. AUTHENTIC B2B FOOTER (Compliant with Law ZRU-611) */}
      <footer
        className={`relative z-10 border-t py-10 px-6 text-xs transition-colors ${
          isDark
            ? "border-[#247BA0]/30 bg-[#0B1A24]/80 backdrop-blur-md text-[#E8F1F2]/70"
            : "border-[#b7e4c7] bg-white/85 backdrop-blur-md text-[#1b4332]/90"
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link href="/" className="inline-flex">
              <ZaminFlowLogo mode={themeMode} size="sm" />
            </Link>
            <div className="text-[11px] leading-relaxed opacity-90">
              <p className="font-bold text-[#087a3c] dark:text-[#22d36b]">
                &ldquo;ZaminFlow&rdquo; MCHJ &bull; STIR: 309 845 120
              </p>
              <p>Toshkent sh., Mirzo Ulugʻbek t., Mustaqillik shoh koʻchasi, 105</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
            <Link href="/privacy" className="hover:text-[#087a3c] dark:hover:text-[#22d36b] transition">
              Maxfiylik siyosati
            </Link>
            <Link href="/terms" className="hover:text-[#087a3c] dark:hover:text-[#22d36b] transition">
              Foydalanish shartlari
            </Link>
            <a href="tel:+998712000024" className="hover:text-[#087a3c] dark:hover:text-[#22d36b] transition">
              +998 71 200 00 24
            </a>
            <a href="mailto:support@zaminflow.uz" className="hover:text-[#087a3c] dark:hover:text-[#22d36b] transition">
              support@zaminflow.uz
            </a>
          </div>

          <div className="text-[11px] font-mono opacity-80 text-center md:text-right">
            {t.footer.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}
