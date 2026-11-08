"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export interface PublicStatsData {
  successfulDeals: number;
  totalUsers: number;
  milkDeliveredLitres: number;
  avgRawMilkPrice: {
    value: number;
    currency: string;
    unit: string;
    date: string;
  };
  generatedAt: string;
}

interface LandingLiveStatisticsProps {
  initialData?: PublicStatsData | null;
  isDark?: boolean;
}

// Custom hook for animated count-up over ~800ms
function useCountUp(target: number, duration: number = 800): number {
  const [current, setCurrent] = useState<number>(target);
  const startRef = useRef<number>(target);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setCurrent(target);
        startRef.current = target;
        return;
      }
    }

    if (startRef.current === target) return;

    const fromVal = startRef.current;
    const toVal = target;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quadratic easing
      const easeProgress = progress * (2 - progress);
      const nextVal = Math.round(fromVal + (toVal - fromVal) * easeProgress);
      setCurrent(nextVal);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        startRef.current = toVal;
        setCurrent(toVal);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [target, duration]);

  return current;
}

export default function LandingLiveStatistics({
  initialData = null,
  isDark = false,
}: LandingLiveStatisticsProps) {
  const { locale, t } = useLanguage();

  const [stats, setStats] = useState<PublicStatsData | null>(initialData);
  const [lastSuccessTime, setLastSuccessTime] = useState<number>(Date.now());
  const [isStale, setIsStale] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const retryAttemptRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchTimeRef = useRef<number>(Date.now());

  // Formatting helpers per locale
  const formatWholeNumber = (num: number): string => {
    if (locale === "ru") {
      return num.toLocaleString("ru-RU").replace(/\u00A0/g, " ");
    }
    if (locale === "uz") {
      return num.toLocaleString("uz-UZ").replace(/,/g, " ");
    }
    return num.toLocaleString("en-US");
  };

  const formatMilkVolume = (litres: number) => {
    let compactNumber = "";
    let unitLabel = "L";

    if (litres >= 1_000_000) {
      const millions = (litres / 1_000_000).toFixed(1).replace(/\.0$/, "");
      if (locale === "ru") {
        compactNumber = `${millions} млн`;
        unitLabel = "л";
      } else if (locale === "uz") {
        compactNumber = `${millions} mln`;
        unitLabel = "L";
      } else {
        compactNumber = `${millions}M`;
        unitLabel = "L";
      }
    } else if (litres >= 1_000) {
      const thousands = (litres / 1_000).toFixed(1).replace(/\.0$/, "");
      if (locale === "ru") {
        compactNumber = `${thousands} тыс`;
        unitLabel = "л";
      } else if (locale === "uz") {
        compactNumber = `${thousands} ming`;
        unitLabel = "L";
      } else {
        compactNumber = `${thousands}K`;
        unitLabel = "L";
      }
    } else {
      compactNumber = formatWholeNumber(litres);
      unitLabel = locale === "ru" ? "л" : "L";
    }

    const fullText = `${formatWholeNumber(litres)} ${unitLabel}`;
    return { compactNumber, unitLabel, fullText };
  };

  // Fetch function with 8s abort timeout & exponential backoff
  const fetchStats = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 8000);

    try {
      const resp = await fetch("/api/v1/public/stats", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status}`);
      }

      const freshData: PublicStatsData = await resp.json();
      setStats(freshData);
      const now = Date.now();
      setLastSuccessTime(now);
      lastFetchTimeRef.current = now;
      setIsStale(false);
      setErrorNotice(null);
      retryAttemptRef.current = 0;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        console.warn("[LiveStats] Network request timed out after 8s");
      } else {
        console.warn("[LiveStats] Refresh error:", err);
      }

      // Check if data is more than 5 minutes old
      const timeSinceSuccess = Date.now() - lastSuccessTime;
      if (timeSinceSuccess > 300_000) {
        setIsStale(true);
      }

      // Exponential backoff retry (max 5 minutes)
      retryAttemptRef.current += 1;
      const backoffDelay = Math.min(
        300_000,
        Math.pow(2, Math.min(retryAttemptRef.current, 6)) * 2000
      );
      scheduleNextPoll(backoffDelay);
      return;
    }

    // Schedule regular 60s poll with ±5s jitter
    const jitter = Math.floor(Math.random() * 10000) - 5000;
    scheduleNextPoll(60000 + jitter);
  };

  const scheduleNextPoll = (delayMs: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (typeof document !== "undefined" && document.hidden) {
        // Paused while tab is hidden
        return;
      }
      fetchStats();
    }, delayMs);
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchStats();

    // Visibility API: Pause polling when hidden, refresh immediately when visible if > 60s old
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const elapsedSinceLast = Date.now() - lastFetchTimeRef.current;
        if (elapsedSinceLast >= 60000) {
          fetchStats();
        } else {
          scheduleNextPoll(60000 - elapsedSinceLast);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Format last updated timestamp
  const lastUpdatedFormatted = new Date(lastSuccessTime).toLocaleTimeString(
    locale === "ru" ? "ru-RU" : locale === "uz" ? "uz-UZ" : "en-US",
    { hour: "2-digit", minute: "2-digit" }
  );

  // Animated values
  const animatedDeals = useCountUp(stats?.successfulDeals ?? 0);
  const animatedUsers = useCountUp(stats?.totalUsers ?? 0);
  const animatedMilk = useCountUp(stats?.milkDeliveredLitres ?? 0);
  const animatedPrice = useCountUp(stats?.avgRawMilkPrice.value ?? 0);

  const milkDisplay = formatMilkVolume(animatedMilk);

  return (
    <div
      className={`min-h-[640px] flex items-center transition-colors duration-300 ${
        isDark
          ? "bg-[linear-gradient(160deg,#0a1b24_0%,#052331_100%)] text-[#E8F1F2]"
          : "bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c]"
      }`}
    >
      <section
        id="stats"
        aria-labelledby="live-stats-heading"
        className="max-w-[1180px] mx-auto py-20 px-6 flex flex-wrap items-center gap-14 w-full box-border"
      >
        {/* Left Column: Heading, Subtitle, CTA */}
        <div className="flex-1 basis-[360px] max-w-full">
          <h2
            id="live-stats-heading"
            className="text-[34px] sm:text-[42px] leading-[1.15] font-extrabold tracking-[-0.03em] mb-4"
          >
            {t.liveStats.headingStart}
            <span className="text-[#087a3c] dark:text-[#22d36b]">
              {t.liveStats.headingAccent}
            </span>
          </h2>

          <p className="text-base sm:text-lg leading-[1.6] text-[#4d6a60] dark:text-slate-300 max-w-[420px] mb-8">
            {t.liveStats.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              href="/stats"
              className="inline-flex items-center justify-center bg-[#12303a] hover:bg-[#1a4250] dark:bg-[#1B98E0] dark:hover:bg-white text-white dark:text-[#13293D] rounded-full px-7 min-h-[52px] font-bold text-base transition-all duration-200 shadow-md active:scale-95 focus-visible:outline-2 focus-visible:outline-[#22d36b] focus-visible:outline-offset-2"
            >
              <span>{t.liveStats.cta}</span>
            </Link>

            {/* Muted last-updated indicator if older than 5 minutes */}
            {isStale && stats && (
              <span className="text-xs text-[#4d6a60]/80 dark:text-slate-400 font-mono">
                {t.liveStats.lastUpdated}: {lastUpdatedFormatted}
              </span>
            )}
          </div>

          {/* Graceful empty/failure fallback announcement */}
          {!stats && (
            <p
              role="alert"
              className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3.5 py-1.5 rounded-full mt-4 inline-block font-medium"
            >
              {t.liveStats.temporarilyUnavailable}
            </p>
          )}
        </div>

        {/* Right Column: 2x2 Glass Cards Grid */}
        <div className="flex-[1.2] basis-[480px] max-w-full">
          <ul
            role="list"
            className="grid grid-cols-2 gap-3 sm:gap-5 list-none p-0 m-0"
          >
            {/* Card 1: Successful Deals */}
            <li className="bg-white/76 dark:bg-[#101E27]/80 backdrop-blur-md border border-white dark:border-white/10 rounded-[28px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] py-8 px-4 sm:py-12 sm:px-5 text-center transition-transform hover:-translate-y-1 duration-200 box-border flex flex-col justify-center">
              <div>
                <span className="font-mono font-bold text-[clamp(26px,4vw,52px)] leading-none tracking-[-0.02em] text-[#17352c] dark:text-[#E8F1F2]">
                  {stats ? formatWholeNumber(animatedDeals) : "—"}
                </span>
              </div>
              <div className="mt-3 sm:mt-4 text-xs sm:text-base text-[#4d6a60] dark:text-slate-300 font-medium">
                {t.liveStats.successfulDeals}
              </div>
            </li>

            {/* Card 2: Platform Users */}
            <li className="bg-white/76 dark:bg-[#101E27]/80 backdrop-blur-md border border-white dark:border-white/10 rounded-[28px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] py-8 px-4 sm:py-12 sm:px-5 text-center transition-transform hover:-translate-y-1 duration-200 box-border flex flex-col justify-center">
              <div>
                <span className="font-mono font-bold text-[clamp(26px,4vw,52px)] leading-none tracking-[-0.02em] text-[#17352c] dark:text-[#E8F1F2]">
                  {stats ? formatWholeNumber(animatedUsers) : "—"}
                </span>
              </div>
              <div className="mt-3 sm:mt-4 text-xs sm:text-base text-[#4d6a60] dark:text-slate-300 font-medium">
                {t.liveStats.platformUsers}
              </div>
            </li>

            {/* Card 3: Milk Traded & Delivered */}
            <li
              className="bg-white/76 dark:bg-[#101E27]/80 backdrop-blur-md border border-white dark:border-white/10 rounded-[28px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] py-8 px-4 sm:py-12 sm:px-5 text-center transition-transform hover:-translate-y-1 duration-200 box-border flex flex-col justify-center"
              title={stats ? milkDisplay.fullText : undefined}
            >
              <div>
                {stats ? (
                  <>
                    <span className="font-mono font-bold text-[clamp(26px,4vw,52px)] leading-none tracking-[-0.02em] text-[#17352c] dark:text-[#E8F1F2]">
                      {milkDisplay.compactNumber}
                    </span>
                    <span className="font-mono font-bold text-lg sm:text-[22px] text-[#12a150] dark:text-[#22d36b] ml-1.5">
                      {milkDisplay.unitLabel}
                    </span>
                    <span className="sr-only">
                      {milkDisplay.fullText}
                    </span>
                  </>
                ) : (
                  <span className="font-mono font-bold text-[clamp(26px,4vw,52px)] leading-none tracking-[-0.02em] text-[#17352c] dark:text-[#E8F1F2]">
                    —
                  </span>
                )}
              </div>
              <div className="mt-3 sm:mt-4 text-xs sm:text-base text-[#4d6a60] dark:text-slate-300 font-medium">
                {t.liveStats.milkTradedDelivered}
              </div>
            </li>

            {/* Card 4: Daily Average Raw Milk Price */}
            <li
              className="bg-white/76 dark:bg-[#101E27]/80 backdrop-blur-md border border-white dark:border-white/10 rounded-[28px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] py-8 px-4 sm:py-12 sm:px-5 text-center transition-transform hover:-translate-y-1 duration-200 box-border flex flex-col justify-center"
              title={stats && stats.avgRawMilkPrice.value > 0 ? `${t.liveStats.dailyAvgPrice} (${stats.avgRawMilkPrice.date})` : undefined}
            >
              <div>
                {stats && stats.avgRawMilkPrice.value > 0 ? (
                  <>
                    <span className="font-mono font-bold text-[clamp(26px,4vw,52px)] leading-none tracking-[-0.02em] text-[#17352c] dark:text-[#E8F1F2]">
                      {formatWholeNumber(animatedPrice)}
                    </span>
                    <span className="font-mono font-bold text-base sm:text-[20px] text-[#12a150] dark:text-[#22d36b] ml-1.5">
                      UZS/L
                    </span>
                    <span className="sr-only">
                      {formatWholeNumber(animatedPrice)} UZS per litre ({stats.avgRawMilkPrice.date})
                    </span>
                  </>
                ) : (
                  <span className="font-mono font-bold text-[clamp(26px,4vw,52px)] leading-none tracking-[-0.02em] text-[#17352c] dark:text-[#E8F1F2]">
                    —
                  </span>
                )}
              </div>
              <div className="mt-3 sm:mt-4 text-xs sm:text-base text-[#4d6a60] dark:text-slate-300 font-medium">
                {t.liveStats.dailyAvgPrice}
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
