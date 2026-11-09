"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import {
  DriverDashboardData,
  fetchDriverDashboardData,
} from "@/lib/roleDashboardService";
import {
  flushDriverOfflineQueue,
  getQueuedDriverEvents,
} from "@/lib/offlineDriverQueue";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, ThemeToggleButton } from "@/context/ThemeContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { resolveUserAvatar } from "@/lib/userAvatar";

type DriverWindow = "overview" | "trips" | "pickup" | "dispatch" | "telemetry" | "issues" | "history" | "settings";

const DRIVER_I18N = {
  uz: {
    badge: "Sovuq Zanjir Logistika",
    subtitle: "SUT TANKERI HAYDOVCHISI TELEMETRIYASI",
    welcome: "Xush kelibsiz",
    desc: "Sovuq zanjir monitoringi (+4°C) • Avtonom GPS marshrut va qabul qilish",
    activeTrips: "Bugungi qatnovlar",
    tankTemp: "Tanker harorati",
    deliveredMilk: "Yetkazilgan sut hajmi",
    earnings: "Haydovchi daromadi",
    waypointsTitle: "Marshrut va To'xtash Nuqtalari",
    gaugeTitle: "Sovuq Zanjir Nazorati",
    velocityTitle: "Reyslar Dinamikasi",
    newPickupBtn: "Sutni qabul qilish",
    sosBtn: "Favqulodda SOS",
    advisorTitle: "Sovuq Zanjir Kafolati",
    advisorDesc: "Sut harorati +4°C dan oshmasligi kafolatlangan va IoT datchiklar bilan nazorat qilinadi.",
  },
  ru: {
    badge: "Холодовая Цепь Логистика",
    subtitle: "ТЕЛЕМЕТРИЯ ВОДИТЕЛЯ МОЛОКОВОЗА",
    welcome: "Добро пожаловать",
    desc: "Мониторинг холодовой цепи (+4°C) • Автономный GPS маршрут и приемка",
    activeTrips: "Рейсы за сегодня",
    tankTemp: "Температура цистерны",
    deliveredMilk: "Доставлено молока",
    earnings: "Доход водителя",
    waypointsTitle: "Маршрут и точки сбора",
    gaugeTitle: "Контроль холодовой цепи",
    velocityTitle: "Динамика рейсов",
    newPickupBtn: "Принять молоко",
    sosBtn: "Экстренный SOS",
    advisorTitle: "Гарантия холода",
    advisorDesc: "Температура молока поддерживается строго ниже +4°C с непрерывным IoT контролем.",
  },
  en: {
    badge: "Cold-Chain Logistics",
    subtitle: "MILK TANKER FLEET TELEMETRY",
    welcome: "Welcome",
    desc: "Cold chain telemetry (+4°C) • Offline GPS navigation & milk gate intake",
    activeTrips: "Trips Today",
    tankTemp: "Tanker Temperature",
    deliveredMilk: "Delivered Milk",
    earnings: "Driver Earnings",
    waypointsTitle: "Route Waypoints & Stops",
    gaugeTitle: "Cold Chain Integrity",
    velocityTitle: "Trip Velocity",
    newPickupBtn: "Log Milk Intake",
    sosBtn: "Emergency SOS",
    advisorTitle: "Cold Chain Integrity",
    advisorDesc: "Milk temperature is continuously preserved below +4°C with certified IoT sensors.",
  },
};

