"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  TimeRange,
  RegionId,
  ActiveTradeMetricsPayload,
  PricePoint,
  RecentTradeEvent,
  fetchActiveTradeMetrics,
  subscribeActiveTradeMetrics,
} from "@/lib/activeTradeMetricsData";

interface ActiveTradeMetricsProps {
  isDark?: boolean;
}

// Custom hook to animate numbers smoothly with count-up effect
function useAnimatedNumber(targetValue: number, duration: number = 800): number {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const startValueRef = useRef(targetValue);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(targetValue);
      return;
    }

    startValueRef.current = displayValue;
    startTimeRef.current = null;

    let animId: number;
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);

      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(
        startValueRef.current + (targetValue - startValueRef.current) * easeProgress
      );

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [targetValue, duration]);

  return displayValue;
}

export default function ActiveTradeMetrics({ isDark = false }: ActiveTradeMetricsProps) {
  const { t } = useLanguage();
  const [range, setRange] = useState<TimeRange>("30D");
  const [region, setRegion] = useState<RegionId>("all");
  const [data, setData] = useState<ActiveTradeMetricsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");
  const [activeTooltip, setActiveTooltip] = useState<PricePoint | null>(null);
  const [isDelayed, setIsDelayed] = useState<boolean>(false);
  const [connStatus, setConnStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");
  const [tickerFlash, setTickerFlash] = useState<RecentTradeEvent | null>(null);
  const gradientId = useId();

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: "Today", label: t.stats.ranges.today },
    { id: "7D", label: t.stats.ranges.d7 },
    { id: "30D", label: t.stats.ranges.d30 },
    { id: "12M", label: t.stats.ranges.m12 },
  ];

  const regionsList: { id: RegionId; label: string }[] = [
    { id: "all", label: t.regions.all },
    { id: "andijan", label: t.regions.andijan },
    { id: "samarqand", label: t.regions.samarqand },
    { id: "fergana", label: t.regions.fergana },
    { id: "namangan", label: t.regions.namangan },
    { id: "qashqadaryo", label: t.regions.qashqadaryo },
    { id: "tashkent", label: t.regions.tashkent },
    { id: "syrdarya", label: t.regions.syrdarya },
    { id: "surxondaryo", label: t.regions.surxondaryo },
  ];

  // Manual refresh fallback
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchActiveTradeMetrics(range, region);
      setData(result);
      setIsDelayed(false);
    } catch (err: any) {
      setError(err?.message || "Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  };

  // Sub-second streaming subscription
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeActiveTradeMetrics({
      range,
      region,
      onUpdate: (payload) => {
        setData(payload);
        setLoading(false);
        setIsDelayed(false);
      },
      onTradeFlash: (event) => {
        setTickerFlash(event);
        setTimeout(() => setTickerFlash(null), 6000);
      },
      onConnectionChange: (status) => {
        setConnStatus(status);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [range, region]);

  // Watch for data delayed (>60s)
  useEffect(() => {
    const delayWatcher = setInterval(() => {
      if (data?.lastUpdated && Date.now() - data.lastUpdated > 60000) {
        setIsDelayed(true);
      }
    }, 5000);

    return () => {
      clearInterval(delayWatcher);
    };
  }, [data?.lastUpdated]);

  // Animated KPI numbers
  const animAvgPrice = useAnimatedNumber(data?.kpis.avgPrice.value ?? 4380);
  const animVolume = useAnimatedNumber(data?.kpis.volumeToday.value ?? 186400);
  const animShipments = useAnimatedNumber(data?.kpis.activeShipments.value ?? 47);
  const animEscrow = useAnimatedNumber(data?.kpis.securedEscrow.value ?? 48500000);

  // Formatting helpers
  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

  // SVG Chart path calculation
  const points = data?.priceSeries.points || [];
  const linePath = points.length
    ? `M${points.map((p) => `${p.x} ${p.y}`).join(" L")}`
    : "";
  const areaPath = points.length
    ? `M${points[0].x} ${points[0].y} L${points
        .map((p) => `${p.x} ${p.y}`)
        .join(" L")} L${points[points.length - 1].x} 195 L${points[0].x} 195 Z`
    : "";

  return (
    <section
      id="stats"
      aria-label={t.stats.titleStart + " " + t.stats.titleAccent}
      className="relative w-full py-16 sm:py-24 transition-colors duration-500 scroll-mt-20"
      style={{
        background: isDark
          ? "linear-gradient(160deg, #13293D 0%, #0A1926 100%)"
          : "linear-gradient(160deg, #f6f9f8 0%, #e4f6ec 100%)",
      }}
    >
      {/* Accessible live region for screen readers */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      <div className="max-w-[1180px] mx-auto px-6 flex flex-col gap-7">
        
        {/* 1. DATA DELAYED BANNER (Shown only if data > 60s old) */}
        {isDelayed && (
          <div className="w-full bg-[#fdf0d2] text-[#7a4b00] border border-[#f5d898] rounded-xl px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs">
            <span>{t.stats.delayedNotice}</span>
            <button
              onClick={handleRefresh}
              className="font-bold underline hover:no-underline ml-4 cursor-pointer"
            >
              {t.stats.refreshNow}
            </button>
          </div>
        )}

        {/* Instant Contract Ticker Tape Flash */}
        {tickerFlash && (
          <div className="transition-all duration-300 rounded-2xl px-4 py-3 bg-[#d9f7e5]/90 dark:bg-[#13293D] border border-[#22d36b]/40 text-[#087a3c] dark:text-[#22d36b] flex items-center justify-between gap-4 text-sm font-semibold shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22d36b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22d36b]"></span>
              </span>
              <span>
                <strong>{tickerFlash.title}:</strong> {tickerFlash.description}
              </span>
            </div>
            <span className="font-mono text-xs opacity-75 shrink-0">{t.stats.subsecondTicker}</span>
          </div>
        )}

        {/* 2. HEADER ROW (items bottom-aligned, wraps on small screens) */}
        <header className="flex flex-wrap items-end justify-between gap-6 pt-4">
          <div className="flex-1 min-w-[300px]">
            <h2 className="text-4xl sm:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em] select-none text-left">
              <span className="text-[#087a3c]">{t.stats.titleStart}</span>{" "}
              <span className={isDark ? "text-white" : "text-[#17352c]"}>
                {t.stats.titleAccent}
              </span>
            </h2>
          </div>

          {/* Right Controls: Range Segmented Control + Region Dropdown */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Segmented Range Control */}
            <div
              role="radiogroup"
              aria-label={t.stats.filterRange}
              className={`flex rounded-full p-1 shadow-[0_4px_20px_rgba(20,80,60,0.06)] border ${
                isDark ? "bg-[#102433] border-[#247BA0]/30" : "bg-white border-white/60"
              }`}
            >
              {timeRanges.map((r) => {
                const isActive = range === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setRange(r.id)}
                    className={`font-semibold text-sm rounded-full px-4 sm:px-4.5 py-2 min-h-[44px] transition-all duration-200 cursor-pointer ${
                      isActive
                        ? isDark
                          ? "bg-[#1B98E0] text-[#13293D] shadow-sm font-bold"
                          : "bg-[#12303a] text-white shadow-sm font-bold"
                        : isDark
                        ? "text-[#E8F1F2]/80 hover:text-white"
                        : "text-[#17352c] hover:text-[#087a3c]"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Accessible Region Select Dropdown */}
            <div className="relative">
              <label htmlFor="region-select" className="sr-only">
                {t.stats.allRegions}
              </label>
              <select
                id="region-select"
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionId)}
                className={`font-semibold text-sm rounded-full px-5 py-2 min-h-[44px] border transition shadow-xs cursor-pointer appearance-none pr-9 ${
                  isDark
                    ? "bg-[#102433] border-[#247BA0]/40 text-[#E8F1F2] hover:border-[#1B98E0]"
                    : "bg-white border-[#17352c]/12 text-[#17352c] hover:border-[#087a3c]"
                }`}
              >
                {regionsList.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs opacity-70">
                ▾
              </div>
            </div>
          </div>
        </header>

        {/* 3. ERROR STATE (If fetch fails) */}
        {error && (
          <div className="p-6 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
            <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 rounded-full bg-[#12303a] text-white text-xs font-bold hover:bg-[#1A362D] cursor-pointer"
            >
              {t.stats.retry}
            </button>
          </div>
        )}

        {/* 4. KPI ROW (4 Glass Cards in Auto-fit Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* KPI 1: Avg. milk price */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 border shadow-[0_10px_40px_rgba(20,80,60,0.08)] ${
              isDark
                ? "bg-[#13293D]/75 border-white/10 backdrop-blur-md"
                : "bg-white/76 border-white backdrop-blur-md"
            }`}
          >
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              {t.stats.avgPrice}
            </div>
            {loading ? (
              <div className="h-10 w-32 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse my-3" />
            ) : (
              <div className="flex items-baseline gap-2 my-3">
                <span className="font-mono text-4xl font-bold tracking-tight text-[#17352c] dark:text-white">
                  {formatNumber(animAvgPrice)}
                </span>
                <span className="font-mono text-[13px] text-[#4d6a60] dark:text-[#E8F1F2]/60">
                  {t.stats.currencyUnit} / {t.stats.litersUnit}
                </span>
                {data?.kpis.avgPrice.delta && (
                  <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
                    {data.kpis.avgPrice.delta}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* KPI 2: Volume traded today */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 border shadow-[0_10px_40px_rgba(20,80,60,0.08)] ${
              isDark
                ? "bg-[#13293D]/75 border-white/10 backdrop-blur-md"
                : "bg-white/76 border-white backdrop-blur-md"
            }`}
          >
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              {t.stats.volumeToday}
            </div>
            {loading ? (
              <div className="h-10 w-36 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse my-3" />
            ) : (
              <div className="flex items-baseline gap-2 my-3">
                <span className="font-mono text-4xl font-bold tracking-tight text-[#17352c] dark:text-white">
                  {formatNumber(animVolume)}
                </span>
                <span className="font-mono text-[13px] text-[#4d6a60] dark:text-[#E8F1F2]/60">
                  {t.stats.litersUnit}
                </span>
                {data?.kpis.volumeToday.delta && (
                  <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
                    {data.kpis.volumeToday.delta}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* KPI 3: Active shipments */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 border shadow-[0_10px_40px_rgba(20,80,60,0.08)] ${
              isDark
                ? "bg-[#13293D]/75 border-white/10 backdrop-blur-md"
                : "bg-white/76 border-white backdrop-blur-md"
            }`}
          >
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              {t.stats.activeShipments}
            </div>
            {loading ? (
              <div className="h-10 w-24 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse my-3" />
            ) : (
              <div className="flex items-baseline gap-2 my-3">
                <span className="font-mono text-4xl font-bold tracking-tight text-[#17352c] dark:text-white">
                  {formatNumber(animShipments)}
                </span>
                <span className="font-mono text-[13px] text-[#4d6a60] dark:text-[#E8F1F2]/60">
                  {t.stats.trucksUnit}
                </span>
                {data?.kpis.activeShipments.delta && (
                  <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
                    {data.kpis.activeShipments.delta}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* KPI 4: Secured escrow */}
          <div
            className={`rounded-3xl p-6 transition-all duration-300 border shadow-[0_10px_40px_rgba(20,80,60,0.08)] ${
              isDark
                ? "bg-[#13293D]/75 border-white/10 backdrop-blur-md"
                : "bg-white/76 border-white backdrop-blur-md"
            }`}
          >
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
              {t.stats.securedEscrow}
            </div>
            {loading ? (
              <div className="h-10 w-40 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse my-3" />
            ) : (
              <div className="flex items-baseline gap-2 my-3">
                <span className="font-mono text-4xl font-bold tracking-tight text-[#17352c] dark:text-white">
                  {formatNumber(animEscrow)}
                </span>
                <span className="font-mono text-[13px] text-[#4d6a60] dark:text-[#E8F1F2]/60">
                  {t.stats.currencyUnit}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* 5. CHART ROW (Price Chart Card + Quality Grades Card) */}
        <div className="flex flex-wrap gap-5">
          
          {/* Price Chart Card */}
          <div
            className={`flex-[2_1_560px] rounded-3xl p-6 transition-all duration-300 border shadow-[0_10px_40px_rgba(20,80,60,0.08)] relative ${
              isDark
                ? "bg-[#13293D]/75 border-white/10 backdrop-blur-md"
                : "bg-white/76 border-white backdrop-blur-md"
            }`}
          >
            <div className="flex flex-wrap justify-between items-baseline gap-3 mb-2">
              <div>
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  {t.stats.priceTrendTitle}
                </div>
                <div className="text-[22px] font-bold mt-1 text-[#17352c] dark:text-white">
                  {data?.priceSeries.title || t.stats.priceTrendTitle}
                </div>
              </div>

              <div className="flex gap-5 text-[13px] text-[#4d6a60] dark:text-[#E8F1F2]/70 font-medium">
                <span>
                  {t.stats.low}{" "}
                  <b className="font-mono font-bold text-[#17352c] dark:text-white">
                    {formatNumber(data?.priceSeries.low || 3890)}
                  </b>
                </span>
                <span>
                  {t.stats.high}{" "}
                  <b className="font-mono font-bold text-[#17352c] dark:text-white">
                    {formatNumber(data?.priceSeries.high || 4420)}
                  </b>
                </span>
              </div>
            </div>

            {/* Interactive Hand-Rolled Lightweight SVG Area + Line Chart */}
            <div className="w-full relative mt-4">
              <svg
                viewBox="0 0 660 230"
                role="img"
                aria-label={data?.priceSeries.trendSummary || t.stats.priceTrendTitle}
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  <linearGradient id={`chartGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d36b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22d36b" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* 4 Faint Horizontal Gridlines */}
                {[45, 95, 145, 195].map((y) => (
                  <line
                    key={y}
                    x1="20"
                    y1={y}
                    x2="640"
                    y2={y}
                    stroke={isDark ? "rgba(255,255,255,0.08)" : "#e2ebe7"}
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                ))}

                {/* Area Gradient Fill */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill={`url(#chartGradient-${gradientId})`}
                    className="transition-all duration-500 ease-out"
                  />
                )}

                {/* Stroke Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#22d36b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500 ease-out"
                  />
                )}

                {/* Interactive Data Points with invisible 32px touch targets */}
                {points.map((pt, index) => {
                  const isHovered = activeTooltip?.x === pt.x && activeTooltip?.y === pt.y;
                  const isLast = index === points.length - 1;

                  return (
                    <g key={index}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="16"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => {
                          setActiveTooltip(pt);
                          setAnnouncement(`${pt.date}: ${formatNumber(pt.price)} UZS/L`);
                        }}
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {(isLast || isHovered) && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 7 : 6}
                          fill="#ffffff"
                          stroke="#12a150"
                          strokeWidth="3"
                          className="transition-all duration-150"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Latest Price Navy Rounded Badge above the last point */}
                {points.length > 0 && (
                  <g transform={`translate(${points[points.length - 1].x - 42}, 2)`}>
                    <rect
                      x="0"
                      y="0"
                      width="84"
                      height="26"
                      rx="8"
                      fill={isDark ? "#1B98E0" : "#12303a"}
                    />
                    <text
                      x="42"
                      y="17"
                      fontSize="12"
                      fontWeight="700"
                      fill={isDark ? "#13293D" : "#ffffff"}
                      textAnchor="middle"
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {formatNumber(data?.priceSeries.latestPrice || 4380)}
                    </text>
                  </g>
                )}
              </svg>

              {/* Floating Tooltip upon Hover */}
              {activeTooltip && (
                <div
                  className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#12303a] text-white shadow-lg border border-white/20 whitespace-nowrap"
                  style={{
                    left: `${(activeTooltip.x / 660) * 100}%`,
                    top: `${(activeTooltip.y / 230) * 100}%`,
                    marginTop: "-12px",
                  }}
                >
                  <div>{activeTooltip.date}</div>
                  <div className="text-[#22d36b]">{formatNumber(activeTooltip.price)} UZS/L</div>
                </div>
              )}
            </div>
          </div>

          {/* Quality Grades Card */}
          <div
            className={`flex-[1_1_320px] rounded-3xl p-6 transition-all duration-300 border shadow-[0_10px_40px_rgba(20,80,60,0.08)] flex flex-col gap-4.5 ${
              isDark
                ? "bg-[#13293D]/75 border-white/10 backdrop-blur-md"
                : "bg-white/76 border-white backdrop-blur-md"
            }`}
          >
            <div>
              <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                {t.stats.qualityGrades}
              </div>
              <div className="text-[22px] font-bold mt-1 text-[#17352c] dark:text-white">
                {t.stats.todaysDeliveries}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 py-2">
                {[46, 31, 17, 6].map((p, i) => (
                  <div key={i} className="h-7 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {(data?.gradeDistribution || []).map((grade) => (
                  <div key={grade.grade}>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className={isDark ? "text-white" : "text-[#17352c]"}>
                        {grade.grade}
                      </span>
                      <span className="font-mono text-[#17352c] dark:text-[#E8F1F2]">
                        {grade.percentage}%
                      </span>
                    </div>
                    <div
                      className={`h-2.5 rounded-full overflow-hidden ${
                        isDark ? "bg-white/10" : "bg-[#e3efe9]"
                      }`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${grade.percentage}%`,
                          backgroundColor: isDark ? "#1B98E0" : "#12303a",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* 6. BOTTOM ROW (Regional Prices Card + Live Shipments Card) */}
        <div className="flex flex-wrap gap-5">
          
          {/* Regional Prices Card */}
          <div
            className={`flex-[1_1_420px] rounded-3xl p-6 transition-all duration-300 border shadow-[0_10px_40px_rgba(20,80,60,0.08)] flex flex-col gap-4 ${
              isDark
                ? "bg-[#13293D]/75 border-white/10 backdrop-blur-md"
                : "bg-white/76 border-white backdrop-blur-md"
            }`}
          >
            <div>
              <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                {t.stats.byRegion}
              </div>
              <div className="text-[22px] font-bold mt-1 text-[#17352c] dark:text-white">
                {t.stats.pricePerLiter}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 py-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-6 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                ))}
              </div>
            ) : data?.regionPrices.length === 0 ? (
              <div className="py-8 text-center text-sm opacity-60">
                {t.stats.noRegionalData}
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 pt-1">
                {(data?.regionPrices || []).map((rp) => (
                  <div key={rp.region} className="flex items-center gap-3">
                    <span
                      className={`w-[104px] text-sm font-semibold shrink-0 truncate ${
                        isDark ? "text-white" : "text-[#17352c]"
                      }`}
                    >
                      {rp.region}
                    </span>
                    <div
                      className={`flex-1 h-2 rounded-full overflow-hidden ${
                        isDark ? "bg-white/10" : "bg-[#e3efe9]"
                      }`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${rp.barWidthPct}%`,
                          backgroundColor: isDark ? "#1B98E0" : "#12303a",
                        }}
                      />
                    </div>
                    <span className="font-mono text-sm w-[52px] text-right shrink-0 font-bold text-[#17352c] dark:text-white">
                      {formatNumber(rp.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Shipments Card */}
          <div
            className={`flex-[1.4_1_520px] rounded-3xl p-6 transition-all duration-300 border shadow-[0_10px_40px_rgba(20,80,60,0.08)] ${
              isDark
                ? "bg-[#13293D]/75 border-white/10 backdrop-blur-md"
                : "bg-white/76 border-white backdrop-blur-md"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase">
                  {t.hero.cards.logistics}
                </div>
                <div className="text-[22px] font-bold mt-1 text-[#17352c] dark:text-white">
                  {t.stats.liveShipments}
                </div>
              </div>
              <a
                href="#stats"
                className="text-sm font-semibold text-[#087a3c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {t.stats.viewAll} &rarr;
              </a>
            </div>

            {loading ? (
              <div className="space-y-4 py-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                ))}
              </div>
            ) : data?.shipments.length === 0 ? (
              <div className="py-8 text-center text-sm opacity-60">
                {t.stats.noShipmentsData}
              </div>
            ) : (
              <div className="flex flex-col">
                {(data?.shipments || []).map((sh, idx) => (
                  <div
                    key={sh.id}
                    className={`flex flex-wrap items-center gap-3 py-3.5 ${
                      idx !== 0 ? "border-t border-[#17352c]/10 dark:border-white/10" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-bold text-sm text-[#17352c] dark:text-white">
                        {sh.route}
                      </div>
                      <div className="text-[13px] text-[#4d6a60] dark:text-[#E8F1F2]/65">
                        Batch {sh.batchId} &middot; {sh.telemetryStatus}
                      </div>
                    </div>

                    <span className="font-mono text-sm font-semibold text-[#17352c] dark:text-white">
                      {sh.temperature.toFixed(1)}&deg;C
                    </span>

                    <span className="text-[13px] text-[#4d6a60] dark:text-[#E8F1F2]/65 w-[80px]">
                      {sh.eta}
                    </span>

                    <div>
                      {sh.status === "in_transit" && (
                        <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2.5 py-1 whitespace-nowrap inline-flex items-center gap-1">
                          {sh.statusText}
                        </span>
                      )}
                      {sh.status === "titration_pending" && (
                        <span className="text-xs font-bold bg-[#fdf0d2] text-[#7a4b00] rounded-lg px-2.5 py-1 whitespace-nowrap inline-flex items-center gap-1">
                          {sh.statusText}
                        </span>
                      )}
                      {sh.status === "escrow_released" && (
                        <span className="text-xs font-bold bg-[#e6ecea] text-[#4d6a60] rounded-lg px-2.5 py-1 whitespace-nowrap inline-flex items-center gap-1">
                          {sh.statusText}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
