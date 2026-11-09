"use client";

import React, { useState } from "react";

export interface ComparisonBarItem {
  label: string; // e.g. "Yan", "Fev", "Dush", "Sesh"
  currentVal: number;
  previousVal: number;
  currentFormatted?: string;
  previousFormatted?: string;
}

export interface InteractiveComparisonBarChartProps {
  title: string;
  subtitle?: string;
  items: ComparisonBarItem[];
  currentLabel?: string;
  previousLabel?: string;
  currentTotal?: string;
  previousTotal?: string;
  primaryColor?: string;
  secondaryColor?: string;
  actionText?: string;
  onActionClick?: () => void;
  isDark?: boolean;
  unit?: string;
}

export default function InteractiveComparisonBarChart({
  title,
  subtitle,
  items,
  currentLabel = "2026 (Joriy)",
  previousLabel = "2025 (Avvalgi)",
  currentTotal,
  previousTotal,
  primaryColor = "#10b981",
  secondaryColor = "#94a3b8",
  actionText,
  onActionClick,
  isDark = false,
  unit = "UZS",
}: InteractiveComparisonBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(
    ...items.map((i) => Math.max(i.currentVal, i.previousVal)),
    1
  );

  const activeItem = hoveredIndex !== null ? items[hoveredIndex] : null;

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div>
            <h3 className="font-bold text-sm tracking-tight">{title}</h3>
            {subtitle && (
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
          {(currentTotal || previousTotal) && (
            <div className="text-right">
              <span className="text-xs font-mono font-bold block" style={{ color: primaryColor }}>
                {activeItem ? activeItem.currentFormatted || `${activeItem.currentVal.toLocaleString()} ${unit}` : currentTotal}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {activeItem ? activeItem.label : "Jami"}
              </span>
            </div>
          )}
        </div>

        {/* Dual Bars Container */}
        <div className="h-44 flex items-end justify-between gap-2.5 pt-6 pb-2 px-1 relative select-none">
          {items.map((b, i) => {
            const hCurrent = Math.max(8, (b.currentVal / maxVal) * 130);
            const hPrev = Math.max(8, (b.previousVal / maxVal) * 130);
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Dual Vertical Pillars */}
                <div className="w-full flex items-end justify-center gap-1.5 h-32 relative">
                  {/* Current Year Bar */}
                  <div
                    className={`w-3 sm:w-3.5 rounded-t-full transition-all duration-200 ${
                      isHovered ? "scale-105 shadow-md" : "hover:opacity-90"
                    }`}
                    style={{
                      height: `${hCurrent}px`,
                      backgroundColor: primaryColor,
                    }}
                    title={`${currentLabel}: ${b.currentFormatted || b.currentVal}`}
                  />

                  {/* Previous Year Bar */}
                  <div
                    className={`w-3 sm:w-3.5 rounded-t-full transition-all duration-200 ${
                      isHovered ? "scale-105 opacity-80" : "opacity-40"
                    }`}
                    style={{
                      height: `${hPrev}px`,
                      backgroundColor: isDark ? "#ffffff" : secondaryColor,
                    }}
                    title={`${previousLabel}: ${b.previousFormatted || b.previousVal}`}
                  />
                </div>

                {/* X-axis Label */}
                <span
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered
                      ? "font-bold text-slate-900 dark:text-white"
                      : "text-slate-400 dark:text-white/40"
                  }`}
                >
                  {b.label}
                </span>
              </div>
            );
          })}

          {/* Floating Tooltip for Active Dual Bar */}
          {activeItem && (
            <div
              className="absolute z-20 pointer-events-none top-0 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl shadow-xl border backdrop-blur-xl text-center text-xs font-mono animate-in fade-in"
              style={{
                backgroundColor: isDark ? "rgba(14,19,25,0.95)" : "rgba(255,255,255,0.96)",
                borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
              }}
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                {activeItem.label}
              </div>
              <div className="flex items-center justify-center gap-3 mt-0.5">
                <span className="font-bold" style={{ color: primaryColor }}>
                  {activeItem.currentFormatted || `${activeItem.currentVal.toLocaleString()} ${unit}`}
                </span>
                <span className="text-slate-400">vs</span>
                <span className="text-slate-400 font-semibold">
                  {activeItem.previousFormatted || `${activeItem.previousVal.toLocaleString()} ${unit}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono pt-3 border-t border-black/5 dark:border-white/10">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span>{currentLabel}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: isDark ? "#ffffff" : secondaryColor, opacity: 0.5 }}
            />
            <span>{previousLabel}</span>
          </span>
        </div>
      </div>

      {/* Action button */}
      {actionText && (
        <button
          type="button"
          onClick={onActionClick}
          className="pt-3 mt-3 border-t border-black/5 dark:border-white/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-center w-full block cursor-pointer transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
