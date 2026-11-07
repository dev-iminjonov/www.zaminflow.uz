"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import HeroEcosystemVisual from "@/components/HeroEcosystemVisual";
import OurTeamCarousel from "@/components/OurTeamCarousel";
import ActiveTradeMetrics from "@/components/ActiveTradeMetrics";

const NAV_ITEMS = [
  { id: "company", label: "Our Company" },
  { id: "team", label: "Our Team" },
  { id: "stats", label: "Live statistics" },
  { id: "contact", label: "Contact us" },
];

export default function LandingPage() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [activeSection, setActiveSection] = useState<string>("company");

  const isDark = themeMode === "dark";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial hash detection
    const initialHash = window.location.hash.replace("#", "");
    if (NAV_ITEMS.some((item) => item.id === initialHash)) {
      setActiveSection(initialHash);
    }

    // 2. Hash and History event listeners
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (NAV_ITEMS.some((item) => item.id === hash)) {
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

    NAV_ITEMS.forEach(({ id }) => {
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
      className={`min-h-screen font-sans selection:bg-[#00C853]/25 overflow-x-hidden relative transition-colors duration-500 scroll-smooth flex flex-col justify-between ${
        isDark ? "text-[#E8F1F2]" : "text-[#1A362D]"
      }`}
      style={{
        background: isDark
          ? "radial-gradient(circle at 75% 50%, #13293D 0%, #0A1926 70%)"
          : "radial-gradient(circle at 75% 50%, #e0f2eb 0%, #f7f9f8 60%)",
      }}
    >
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
              : "bg-gradient-to-br from-[#00C853]/20 via-[#52B69A]/20 to-transparent"
          }`}
        />
      </div>

      {/* 3. FLOATING PILL-SHAPED TOP NAVIGATION BAR */}
      <header className="sticky top-4 inset-x-0 z-50 flex justify-center px-4 w-full">
        <nav
          className={`w-[90%] max-w-[1200px] h-16 rounded-full px-5 sm:px-7 flex items-center justify-between transition-all duration-300 ${
            isDark
              ? "bg-[#13293D]/80 backdrop-blur-xl border border-[#247BA0]/40 shadow-[0_8px_32px_rgba(0,0,0,0.35)] text-[#E8F1F2]"
              : "bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(16,42,56,0.06)] text-[#1A362D]"
          }`}
        >
          {/* Logo "Zaminflow" (Exact Official Assets) */}
          <Link href="/" className="flex items-center">
            <ZaminFlowLogo mode={themeMode} size="md" />
          </Link>

          {/* Center Navigation Links (Dynamic Scroll-Spy) */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-tight">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`transition pb-0.5 ${
                    isActive
                      ? "text-[#087a3c] dark:text-[#22d36b] border-b-2 border-[#087a3c] dark:border-[#22d36b] font-bold"
                      : `${
                          isDark
                            ? "text-[#E8F1F2]/80 hover:text-white"
                            : "text-[#1A362D]/85 hover:text-[#087a3c]"
                        } hover:underline underline-offset-4 font-semibold`
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Right Actions: Dark Mode Toggle + Dark Navy Blue "Sign up" Button */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition border ${
                isDark
                  ? "bg-[#006494]/50 border-[#247BA0] text-[#1B98E0] hover:bg-[#247BA0]/40"
                  : "bg-white/90 border-[#E2E8F0] text-[#1A362D] hover:bg-white shadow-xs"
              }`}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Dark Navy Blue "Sign up" Button */}
            <Link
              href="/sign-up"
              className={`px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-95 flex items-center gap-1.5 ${
                isDark
                  ? "bg-[#1B98E0] text-[#13293D] hover:bg-white"
                  : "bg-[#102A38] text-white hover:bg-[#184E77]"
              }`}
            >
              <span>Sign up</span>
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
              <span className={isDark ? "text-[#E8F1F2]" : "text-[#1A362D]"}>
                Connecting smallholder farmers with{" "}
              </span>
              <span className="bg-gradient-to-r from-[#00C853] via-[#4ADE80] to-[#64DD17] bg-clip-text text-transparent inline-block drop-shadow-xs">
                commercial buyers
              </span>
            </h1>

            {/* Dark Grey Subheadline */}
            <p
              className={`mt-6 text-sm sm:text-base lg:text-lg leading-relaxed font-normal ${
                isDark ? "text-[#E8F1F2]/75" : "text-[#4A5D56]"
              }`}
            >
              Empowering Uzbekistan&apos;s dairy industry through digital ordering, logistics
              optimization, dynamic quality-based milk pricing, and secure escrow &amp; factoring
              payment workflows.
            </p>

            {/* Two Horizontal Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full">
              {/* Primary Dark Green "Join Us" Button */}
              <Link
                href="/sign-up"
                className={`px-8 py-3.5 rounded-full text-sm sm:text-base font-bold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 ${
                  isDark
                    ? "bg-[#1B98E0] text-[#13293D] hover:bg-white"
                    : "bg-[#1A362D] text-white hover:bg-[#12251F]"
                }`}
              >
                <span>Join Us</span>
                <span className="text-base font-extrabold">&rarr;</span>
              </Link>

              {/* Light Grey Ghost Button: "Explore Live Stats" with Line-Chart Icon */}
              <a
                href="#stats"
                className={`px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 flex items-center gap-2.5 backdrop-blur-md shadow-sm hover:shadow active:scale-95 border ${
                  isDark
                    ? "bg-[#006494]/30 border-[#247BA0]/40 text-[#E8F1F2] hover:bg-[#006494]/50"
                    : "bg-white/80 border-[#1A362D]/15 text-[#1A362D] hover:bg-white hover:border-[#00C853]"
                }`}
              >
                {/* Line Chart Icon */}
                <svg
                  className={`w-4 h-4 ${isDark ? "text-[#1B98E0]" : "text-[#00C853]"}`}
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
                <span>Explore Live Stats</span>
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

      {/* 6. ACTIVE TRADE METRICS (LIVE STATISTICS) */}
      <ActiveTradeMetrics isDark={isDark} />

      {/* 7. MINIMAL CLEAN FOOTER */}
      <footer
        id="contact"
        className={`relative z-10 border-t py-6 px-6 text-center text-xs transition-colors ${
          isDark
            ? "border-[#247BA0]/30 bg-[#0B1A24]/60 backdrop-blur-md text-[#E8F1F2]/60"
            : "border-[#1A362D]/10 bg-white/60 backdrop-blur-md text-[#1A362D]/70"
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ZaminFlowLogo mode={themeMode} size="sm" />
            <span className="opacity-60">&bull; Republic of Uzbekistan</span>
          </div>

          <div className="text-[11px] font-mono opacity-80">
            &copy; 2026 ZaminFlow Technologies. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}