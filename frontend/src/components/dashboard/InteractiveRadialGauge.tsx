"use client";

import React, { useState } from "react";

export interface RadialSegment {
  key: string;
  label: string;
  count?: number;
  countFormatted?: string;
  percentage: number; // 0 - 100
  color: string;
  sublabel: string;
}

export interface InteractiveRadialGaugeProps {
  title: string;
  totalLabel?: string;
  segments: RadialSegment[];
  isDark?: boolean;
  centerUnit?: string;
  defaultActiveKey?: string;
}

export default function InteractiveRadialGauge({
  title,
  totalLabel,
  segments,
  isDark = true,
  centerUnit = "%",
  defaultActiveKey,
}: InteractiveRadialGaugeProps) {
  const [activeKey, setActiveKey] = useState<string>(
    defaultActiveKey || (segments[0] ? segments[0].key : "")
  );

  const activeSegment = segments.find((s) => s.key === activeKey) || segments[0];

  // Arc math: Radius = 80. Circumference of half circle = Math.PI * 80 ≈ 251.327
  const arcLength = 251.327;
  const fraction = activeSegment ? Math.min(100, Math.max(0, activeSegment.percentage)) / 100 : 0;
  const strokeOffset = arcLength * (1 - fraction);

  return (
    <div
      className={`p-6 rounded-3xl border flex flex-col items-center justify-between transition-all w-full h-full select-none ${
        isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
      }`}
    >
      {/* 1. Header */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
        <h4 className="text-sm font-black tracking-tight">{title}</h4>
        {totalLabel && (
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
            style={{
              color: activeSegment?.color || "#10b981",
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            }}
          >
            {totalLabel}
          </span>
        )}
      </div>

      {/* 2. Interactive Half-Circle SVG Radial Gauge */}
      <div className="relative w-52 h-32 my-auto flex items-end justify-center pt-3">
        <svg className="w-52 h-32 overflow-visible" viewBox="0 0 200 115">
          <defs>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)"}
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Active Dynamic Fill Arc with Smooth Transition */}
          {activeSegment && (
            <path
              d="M 20 105 A 80 80 0 0 1 180 105"
              fill="none"
              stroke={activeSegment.color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeOffset}
              style={{
                transition: "stroke-dashoffset 0.65s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease",
              }}
            />
          )}
        </svg>

        {/* Center Live Number & Label */}
        <div className="absolute bottom-1 flex flex-col items-center text-center pointer-events-none">
          <span
            className="text-3xl font-black font-mono tracking-tight transition-all duration-300"
            style={{ color: isDark ? "#ffffff" : "#03045e" }}
          >
            {activeSegment ? `${activeSegment.percentage.toFixed(1)}${centerUnit}` : "--"}
          </span>
          <span
            className={`text-[10px] font-bold tracking-tight mt-0.5 max-w-[140px] truncate transition-colors duration-200 ${
              isDark ? "text-white/60" : "text-slate-500"
            }`}
          >
            {activeSegment ? activeSegment.sublabel : ""}
          </span>
        </div>
      </div>

      {/* 3. Interactive Bottom Segment Buttons */}
      <div className="w-full grid grid-cols-3 gap-1.5 text-center pt-3 border-t border-black/5 dark:border-white/10 text-[10px]">
        {segments.map((seg) => {
          const isActive = seg.key === activeKey;
          return (
            <button
              key={seg.key}
              type="button"
              onClick={() => setActiveKey(seg.key)}
              onMouseEnter={() => setActiveKey(seg.key)}
              className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer text-center ${
                isActive
                  ? isDark
                    ? "bg-white/10 ring-1 ring-white/20 shadow-sm"
                    : "bg-slate-100 ring-1 ring-slate-300 shadow-xs"
                  : "hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
              }`}
            >
              <p
                className={`font-semibold truncate ${
                  isActive ? "text-slate-900 dark:text-white" : isDark ? "text-white/50" : "text-slate-500"
                }`}
              >
                {seg.label}
              </p>
              <p
                className="font-black font-mono mt-0.5 truncate"
                style={{ color: seg.color }}
              >
                {seg.countFormatted || `${seg.percentage}%`}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
