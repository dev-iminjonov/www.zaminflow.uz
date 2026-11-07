"use client";

import React, { useRef, useState, useEffect } from "react";

interface TeamMember {
  name: string;
  title: string;
  image: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Iminjonov Muhammadaziz",
    title: "Founder",
    image: "/images/team-muhammadaziz.jpg",
    linkedin: "https://www.linkedin.com/in/imuhammadaziz/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B%2FEcJS8O%2FRgGnZhvFIPzRPg%3D%3D",
    github: "https://github.com/dev-iminjonov",
    instagram: "https://instagram.com/im.mukhammadaziz",
  },
  {
    name: "Sevinchoy Soporboyeva",
    title: "Co-Founder",
    image: "/images/team-sevinchoy.jpg",
    linkedin: "https://www.linkedin.com/in/sevinchoy-soporboyeva/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3Bj1rNvFTKSPGzLrYpN01iZg%3D%3D",
  },
  {
    name: "Abdumanov Akrom",
    title: "Lead Software Developer",
    image: "/images/team-akrom.jpg",
    linkedin: "https://www.linkedin.com/in/akrom-abdumanov-6457a039a/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BR1yI1s4YSVqIWhj3gbHoUQ%3D%3D",
    instagram: "https://instagram.com/abdumanovakrom",
  },
  {
    name: "Shokhjakhon Abdufattohov",
    title: "Adviser",
    image: "/images/team-shohjahon.jpg",
    email: "sh.abdufattohov@polito.uz",
  },
];

interface OurTeamCarouselProps {
  isDark?: boolean;
}

export default function OurTeamCarousel({ isDark = false }: OurTeamCarouselProps) {
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
    <section id="team" className="relative w-full py-20 sm:py-28 overflow-hidden select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. SECTION HEADER (Centered, Bold, Modern, Minimalist) */}
        <div className="text-center mb-12 sm:mb-16">
          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight ${
              isDark ? "text-white" : "text-[#1A362D]"
            }`}
          >
            Our Team
          </h2>
          <p
            className={`mt-3 text-sm sm:text-base font-normal max-w-md mx-auto ${
              isDark ? "text-[#E8F1F2]/70" : "text-[#4A5D56]"
            }`}
          >
            The dedicated builders behind Uzbekistan&apos;s digital dairy infrastructure.
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
                className={`w-full aspect-[3/4] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.14)] group-hover:-translate-y-1 border ${
                  isDark
                    ? "bg-[#1E293B] border-[#247BA0]/30"
                    : "bg-[#EAEAEA] border-white/60"
                }`}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to placeholder avatar if image is still loading
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.name
                    )}&background=1A362D&color=fff&size=512`;
                  }}
                />
              </div>

              {/* Typography: Name and Title below portrait */}
              <div className="mt-5 text-center w-full px-2">
                <h3
                  className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
                    isDark ? "text-[#E8F1F2] group-hover:text-[#1B98E0]" : "text-[#1A362D] group-hover:text-[#00C853]"
                  }`}
                >
                  {member.name}
                </h3>
                <p
                  className={`text-xs sm:text-sm font-medium mt-1 ${
                    isDark ? "text-[#E8F1F2]/65" : "text-[#4A5D56]"
                  }`}
                >
                  ({member.title})
                </p>

                {/* Social Links: LinkedIn, GitHub, Instagram, Email (44x44px accessible touch targets) */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  {/* LinkedIn */}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} LinkedIn`}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#087a3c] dark:hover:text-[#22d36b] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.89 0-1.6.72-1.6 1.61 0 .89.71 1.61 1.6 1.61.89 0 1.6-.72 1.6-1.61 0-.89-.71-1.61-1.6-1.61Z" />
                      </svg>
                    </a>
                  )}

                  {/* GitHub */}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} GitHub`}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#087a3c] dark:hover:text-[#22d36b] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                      </svg>
                    </a>
                  )}

                  {/* Instagram */}
                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} Instagram`}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#087a3c] dark:hover:text-[#22d36b] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}

                  {/* Email */}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      aria-label={`${member.name} Email`}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#087a3c] dark:hover:text-[#22d36b] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. NAVIGATION & INTERACTIVE CONTROLS (Progress Bar + Left/Right Buttons) */}
        <div className="mt-8 flex items-center justify-between gap-6 pt-4 border-t border-[#1A362D]/10 dark:border-white/10">
          
          {/* Sleek Horizontal Progress Bar with Subtle Left-to-Right Color Gradient */}
          <div className="flex-1 max-w-md h-1.5 rounded-full bg-[#E2E8F0] dark:bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00C853] via-[#34A0A4] to-[#1B98E0] transition-all duration-300 ease-out"
              style={{
                width: `${Math.max(20, scrollProgress)}%`,
                transform: `translateX(0%)`,
              }}
            />
          </div>

          {/* Circular Navigation Buttons on the Bottom Right Side */}
          <div className="flex items-center gap-3">
            {/* Left Button */}
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll team left"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                !canScrollLeft
                  ? "opacity-40 cursor-not-allowed bg-[#102A38]/50 text-white/50"
                  : "bg-[#102A38] dark:bg-[#13293D] text-white hover:bg-[#1A362D] dark:hover:bg-[#1B98E0] active:scale-95"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Right Button */}
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll team right"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                !canScrollRight
                  ? "opacity-40 cursor-not-allowed bg-[#102A38]/50 text-white/50"
                  : "bg-[#102A38] dark:bg-[#13293D] text-white hover:bg-[#1A362D] dark:hover:bg-[#1B98E0] active:scale-95"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}