"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface TeamMember {
  name: string;
  roleKey: "founder" | "coFounder" | "leadDev" | "adviser";
  image: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Muhammadaziz Iminjonov",
    roleKey: "founder",
    image: "/images/team-muhammadaziz.webp",
    linkedin: "https://www.linkedin.com/in/imuhammadaziz/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B%2FEcJS8O%2FRgGnZhvFIPzRPg%3D%3D",
    github: "https://github.com/dev-iminjonov",
    instagram: "https://instagram.com/im.mukhammadaziz",
    email: "iminjonov.mukhammadaziz@gmail.com",
  },
  {
    name: "Sevinçoy Soporboyeva",
    roleKey: "coFounder",
    image: "/images/team-sevinchoy.webp",
    linkedin: "https://www.linkedin.com/in/sevinchoy-soporboyeva/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3Bj1rNvFTKSPGzLrYpN01iZg%3D%3D",
    email: "sevinchoysoporboyeva@gmail.com",
  },
  {
    name: "Akrom Abdumanov",
    roleKey: "leadDev",
    image: "/images/team-akrom.webp",
    linkedin: "https://www.linkedin.com/in/akrom-abdumanov-6457a039a/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BR1yI1s4YSVqIWhj3gbHoUQ%3D%3D",
    instagram: "https://instagram.com/abdumanovakrom",
    email: "abdumanovjamshid1@gmail.com",
  },
  {
    name: "Şohjahon Abdufattohov",
    roleKey: "adviser",
    image: "/images/team-shohjahon.webp",
    email: "sh.abdufattohov@polito.uz",
  },
];

interface OurTeamCarouselProps {
  isDark?: boolean;
}

export default function OurTeamCarousel({ isDark = false }: OurTeamCarouselProps) {
  const { t } = useLanguage();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update progress bar and button disabled states based on scroll position
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
    const cardWidth = 360; // Approximate card width + gap
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section id="team" className="relative w-full py-20 sm:py-28 overflow-hidden select-none scroll-mt-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. SECTION HEADER (Centered, Bold, Modern, Minimalist) */}
        <div className="text-center mb-12 sm:mb-16">
          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight ${
              isDark ? "text-white" : "text-[#081c15]"
            }`}
          >
            {t.team.title}
          </h2>
          <p
            className={`mt-3 text-sm sm:text-base font-normal max-w-md mx-auto ${
              isDark ? "text-[#E8F1F2]/70" : "text-[#2d6a4f]"
            }`}
          >
            {t.team.subtitle}
          </p>
        </div>

        {/* 2. HORIZONTAL SCROLLING CAROUSEL */}
        <div
          ref={carouselRef}
          className="flex gap-6 sm:gap-8 overflow-x-auto scroll-smooth pb-8 pt-2 scrollbar-none no-scrollbar snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px] snap-start group flex flex-col items-center"
            >
              {/* Photo Portrait with Smooth Rounded Corners & Studio Lighting Style */}
              <div
                className={`w-full aspect-[3/4] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_12px_32px_rgba(8,28,21,0.06)] transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(8,28,21,0.12)] group-hover:-translate-y-1 border ${
                  isDark
                    ? "bg-[#1E293B] border-[#247BA0]/30"
                    : "bg-[#d8f3dc]/30 border-[#b7e4c7]"
                }`}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  width={340}
                  height={453}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.name
                    )}&background=1b4332&color=fff&size=512`;
                  }}
                />
              </div>

              {/* Typography: Name and Title below portrait */}
              <div className="mt-5 text-center w-full px-2">
                <h3
                  className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
                    isDark ? "text-[#E8F1F2] group-hover:text-[#1B98E0]" : "text-[#081c15] group-hover:text-[#2d6a4f]"
                  }`}
                >
                  {member.name}
                </h3>
                <p
                  className={`text-xs sm:text-sm font-medium mt-1 ${
                    isDark ? "text-[#E8F1F2]/65" : "text-[#2d6a4f]"
                  }`}
                >
                  {t.team.roles[member.roleKey]}
                </p>

                {/* Social and Contact Links */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      aria-label={`${member.name} LinkedIn`}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full transition-colors ${
                        isDark
                          ? "text-[#E8F1F2]/75 hover:text-[#1B98E0] hover:bg-white/10"
                          : "text-[#1b4332]/75 hover:text-[#087a3c] hover:bg-[#d8f3dc]/60"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}

                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub"
                      aria-label={`${member.name} GitHub`}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full transition-colors ${
                        isDark
                          ? "text-[#E8F1F2]/75 hover:text-[#1B98E0] hover:bg-white/10"
                          : "text-[#1b4332]/75 hover:text-[#087a3c] hover:bg-[#d8f3dc]/60"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}

                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      aria-label={`${member.name} Instagram`}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full transition-colors ${
                        isDark
                          ? "text-[#E8F1F2]/75 hover:text-[#1B98E0] hover:bg-white/10"
                          : "text-[#1b4332]/75 hover:text-[#087a3c] hover:bg-[#d8f3dc]/60"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}

                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      title={`Email ${member.email}`}
                      aria-label={`Email ${member.name}`}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full transition-colors ${
                        isDark
                          ? "text-[#E8F1F2]/75 hover:text-[#1B98E0] hover:bg-white/10"
                          : "text-[#1b4332]/75 hover:text-[#087a3c] hover:bg-[#d8f3dc]/60"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. PROGRESS BAR & NAVIGATION CONTROLS */}
        <div className="mt-8 flex items-center justify-between gap-4 max-w-md mx-auto">
          {/* Progress Indicator Track */}
          <div className="flex-1 h-1.5 bg-[#b7e4c7]/50 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#52b788] to-[#2d6a4f] dark:from-[#00C853] dark:to-[#1B98E0] rounded-full transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous team member"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border ${
                canScrollLeft
                  ? isDark
                    ? "bg-[#13293D] border-[#247BA0]/40 text-white hover:bg-[#247BA0]/40 active:scale-95"
                    : "bg-white/90 border-[#b7e4c7] text-[#081c15] hover:bg-[#d8f3dc] active:scale-95 shadow-xs"
                  : "opacity-30 cursor-not-allowed border-transparent text-gray-400"
              }`}
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Next team member"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border ${
                canScrollRight
                  ? isDark
                    ? "bg-[#13293D] border-[#247BA0]/40 text-white hover:bg-[#247BA0]/40 active:scale-95"
                    : "bg-white/90 border-[#b7e4c7] text-[#081c15] hover:bg-[#d8f3dc] active:scale-95 shadow-xs"
                  : "opacity-30 cursor-not-allowed border-transparent text-gray-400"
              }`}
            >
              &rarr;
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