export default function DriverOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<DriverDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeWindow, setActiveWindow] = useState<DriverWindow>("overview");
  const [timeRange, setTimeRange] = useState<"1d" | "1w" | "1m" | "6m" | "1y" | "all">("1w");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [searchQuery, setSearchQuery] = useState("");
  const [queuedOfflineCount, setQueuedOfflineCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isFlushing, setIsFlushing] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Modals
  const [showPickupModal, setShowPickupModal] = useState<boolean>(false);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [pickupFormSuccess, setPickupFormSuccess] = useState<boolean>(false);

  const { locale, setLocale } = useLanguage();
  const { themeMode, isDark } = useTheme();
  const dt = DRIVER_I18N[locale] || DRIVER_I18N.uz;

  useEffect(() => {
    setSession(getStoredSession());
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      setQueuedOfflineCount(getQueuedDriverEvents().length);
      const handleOnline = async () => {
        setIsOnline(true);
        const res = await flushDriverOfflineQueue();
        setQueuedOfflineCount(res.remainingCount);
      };
      const handleOffline = () => {
        setIsOnline(false);
        setQueuedOfflineCount(getQueuedDriverEvents().length);
      };
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      flushDriverOfflineQueue().then((r) => setQueuedOfflineCount(r.remainingCount));
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const result = await fetchDriverDashboardData();
        if (isMounted) setData(result);
      } catch {
        // Fallback handled
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const handleManualFlush = async () => {
    setIsFlushing(true);
    try {
      const res = await flushDriverOfflineQueue();
      setQueuedOfflineCount(res.remainingCount);
      setBannerNotice("Oflayn navbat server bilan to'liq sinxronlashtirildi.");
    } finally {
      setIsFlushing(false);
    }
  };

  const handlePickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPickupFormSuccess(true);
    setTimeout(() => {
      setPickupFormSuccess(false);
      setShowPickupModal(false);
      setBannerNotice("Sut partiyasi muvaffaqiyatli qabul qilindi va qabul cheki yaratildi.");
    }, 1200);
  };

  const driverName = session?.user?.fullName || "Bobur Temirov";

  // Chart datasets
  const chartDatasets = useMemo(() => {
    switch (timeRange) {
      case "1d":
        return {
          points: [
            { label: "07:00", val: 800 },
            { label: "09:00", val: 2400 },
            { label: "11:00", val: 3600 },
            { label: "13:00", val: 5200 },
            { label: "15:00", val: 6800 },
            { label: "17:00", val: 8400 },
          ],
          total: "8,400 Litr",
          delta: "+3 qatnov bugun",
        };
      case "1m":
        return {
          points: [
            { label: "1 May", val: 12000 },
            { label: "7 May", val: 18500 },
            { label: "14 May", val: 24000 },
            { label: "21 May", val: 32000 },
            { label: "28 May", val: 41500 },
            { label: "31 May", val: 49800 },
          ],
          total: "49,800 Litr",
          delta: "+18.2% bu oy",
        };
      case "6m":
      case "1y":
      case "all":
        return {
          points: [
            { label: "Dek", val: 32000 },
            { label: "Yan", val: 38000 },
            { label: "Fev", val: 42000 },
            { label: "Mar", val: 47000 },
            { label: "Apr", val: 51000 },
            { label: "May", val: 56400 },
          ],
          total: "266,400 Litr",
          delta: "+42.5% jami hajm",
        };
      case "1w":
      default:
        return {
          points: [
            { label: "Dush", val: 4800 },
            { label: "Sesh", val: 6200 },
            { label: "Chor", val: 5900 },
            { label: "Pay", val: 7800 },
            { label: "Jum", val: 6900 },
            { label: "Shan", val: 8400 },
            { label: "Yak", val: 8800 },
          ],
          total: "14,800 Litr",
          delta: "+12.4% bu hafta",
        };
    }
  }, [timeRange]);

  // Navigation Items
  const navigationItems: { key: DriverWindow; label: string; icon: React.ReactNode }[] = [
    {
      key: "overview",
      label: "Logistika Paneli",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      key: "trips",
      label: "Mening Reyslarim",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      key: "pickup",
      label: "Sut Qabul Qilish",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "dispatch",
      label: "Jonli GPS Marshrut",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: "telemetry",
      label: "Sovuq Zanjir Telemetriya",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      key: "issues",
      label: "Nosozlik & Hodisalar",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      key: "history",
      label: "Yetkazib Berish Tarixi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "settings",
      label: "Avtomobil & Oflayn",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`min-h-screen py-4 px-3 sm:px-6 relative overflow-x-hidden font-sans antialiased transition-colors duration-300 ${
      isDark ? "bg-[#0b0f14] text-white" : "bg-[#f1f5f9] text-slate-900"
    }`}>
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] pointer-events-none -z-0 opacity-20 blur-[140px] bg-gradient-to-br from-emerald-500 to-amber-400" />

      {/* Master Container: Fixed Left Sidebar + Dynamic In-Place Content Area (Investure Architecture) */}
      <div className={`relative z-10 max-w-[1520px] mx-auto rounded-[32px] border shadow-2xl flex flex-col lg:flex-row overflow-hidden transition-all ${
        isDark
          ? "bg-[#121820] border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.6)] text-white"
          : "bg-white border-slate-200 shadow-[0_20px_70px_rgba(15,23,42,0.06)] text-slate-900"
      }`}>

        {/* =========================================================================
            LEFT NAVIGATION SIDEBAR (Exact Investure Layout)
        ========================================================================= */}
        <aside className={`w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r p-6 flex flex-col justify-between transition-colors ${
          isDark ? "border-white/10 bg-[#0e1319]" : "border-slate-100 bg-[#fafcff]"
        }`}>
          <div>
            {/* 1. Brand Logo */}
            <div className="flex items-center justify-between pb-8">
              <Link href="/" className="flex items-center gap-2 transition hover:scale-105">
                <ZaminFlowLogo mode={themeMode} size="md" />
              </Link>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-800"
              }`}>
                {dt.badge}
              </span>
            </div>

            {/* 2. Navigation Items with Right Emerald Indicator Line */}
            <nav className="space-y-1.5" role="tablist">
              {navigationItems.map((item) => {
                const isActive = activeWindow === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveWindow(item.key)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all relative group cursor-pointer ${
                      isActive
                        ? isDark
                          ? "bg-white/[0.08] text-white"
                          : "bg-slate-100 text-slate-900 shadow-xs"
                        : isDark
                        ? "text-white/60 hover:text-white hover:bg-white/[0.03]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`transition-colors ${
                        isActive
                          ? "text-emerald-500"
                          : isDark ? "text-white/40 group-hover:text-white/70" : "text-slate-400 group-hover:text-slate-600"
                      }`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {/* Active vertical right indicator line */}
                    {isActive && (
                      <span className="w-1.5 h-5 rounded-full bg-emerald-500 absolute right-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card: Cold Chain Safety & Driver Card */}
          <div className="pt-6 space-y-4">
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              isDark
                ? "bg-gradient-to-b from-white/[0.04] to-transparent border-white/10"
                : "bg-gradient-to-b from-emerald-50/50 to-amber-50/20 border-emerald-100"
            }`}>
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xs font-bold">{dt.advisorTitle}</h4>
              <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
                {dt.advisorDesc}
              </p>
              <button
                type="button"
                onClick={() => setShowSosModal(true)}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                {dt.sosBtn}
              </button>
            </div>

            {/* User Profile Pill */}
            <div className={`flex items-center justify-between p-2.5 rounded-2xl border ${
              isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/80"
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={resolveUserAvatar(driverName, session?.user?.email) || "/images/team-akrom.webp"}
                  alt="Driver"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-500/40"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{driverName}</p>
                  <p className={`text-[10px] truncate ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    Tanker #01 A 777 ZF
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                title="Chiqish"
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isDark ? "text-white/40 hover:text-rose-400 hover:bg-white/5" : "text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            RIGHT MAIN WORKSPACE (In-Place Dynamic Window Renderer)
        ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Dynamic Header */}
          <header className={`px-6 sm:px-8 py-5 border-b flex flex-wrap items-center justify-between gap-4 transition-colors ${
            isDark ? "border-white/10 bg-[#121820]" : "border-slate-100 bg-white"
          }`}>
            <div>
              <h1 className="text-xl sm:text-2xl font-black capitalize tracking-tight flex items-center gap-2.5">
                <span>
                  {navigationItems.find((n) => n.key === activeWindow)?.label || "Dashboard"}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              </h1>
              <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-slate-400"}`}>
                Sovutilgan Sut Tashuvchi Avtoparki • IoT Datchiklar va Oflayn Kesh
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Online / Offline Status Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                isOnline
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500 animate-ping"}`} />
                <span>{isOnline ? "Onlayn" : "Oflayn rejim"}</span>
                {queuedOfflineCount > 0 && (
                  <button
                    onClick={handleManualFlush}
                    disabled={isFlushing || !isOnline}
                    className="ml-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] hover:bg-emerald-500 cursor-pointer"
                  >
                    {isFlushing ? "..." : `Kesh (${queuedOfflineCount})`}
                  </button>
                )}
              </div>

              {/* Quick Search */}
              <div className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs transition ${
                isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Ferma / Reys ID / INN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-32 lg:w-44"
                />
                <kbd className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  isDark ? "bg-white/10 border-white/10 text-white/40" : "bg-white border-slate-200 text-slate-400"
                }`}>
                  ⌘K
                </kbd>
              </div>

              {/* Language Switcher */}
              <div className={`flex items-center p-0.5 rounded-xl border text-[11px] font-bold ${
                isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-slate-100 border-slate-200 text-slate-600"
              }`}>
                {(["uz", "ru", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLocale(lang)}
                    className={`px-2 py-1 rounded-lg uppercase transition cursor-pointer ${
                      locale === lang
                        ? isDark ? "bg-white/20 text-white" : "bg-white text-slate-900 shadow-xs"
                        : "hover:text-emerald-500"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Single Theme Toggle Button */}
              <ThemeToggleButton />

              {/* Primary Action Button: Log Milk Intake */}
              <button
                type="button"
                onClick={() => setShowPickupModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md hover:shadow-emerald-500/25 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{dt.newPickupBtn}</span>
              </button>
            </div>
          </header>

          {/* Alert Banner */}
          {bannerNotice && (
            <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{bannerNotice}</span>
              </div>
              <button onClick={() => setBannerNotice(null)} className="opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Window View Switcher Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* =========================================================================
                WINDOW 1: OVERVIEW (Investure Logistics Layout)
            ========================================================================= */}
            {activeWindow === "overview" && (
              <div className="space-y-8 animate-fadeIn">
                {/* 1. HERO FINANCIAL / DELIVERY VOLUME CHART */}
                <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                  isDark
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-slate-50/60 border-slate-200 shadow-xs"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {dt.deliveredMilk}
                      </p>
                      <div className="flex items-baseline gap-3 mt-1">
                        <span className="text-2xl sm:text-3xl font-black tracking-tight">
                          {data ? `${data.completedThisWeek.value} Litr` : chartDatasets.total}
                        </span>
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          {chartDatasets.delta}
                        </span>
                      </div>
                    </div>

                    {/* Chart Controls */}
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center p-1 rounded-xl border ${
                        isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                      }`}>
                        <button
                          type="button"
                          onClick={() => setChartType("line")}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            chartType === "line"
                              ? isDark ? "bg-white/15 text-white" : "bg-slate-100 text-slate-900"
                              : isDark ? "text-white/40" : "text-slate-400"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartType("bar")}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            chartType === "bar"
                              ? isDark ? "bg-white/15 text-white" : "bg-slate-100 text-slate-900"
                              : isDark ? "text-white/40" : "text-slate-400"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                      </div>

                      {/* Time Range Selector */}
                      <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
                        isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-white border-slate-200 text-slate-500"
                      }`}>
                        {(["1d", "1w", "1m", "6m", "1y", "all"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setTimeRange(r)}
                            className={`px-2.5 py-1 rounded-lg uppercase transition cursor-pointer ${
                              timeRange === r
                                ? isDark ? "bg-white/20 text-white" : "bg-slate-100 text-slate-900 shadow-xs"
                                : "hover:text-emerald-500"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive SVG Chart */}
                  <div className="relative h-56 sm:h-64 w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="driverEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <line x1="0" y1="40" x2="700" y2="40" stroke="currentColor" strokeOpacity={isDark ? "0.08" : "0.06"} strokeDasharray="4 4" />
                      <line x1="0" y1="90" x2="700" y2="90" stroke="currentColor" strokeOpacity={isDark ? "0.08" : "0.06"} strokeDasharray="4 4" />
                      <line x1="0" y1="140" x2="700" y2="140" stroke="currentColor" strokeOpacity={isDark ? "0.08" : "0.06"} strokeDasharray="4 4" />

                      {chartType === "line" ? (
                        <>
                          <path
                            d="M 20 150 Q 140 120, 220 130 T 400 65 T 530 80 T 680 25 L 680 190 L 20 190 Z"
                            fill="url(#driverEmeraldGrad)"
                          />
                          <path
                            d="M 20 150 Q 140 120, 220 130 T 400 65 T 530 80 T 680 25"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          <circle cx="400" cy="65" r="5" fill="#10b981" />
                          <circle cx="680" cy="25" r="6" fill="#10b981" className="animate-pulse" />
                        </>
                      ) : (
                        <g>
                          {chartDatasets.points.map((pt, i) => {
                            const x = 50 + i * 95;
                            const h = 30 + (pt.val / 10000) * 120;
                            return (
                              <g key={i}>
                                <rect
                                  x={x - 14}
                                  y={180 - Math.min(h, 150)}
                                  width="28"
                                  height={Math.min(h, 150)}
                                  rx="6"
                                  fill="#10b981"
                                  fillOpacity={i === chartDatasets.points.length - 1 ? "1" : "0.6"}
                                />
                              </g>
                            );
                          })}
                        </g>
                      )}
                    </svg>

                    <div className="flex justify-between items-center text-[11px] font-semibold pt-3 px-1 text-slate-400">
                      {chartDatasets.points.map((p, i) => (
                        <span key={i}>{p.label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. FOUR BENTO METRIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Trips Today */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {dt.activeTrips}
                      </p>
                      <h3 className="text-xl font-black mt-1">
                        {data ? `${data.todayTrips.value} ${data.todayTrips.unit}` : "2 / 3 Reys"}
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                        <span>1 ta faol</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>tranzitda</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 2: Cryogenic Tank Temperature */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {dt.tankTemp}
                      </p>
                      <h3 className="text-xl font-black mt-1 text-sky-500">
                        {data?.coldChain ? `${data.coldChain.temp}` : "+3.4°C"}
                      </h3>
                      <p className="text-[11px] font-bold text-sky-500 mt-0.5 flex items-center gap-1">
                        <span>Optimal</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>chegara: &lt;4°C</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 3: Delivered Volume */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {dt.deliveredMilk}
                      </p>
                      <h3 className="text-xl font-black mt-1">
                        {data ? `${data.completedThisWeek.value} ${data.completedThisWeek.unit}` : "8,400 L"}
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                        <span>↑ 14%</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>oʻtgan kunga nisbatan</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 4: Driver Earnings */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {dt.earnings}
                      </p>
                      <h3 className="text-xl font-black mt-1 text-emerald-500">
                        960,000 UZS
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                        <span>120 UZS/L</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>transport tarifi</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 3. THREE-COLUMN BOTTOM BENTO (Investure Exact Match) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Col 1: Waypoints & Live Stop List */}
                  <div className={`p-6 rounded-3xl border transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between pb-4 border-b border-inherit">
                      <div>
                        <h4 className="text-sm font-black">{dt.waypointsTitle}</h4>
                        <p className={`text-[11px] ${isDark ? "text-white/40" : "text-slate-400"}`}>
                          Bugungi faol marshrut nuqtalari
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveWindow("trips")}
                        className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                      >
                        Barchasi →
                      </button>
                    </div>

                    <div className="mt-4 space-y-4">
                      {[
                        { title: "Oqdaryo Fermasi #12", desc: "1,200L Xom sut yuklandi • Harorat: 3.4°C", time: "08:30", done: true },
                        { title: "Tranzit Nazorat Punkti (M39)", desc: "Sovuq zanjir telemetriya nazorati • 3.2°C", time: "09:15", done: true },
                        { title: "Samarqand Sut Zavodi #4", desc: "Qabul qilish bunkeri • Laboratoriya testi", time: "10:30", done: false },
                      ].map((wp, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-black ${
                            wp.done
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 dark:bg-white/10 text-slate-500"
                          }`}>
                            {wp.done ? "✓" : i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold truncate">{wp.title}</h5>
                              <span className={`text-[10px] font-mono ${isDark ? "text-white/40" : "text-slate-400"}`}>{wp.time}</span>
                            </div>
                            <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? "text-white/50" : "text-slate-500"}`}>{wp.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Col 2: Semi-Circle Radial Gauge (Cold Chain Temperature Integrity) */}
                  <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="w-full flex items-center justify-between pb-2">
                      <h4 className="text-sm font-black">{dt.gaugeTitle}</h4>
                      <span className="text-xs font-bold text-emerald-500">Standart: +4°C</span>
                    </div>

                    <div className="relative w-48 h-28 my-auto flex items-end justify-center">
                      <svg className="w-48 h-28 overflow-visible" viewBox="0 0 200 110">
                        <path
                          d="M 20 100 A 80 80 0 0 1 180 100"
                          fill="none"
                          stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
                          strokeWidth="16"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 20 100 A 80 80 0 0 1 170 85"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="16"
                          strokeLinecap="round"
                          strokeDasharray="250"
                          strokeDashoffset="25"
                        />
                      </svg>
                      <div className="absolute bottom-0 flex flex-col items-center">
                        <span className="text-2xl font-black text-sky-500">+3.4°C</span>
                        <span className={`text-[10px] font-semibold ${isDark ? "text-white/40" : "text-slate-400"}`}>
                          Tanker ichi harorati
                        </span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 text-center pt-3 border-t border-inherit">
                      <div>
                        <p className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}>Termo-izolyatsiya</p>
                        <p className="text-xs font-bold text-emerald-500">99.8% Saqlangan</p>
                      </div>
                      <div>
                        <p className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}>Agregat holati</p>
                        <p className="text-xs font-bold">Faol Sovutish</p>
                      </div>
                    </div>
                  </div>

                  {/* Col 3: Dual Comparison Bar Chart (Daily Deliveries Velocity) */}
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between pb-3">
                      <div>
                        <h4 className="text-sm font-black">{dt.velocityTitle}</h4>
                        <p className={`text-[11px] ${isDark ? "text-white/40" : "text-slate-400"}`}>Haftalik qatnovlar soni</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">18 qatnov/hafta</span>
                    </div>

                    <div className="h-36 flex items-end justify-between gap-3 pt-4 px-2">
                      {[
                        { day: "Du", h1: "45%", h2: "60%" },
                        { day: "Se", h1: "70%", h2: "80%" },
                        { day: "Ch", h1: "55%", h2: "65%" },
                        { day: "Pa", h1: "95%", h2: "100%" },
                        { day: "Ju", h1: "65%", h2: "75%" },
                        { day: "Sh", h1: "80%", h2: "90%" },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full flex items-end justify-center gap-1 h-28">
                            <div
                              style={{ height: bar.h1 }}
                              className="w-2 rounded-t-sm bg-slate-300 dark:bg-white/20 transition-all"
                            />
                            <div
                              style={{ height: bar.h2 }}
                              className="w-2 rounded-t-sm bg-emerald-500 transition-all"
                            />
                          </div>
                          <span className={`text-[10px] font-bold ${isDark ? "text-white/40" : "text-slate-400"}`}>
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-3 text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" /> O'tgan hafta
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Joriy hafta
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 2: MY TRIPS (Active Runs and Destinations)
            ========================================================================= */}
            {activeWindow === "trips" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">Mening Reyslarim va Marshrut Jadvali</h3>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                      Tayinlangan fermalardan sut yig'ish va zavodga yetkazib berish ro'yxati
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPickupModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer"
                  >
                    + Yangi Reys Boshlash
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { id: "REYS-902", from: "Oqdaryo Kooperativi", to: "Samarqand Sut Zavodi", lit: "4,200 L", temp: "3.4°C", status: "TRANZITDA", time: "10:30 da yetib boradi" },
                    { id: "REYS-901", from: "Pastdarg'om Agro Ferma", to: "Maroqand Sut LLC", lit: "3,100 L", temp: "3.8°C", status: "YETKAZILDI", time: "Bugun 08:15" },
                    { id: "REYS-900", from: "Ishtixon Chorva MCHJ", to: "Samarqand Sut Zavodi", lit: "5,400 L", temp: "3.1°C", status: "YETKAZILDI", time: "Kecha 17:40" },
                  ].map((trip, idx) => (
                    <div key={idx} className={`p-5 rounded-3xl border transition-all ${
                      isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                    }`}>
                      <div className="flex items-center justify-between pb-3 border-b border-inherit">
                        <span className="font-mono font-bold text-xs text-emerald-500">{trip.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trip.status === "TRANZITDA"
                            ? "bg-sky-500/10 text-sky-600 border border-sky-500/30 animate-pulse"
                            : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                      <div className="py-3 space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px]">Qayerdan:</span>
                          <p className="font-bold">{trip.from}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">Qayerga:</span>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{trip.to}</p>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-inherit">
                          <span>Hajm: <strong>{trip.lit}</strong></span>
                          <span>Harorat: <strong className="text-sky-500">{trip.temp}</strong></span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveWindow("dispatch")}
                        className="w-full mt-2 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-600 hover:text-white text-xs font-bold transition cursor-pointer"
                      >
                        Marshrutni xaritada kuzatish →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 3: MILK PICKUP (Intake Scanner & Receipt)
            ========================================================================= */}
            {activeWindow === "pickup" && (
              <div className="space-y-6 max-w-2xl animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Ferma Darvozasida Sut Qabul Qilish</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Laboratoriya ko'rsatkichlarini kiritish va fermerga raqamli qabul dalolatnomasini berish
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <form onSubmit={handlePickupSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Fermer / Kooperativ STIR yoki ID</label>
                      <input
                        type="text"
                        required
                        placeholder="308192849 (Oqdaryo Chorva Fayz)"
                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Qabul Hajmi (Litr)</label>
                        <input
                          type="number"
                          required
                          placeholder="1500"
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Qabul Harorati (°C)</label>
                        <input
                          type="text"
                          required
                          placeholder="3.4"
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Yog'lilik darajasi (%)</label>
                        <input
                          type="text"
                          required
                          placeholder="3.8"
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Zichlik (kg/m³)</label>
                        <input
                          type="text"
                          required
                          placeholder="1.028"
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={pickupFormSuccess}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer transition"
                    >
                      {pickupFormSuccess ? "Qabul qilindi va imzolandi ✓" : "Sutni rasmiylashtirish va imzolash"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 4: DISPATCH (Live GPS Navigation & Map)
            ========================================================================= */}
            {activeWindow === "dispatch" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Jonli GPS Marshrut va Navigatsiya</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    M39 magistral tranzit yo'lagi va sovuq zanjir geolokatsiya nazorati
                  </p>
                </div>

                <div className={`p-8 rounded-3xl border text-center space-y-4 ${
                  isDark ? "border-white/10 bg-[#090d12]" : "border-slate-200 bg-slate-50 shadow-xs"
                }`}>
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold">Faol GPS Koordinata: 39.6542° N, 66.9597° E</h4>
                    <p className={`text-xs mt-1 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                      Tezlik: 62 km/soat • Samarqand Sut Zavodiga yetib borish: 24 daqiqa
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setBannerNotice("Yandex Navigator / Waze ochilmoqda...")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer"
                    >
                      Navigatorda ochish (Yandex / Google)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 5: TELEMETRY (IoT Sensor Telemetry)
            ========================================================================= */}
            {activeWindow === "telemetry" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">IoT Sovuq Zanjir Telemetriyasi</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Tanker ichidagi 4 ta harorat datchigi va sovutish kompressori quvvati
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Datchik #1 (Old Boshqaruv)", val: "+3.2°C", stat: "Optimal" },
                    { title: "Datchik #2 (Markaziy Bunkyer)", val: "+3.4°C", stat: "Optimal" },
                    { title: "Datchik #3 (Orqa Klapan)", val: "+3.6°C", stat: "Optimal" },
                    { title: "Kompressor Quvvati", val: "100%", stat: "Faol sovutish" },
                  ].map((item, i) => (
                    <div key={i} className={`p-5 rounded-3xl border ${
                      isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                    }`}>
                      <p className="text-xs text-slate-400">{item.title}</p>
                      <h4 className="text-2xl font-black text-sky-500 mt-1">{item.val}</h4>
                      <p className="text-[11px] text-emerald-500 font-bold mt-1">{item.stat}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 6: ISSUES (Report Issue / SOS)
            ========================================================================= */}
            {activeWindow === "issues" && (
              <div className="space-y-6 max-w-2xl animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Nosozlik & Favqulodda Hodisalar</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Texnik nosozlik, sovutish agregati to'xtashi yoki yo'l-transport hodisasini qayd etish
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 ${
                  isDark ? "" : "shadow-xs"
                }`}>
                  <h4 className="text-sm font-black text-rose-500 mb-2">Tezkor SOS Xabarnomasi</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Ushbu tugma bosilganda zudlik bilan eng yaqin zaxira tanker va dispecherlik markaziga signal yuboriladi.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSosModal(true)}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg cursor-pointer transition"
                  >
                    Favqulodda SOS Signali Yuborish
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 7: HISTORY (Trip Archive)
            ========================================================================= */}
            {activeWindow === "history" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Yetkazib Berish Tarixi</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Barcha yakunlangan reyslar va zavod tomonidan imzolangan qabul dalolatnomalari
                  </p>
                </div>

                <div className={`rounded-3xl border overflow-hidden ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${
                      isDark ? "border-white/10 bg-white/[0.03] text-white/50" : "border-slate-100 bg-slate-50 text-slate-400"
                    }`}>
                      <tr>
                        <th className="px-5 py-3.5">Reys ID</th>
                        <th className="px-5 py-3.5">Sana</th>
                        <th className="px-5 py-3.5">Marshrut</th>
                        <th className="px-5 py-3.5 text-right">Hajm</th>
                        <th className="px-5 py-3.5 text-center">Harorat</th>
                        <th className="px-5 py-3.5 text-right">Chek</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-inherit">
                      {[
                        { id: "REYS-898", date: "Kecha, 16:30", route: "Oqdaryo → Samarqand Sut", vol: "3,800 L", temp: "3.2°C" },
                        { id: "REYS-897", date: "Kecha, 11:20", route: "Chorva Lux → Maroqand", vol: "4,100 L", temp: "3.5°C" },
                        { id: "REYS-896", date: "14 May, 18:00", route: "Pastdarg'om → Toshkent Sut", vol: "5,200 L", temp: "3.4°C" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="px-5 py-4 font-mono font-bold text-emerald-500">{row.id}</td>
                          <td className="px-5 py-4 text-slate-400">{row.date}</td>
                          <td className="px-5 py-4 font-bold">{row.route}</td>
                          <td className="px-5 py-4 text-right font-black">{row.vol}</td>
                          <td className="px-5 py-4 text-center font-bold text-sky-500">{row.temp}</td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setBannerNotice(`${row.id} uchun imzolangan kvitantsiya yuklab olindi.`)}
                              className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                            >
                              PDF Chek →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 8: SETTINGS (Vehicle & Offline Settings)
            ========================================================================= */}
            {activeWindow === "settings" && (
              <div className="space-y-6 max-w-2xl animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Avtomobil Parametrlari & Oflayn Sozlamalar</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Sut tashuvchi tanker texnik pasporti va avtonom ma'lumotlar xotirasi
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <div>
                    <label className="block text-xs font-bold mb-1">Davlat Raqami</label>
                    <input
                      type="text"
                      readOnly
                      value="01 A 777 ZF (Isuzu CryoTanker 10,000L)"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-100 dark:bg-white/5 border-inherit"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Oflayn Kesh Holati</label>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-inherit">
                      <span className="text-xs">{queuedOfflineCount} ta saqlangan oflayn yozuv</span>
                      <button
                        type="button"
                        onClick={handleManualFlush}
                        disabled={!isOnline || queuedOfflineCount === 0}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer disabled:opacity-50"
                      >
                        Sinxronlash
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL 1: LOG MILK INTAKE */}
      {showPickupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
            isDark ? "bg-[#121820] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-black">{dt.newPickupBtn}</h3>
              <button
                type="button"
                onClick={() => setShowPickupModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePickupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Fermer / Kooperativ STIR yoki Nomi</label>
                <input
                  type="text"
                  required
                  placeholder="308192849 (Oqdaryo Fayz)"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Sut Hajmi (Litr)</label>
                  <input
                    type="number"
                    required
                    placeholder="1200"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Harorat (°C)</label>
                  <input
                    type="text"
                    required
                    placeholder="3.4"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPickupModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={pickupFormSuccess}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-500 shadow-md cursor-pointer"
                >
                  {pickupFormSuccess ? "Qabul qilindi ✓" : "Sutni qabul qilish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SOS EMERGENCY REPORT */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
            isDark ? "bg-[#121820] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-black text-rose-500">Favqulodda SOS Signali</h3>
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Ushbu signal jo'natilganda dispecherlikka va eng yaqin zaxira haydovchiga avariya holati xabari boradi.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-bold">Nosozlik Turi</label>
              <select className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit outline-none">
                <option value="temp">Sovutgich agregati harorati ko'tarildi (&gt;4°C)</option>
                <option value="breakdown">Avtomobil dvigatel yoki shassi nosozligi</option>
                <option value="traffic">Magistral yo'lda to'siq yoki yo'l halokati</option>
                <option value="tank">Tanker germetik klapan nosozligi</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  setBannerNotice("SOS favqulodda signali dispecherga uzatildi. Zaxira tanker yo'naltirildi!");
                  setShowSosModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-500 shadow-md cursor-pointer"
              >
                SOS Jo'natish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
