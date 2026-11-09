"use client";

import React, { useRef, useState, useEffect } from "react";
import { SplashDoodle } from "./DoodleAccents";
import { useLanguage } from "@/context/LanguageContext";

interface TeamMember {
  name: string;
  roleKey: "founder" | "coFounder" | "leadDev" | "adviser";
  image: string;
  badge: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Muhammadaziz Iminjonov",
    roleKey: "founder",
    badge: "Boşqaruvçi",
    image: "/images/team-muhammadaziz.webp",
    linkedin: "https://www.linkedin.com/in/imuhammadaziz/",
    github: "https://github.com/dev-iminjonov",
    instagram: "https://instagram.com/im.mukhammadaziz",
    email: "iminjonov.mukhammadaziz@gmail.com",
  },
  {
    name: "Sevinçoy Soporboyeva",
    roleKey: "coFounder",
    badge: "Operatsiyalar",
    image: "/images/team-sevinchoy.webp",
    linkedin: "https://www.linkedin.com/in/sevinchoy-soporboyeva/",
    email: "sevinchoysoporboyeva@gmail.com",
  },
  {
    name: "Akrom Abdumanov",
    roleKey: "leadDev",
    badge: "Yetakçi Muhandis",
    image: "/images/team-akrom.webp",
    linkedin: "https://www.linkedin.com/in/akrom-abdumanov-6457a039a/",
    instagram: "https://instagram.com/abdumanovakrom",
    email: "abdumanovjamshid1@gmail.com",
  },
  {
    name: "Şohjahon Abdufattohov",
    roleKey: "adviser",
    badge: "Strategik Maslahatçi",
    image: "/images/team-shohjahon.webp",
    email: "sh.abdufattohov@polito.uz",
  },
];

export default function TeamSection({ isDark = false }: { isDark?: boolean }) {
  const { t } = useLanguage();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(100);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const progress = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
    setScrollProgress(progress);
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 360;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section id="team" className="relative w-full py-20 sm:py-28 overflow-hidden select-none scroll-mt-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Row: Title & Subtitle + Hand-Drawn Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black tracking-widest uppercase text-[#00d3e0]">
                {t.team.badge}
              </span>
              <SplashDoodle size={24} color="#00ffc8" />
            </div>
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.25] sm:leading-[1.3] ${
                isDark ? "text-white" : "text-[#03045e]"
              }`}
            >
              {t.team.titleStart}{" "}
              <span className={`inline ${
                isDark
                  ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#0369a1] bg-clip-text text-transparent"
              }`}>
                {t.team.titleAccent}
              </span>
            </h2>
            <p
              className={`mt-3 text-sm sm:text-base max-w-lg ${
                isDark ? "text-[#E8F1F2]/70" : "text-[#0077b6]"
              }`}
            >
              {t.team.subtitle}
            </p>
          </div>

          {/* Hand-Drawn / Minimalist Arrow Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Oldingi jamoa a'zosi"
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "border-[#00d3e0] text-[#00d3e0] hover:bg-[#00d3e0]/10 hover:scale-105 active:scale-95"
                  : "border-gray-300 dark:border-white/10 text-gray-300 dark:text-white/20 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Keyingi jamoa a'zosi"
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight
                  ? "border-[#00d3e0] text-[#00d3e0] hover:bg-[#00d3e0]/10 hover:scale-105 active:scale-95"
                  : "border-gray-300 dark:border-white/10 text-gray-300 dark:text-white/20 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className={`snap-start shrink-0 w-[280px] sm:w-[320px] rounded-[32px] overflow-hidden border transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,153,255,0.22)] ${
                isDark
                  ? "bg-[#14181d]/85 backdrop-blur-xl border-white/10 hover:border-[#00d3e0]/50"
                  : "bg-white/95 backdrop-blur-xl border-[#ade8f4] hover:border-[#00d3e0]/60 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
              }`}
            >
              {/* Studio Portrait Frame */}
              <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Soft Bottom Gradient Mask */}
                <div
                  className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${
                    isDark ? "from-[#14181d] via-[#14181d]/50" : "from-white via-white/50"
                  } to-transparent`}
                />
              </div>

              {/* Bio & Socials */}
              <div className="p-6">
                <h3
                  className={`text-lg sm:text-xl font-bold tracking-tight mb-1 ${
                    isDark ? "text-white" : "text-[#03045e]"
                  }`}
                >
                  {member.name}
                </h3>
                <p className={`text-xs font-semibold mb-4 ${isDark ? "text-[#00d3e0]" : "text-emerald-700"}`}>
                  {t.team.roles[member.roleKey]}
                </p>

                {/* Interactive Social Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-black/5 dark:border-white/10">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-[#0099ff]/10 hover:bg-[#0099ff] text-[#0099ff] hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                      title="LinkedIn"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-[#24292F] text-slate-700 dark:text-white hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                      title="GitHub"
                      aria-label={`${member.name} GitHub`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </a>
                  )}
                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-pink-500/10 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-pink-500 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                      title="Instagram"
                      aria-label={`${member.name} Instagram`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="w-8 h-8 rounded-full bg-emerald-500/10 hover:bg-emerald-600 text-emerald-500 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                      title="Email"
                      aria-label={`${member.name} Email`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Track Progress Bar */}
        <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden mt-4">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(15, scrollProgress)}%`,
              background: "linear-gradient(90deg, #00ffc8 0%, #0099ff 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
