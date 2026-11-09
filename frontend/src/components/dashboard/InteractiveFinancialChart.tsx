"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";

export interface ChartDataPoint {
  label: string;
  val: number;
  date?: string;
  sublabel?: string;
}

export interface InteractiveFinancialChartProps {
  title?: string;
  subtitle?: string;
  totalDisplay: string;
  deltaDisplay: string;
  deltaPositive?: boolean;
  unit?: string;
  accentColor?: string; // hex color e.g. "#10b981" or "#00d3e0"
  secondaryColor?: string;
  gradientId?: string;
  timeRange: "1d" | "1w" | "1m" | "6m" | "1y" | "all";
  onTimeRangeChange: (range: "1d" | "1w" | "1m" | "6m" | "1y" | "all") => void;
  chartType: "line" | "bar";
  onChartTypeChange: (type: "line" | "bar") => void;
  points: ChartDataPoint[];
  isDark?: boolean;
  valueFormatter?: (val: number) => string;
  height?: number;
}

export default function InteractiveFinancialChart({
  title,
  subtitle,
  totalDisplay,
  deltaDisplay,
  deltaPositive = true,
  unit = "UZS",
  accentColor = "#10b981",
  secondaryColor = "#00d3e0",
  gradientId = "chartGradient",
  timeRange,
  onTimeRangeChange,
  chartType,
  onChartTypeChange,
  points,
  isDark = true,
  valueFormatter,
  height = 220,
}: InteractiveFinancialChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const formatVal = useCallback(
    (v: number) => {
      if (valueFormatter) return valueFormatter(v);
      if (v >= 1_000_000_000) {
        return `${(v / 1_000_000_000).toFixed(2)}B ${unit}`;
      }
      if (v >= 1_000_000) {
        return `${(v / 1_000_000).toFixed(2)}M ${unit}`;
      }
      if (v >= 1_000) {
        return `${(v / 1_000).toFixed(1)}K ${unit}`;
      }
      return `${v.toLocaleString()} ${unit}`;
    },
    [valueFormatter, unit]
  );

  // SVG dimensions
  const svgWidth = 760;
  const svgHeight = height;
  const padLeft = 40;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 30;

  // Compute scale and coordinates
  const { coords, pathD, areaD, yTicks, minVal, maxVal } = useMemo(() => {
    if (!points || points.length === 0) {
      return { coords: [], pathD: "", areaD: "", yTicks: [], minVal: 0, maxVal: 100 };
    }

    const rawMin = Math.min(...points.map((p) => p.val));
    const rawMax = Math.max(...points.map((p) => p.val));
    const span = rawMax - rawMin || rawMax || 1;
    const computedMin = Math.max(0, Math.floor(rawMin - span * 0.1));
    const computedMax = Math.ceil(rawMax + span * 0.15);

    const plotWidth = svgWidth - padLeft - padRight;
    const plotHeight = svgHeight - padTop - padBottom;

    const calculatedCoords = points.map((p, idx) => {
      const x =
        points.length === 1
          ? padLeft + plotWidth / 2
          : padLeft + (idx / (points.length - 1)) * plotWidth;
      const normalizedY = (p.val - computedMin) / (computedMax - computedMin || 1);
      const y = padTop + plotHeight - normalizedY * plotHeight;
      return {
        x,
        y,
        label: p.label,
        val: p.val,
        formatted: formatVal(p.val),
      };
    });

    // Build smooth cubic bezier curve
    let pD = `M ${calculatedCoords[0].x} ${calculatedCoords[0].y}`;
    for (let i = 0; i < calculatedCoords.length - 1; i++) {
      const p0 = calculatedCoords[i];
      const p1 = calculatedCoords[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const lastCoord = calculatedCoords[calculatedCoords.length - 1];
    const firstCoord = calculatedCoords[0];
    const aD = `${pD} L ${lastCoord.x} ${svgHeight - padBottom} L ${firstCoord.x} ${
      svgHeight - padBottom
    } Z`;

    // 4 horizontal reference grid ticks
    const step = (computedMax - computedMin) / 3;
    const ticks = [
      { y: padTop, val: computedMax },
      { y: padTop + plotHeight * 0.33, val: computedMin + step * 2 },
      { y: padTop + plotHeight * 0.66, val: computedMin + step },
      { y: padTop + plotHeight, val: computedMin },
    ];

    return {
      coords: calculatedCoords,
      pathD: pD,
      areaD: aD,
      yTicks: ticks,
      minVal: computedMin,
      maxVal: computedMax,
    };
  }, [points, svgWidth, svgHeight, padLeft, padRight, padTop, padBottom, formatVal]);

  // Track mouse over canvas to find nearest point
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || coords.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const svgX = (clientX / rect.width) * svgWidth;

      let nearestIdx = 0;
      let minDistance = Infinity;
      coords.forEach((c, idx) => {
        const dist = Math.abs(c.x - svgX);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = idx;
        }
      });
      setHoveredIdx(nearestIdx);
    },
    [coords, svgWidth]
  );

  const activePoint = hoveredIdx !== null && coords[hoveredIdx] ? coords[hoveredIdx] : null;

  return (
    <div className="w-full">
      {/* 1. Header with Live Totals, Delta, and Interactive Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
        <div>
          {subtitle && (
            <span
              className={`text-[10px] font-mono tracking-widest uppercase font-bold block mb-1 ${
                isDark ? "text-white/40" : "text-slate-500"
              }`}
            >
              {subtitle}
            </span>
          )}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
              {activePoint ? activePoint.formatted : totalDisplay}
            </span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                deltaPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {deltaPositive ? "▲" : "▼"} {deltaDisplay}
            </span>
          </div>
          {activePoint && (
            <div className="text-[11px] font-mono text-emerald-500 dark:text-[#00ffc8] font-bold mt-0.5">
              ● {activePoint.label} holatiga koʻra
            </div>
          )}
        </div>

        {/* Controls: Chart Type (Line/Bar) + Timeframe Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Line vs Bar toggle */}
          <div
            className={`flex items-center p-0.5 rounded-xl border ${
              isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={() => onChartTypeChange("line")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === "line"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title="Chiziqli grafik (Smooth Curve)"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 18 L8 13 L13 16 L21 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onChartTypeChange("bar")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title="Ustunli grafik (Bar Chart)"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="4" y="10" width="3.5" height="10" rx="1" />
                <rect x="10.25" y="5" width="3.5" height="15" rx="1" />
                <rect x="16.5" y="13" width="3.5" height="7" rx="1" />
              </svg>
            </button>
          </div>

          {/* Timeframe selector pills */}
          <div
            className={`flex items-center p-0.5 rounded-xl border text-xs font-mono font-bold ${
              isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
            }`}
          >
            {(["1d", "1w", "1m", "6m", "1y", "all"] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => onTimeRangeChange(period)}
                className={`px-2.5 py-1 rounded-lg uppercase transition-all cursor-pointer ${
                  timeRange === period
                    ? "bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-black"
                    : "text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIdx(null)}
        onTouchMove={(e) => {
          if (!containerRef.current || coords.length === 0) return;
          const rect = containerRef.current.getBoundingClientRect();
          const touch = e.touches[0];
          if (!touch) return;
          const clientX = touch.clientX - rect.left;
          const svgX = (clientX / rect.width) * svgWidth;
          let nearestIdx = 0;
          let minDistance = Infinity;
          coords.forEach((c, idx) => {
            const dist = Math.abs(c.x - svgX);
            if (dist < minDistance) {
              minDistance = dist;
              nearestIdx = idx;
            }
          });
          setHoveredIdx(nearestIdx);
        }}
        onTouchEnd={() => setHoveredIdx(null)}
        className="relative w-full select-none cursor-crosshair pt-4"
        style={{ height: `${svgHeight + 35}px` }}
      >
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Smooth linear gradient under the curve */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.32" />
              <stop offset="60%" stopColor={secondaryColor} stopOpacity="0.10" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing dot drop shadow filter */}
            <filter id={`glow-${gradientId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Reference Grid Lines with Y-Axis value tags */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={svgWidth - padRight}
                y2={tick.y}
                stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={tick.y + 3}
                textAnchor="end"
                className="text-[9px] font-mono fill-slate-400 dark:fill-white/30"
              >
                {formatVal(Math.round(tick.val))}
              </text>
            </g>
          ))}

          {chartType === "line" ? (
            <>
              {/* Filled Area Gradient */}
              <path d={areaD} fill={`url(#${gradientId})`} />

              {/* Main Smooth Spline Line */}
              <path
                d={pathD}
                fill="none"
                stroke={accentColor}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Vertical Crosshair Guide */}
              {activePoint && (
                <line
                  x1={activePoint.x}
                  y1={padTop}
                  x2={activePoint.x}
                  y2={svgHeight - padBottom}
                  stroke={accentColor}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  className="opacity-70 animate-in fade-in duration-150"
                />
              )}

              {/* Point Circles */}
              {coords.map((pt, idx) => {
                const isActive = hoveredIdx === idx;
                return (
                  <g key={idx}>
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="10"
                        fill={accentColor}
                        fillOpacity="0.25"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? 6 : 4}
                      fill={isDark ? "#0d1013" : "#ffffff"}
                      stroke={accentColor}
                      strokeWidth={isActive ? 3.5 : 2.5}
                      className="transition-all duration-200 cursor-pointer"
                    />
                  </g>
                );
              })}
            </>
          ) : (
            /* Bar Chart view */
            <g>
              {coords.map((pt, idx) => {
                const isActive = hoveredIdx === idx;
                const barWidth = Math.max(16, (svgWidth - padLeft - padRight) / coords.length - 14);
                const barHeight = Math.max(8, svgHeight - padBottom - pt.y);
                const barX = pt.x - barWidth / 2;
                const barY = svgHeight - padBottom - barHeight;

                return (
                  <g key={idx}>
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx="6"
                      fill={isActive ? accentColor : isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)"}
                      className="transition-all duration-200 hover:opacity-90"
                    />
                    {isActive && (
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        rx="6"
                        fill={accentColor}
                        fillOpacity="0.9"
                        filter={`url(#glow-${gradientId})`}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* 3. Sleek Floating Tooltip attached to active cursor */}
        {activePoint && (
          <div
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-75 flex flex-col items-center animate-in fade-in zoom-in-95"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
              top: `${(activePoint.y / svgHeight) * 100}%`,
              backgroundColor: isDark ? "rgba(14,19,25,0.95)" : "rgba(255,255,255,0.96)",
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
              boxShadow: isDark
                ? "0 10px 30px rgba(0,0,0,0.7), 0 0 15px rgba(0,255,200,0.2)"
                : "0 10px 30px rgba(0,0,0,0.1), 0 0 15px rgba(0,153,255,0.15)",
            }}
          >
            <span
              className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                isDark ? "text-white/60" : "text-slate-500"
              }`}
            >
              {activePoint.label}
            </span>
            <span
              className="text-xs sm:text-sm font-black font-mono tracking-tight mt-0.5"
              style={{ color: accentColor }}
            >
              {activePoint.formatted}
            </span>
          </div>
        )}

        {/* 4. Bottom Date Labels */}
        <div
          className="flex justify-between items-center text-[10px] font-mono pt-3 border-t border-black/5 dark:border-white/10"
          style={{ paddingLeft: `${padLeft}px`, paddingRight: `${padRight}px` }}
        >
          {coords.map((pt, idx) => (
            <span
              key={idx}
              className={`transition-colors font-medium ${
                hoveredIdx === idx
                  ? "text-emerald-500 dark:text-[#00ffc8] font-bold"
                  : isDark
                  ? "text-white/40"
                  : "text-slate-400"
              }`}
            >
              {pt.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
