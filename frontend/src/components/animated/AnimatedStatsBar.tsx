"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  title: string;
  subtitle: string;
}

export default function AnimatedStatsBar({ isDark = true }: { isDark?: boolean }) {
  const { t } = useLanguage();
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const statsData: StatItem[] = [
    {
      value: 14,
      suffix: "+",
      title: t.statsBar.regionsTitle,
      subtitle: t.statsBar.regionsSub,
    },
    {
      value: 1.8,
      suffix: "M+",
      title: t.statsBar.milkTitle,
      subtitle: t.statsBar.milkSub,
    },
    {
      value: 450,
      suffix: "+",
      title: t.statsBar.partnersTitle,
      subtitle: t.statsBar.partnersSub,
    },
    {
      value: 100,
      suffix: "%",
      title: t.statsBar.escrowTitle,
      subtitle: t.statsBar.escrowSub,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={containerRef}
      className="relative w-full z-20 -mt-8 sm:-mt-12 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto select-none"
    >
      {/* Royal-Blue to Turquoise Dreamland Gradient Band */}
      <div
        className="rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 shadow-[0_24px_64px_rgba(0,153,255,0.22)] border border-white/20 relative overflow-hidden transition-all duration-500"
        style={{
          background: "linear-gradient(135deg, #070B14 0%, #0d1013 30%, #004b75 70%, #0099ff 100%)",
        }}
      >
        {/* Glow Accent Mesh */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ffc8]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0099ff]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
          {statsData.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3.5 sm:gap-4 ${
                idx !== 0 ? "lg:border-l lg:border-white/15 lg:pl-6" : ""
              }`}
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-baseline">
                {item.prefix}
                <Counter target={item.value} run={hasAnimated} />
                <span className="text-[#00ffc8] text-2xl sm:text-3xl font-extrabold ml-0.5">
                  {item.suffix}
                </span>
              </div>
              <div className="flex flex-col text-left min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight break-words line-clamp-2" title={item.title}>
                  {item.title}
                </span>
                <span className="text-[11px] text-white/70 leading-tight break-words mt-0.5" title={item.subtitle}>
                  {item.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ target, run }: { target: number; run: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!run) return;
    const duration = 1600; // ms
    const steps = 40;
    const stepDuration = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Number((target * eased).toFixed(target % 1 === 0 ? 0 : 1));
      setCount(current);

      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [run, target]);

  return <span>{count}</span>;
}
