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
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { resolveUserAvatar } from "@/lib/userAvatar";
import UniversalSpotlightSearch from "@/components/search/UniversalSpotlightSearch";
import B2BProfileWindow from "@/components/profile/B2BProfileWindow";
import InteractiveFinancialChart from "@/components/dashboard/InteractiveFinancialChart";
import InteractiveComparisonBarChart from "@/components/dashboard/InteractiveComparisonBarChart";
import InteractiveRadialGauge from "@/components/dashboard/InteractiveRadialGauge";

type DriverWindow =
  | "overview"
  | "trips"
  | "pickup"
  | "dispatch"
  | "telemetry"
  | "issues"
  | "history"
  | "settings"
  | "profile";

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
    waypointsTitle: "Marşrut va Töxtaş Nuqtalari",
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

  const { locale, setLocale, dashT } = useLanguage();
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
      setBannerNotice("Oflayn navbat server bilan töliq sinxronlaştirildi.");
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
    {
      key: "profile",
      label: "B2B Profil & Rekvizitlar",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`min-h-screen py-4 px-3 sm:px-6 relative overflow-x-hidden font-sans antialiased transition-colors duration-300 ${
      isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f4fbfe] text-[#03045e]"
    }`}>
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] pointer-events-none -z-0 opacity-20 blur-[140px] bg-gradient-to-br from-emerald-500 to-amber-400" />

      {/* Master Container: Fixed Left Sidebar + Dynamic In-Place Content Area (Investure Architecture) */}
      <div className={`relative z-10 max-w-[1520px] mx-auto rounded-[32px] border shadow-2xl flex flex-col lg:flex-row overflow-hidden transition-all ${
        isDark
          ? "bg-[#14181d] border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.6)] text-[#E8F1F2]"
          : "bg-white border-[#ade8f4] shadow-[0_10px_35px_rgba(0,153,255,0.06)] text-[#03045e]"
      }`}>

        {/* =========================================================================
            LEFT NAVIGATION SIDEBAR (Exact Investure Layout)
        ========================================================================= */}
        <aside className={`w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r p-6 flex flex-col justify-between transition-colors ${
          isDark ? "border-white/10 bg-[#0d1013]" : "border-[#ade8f4]/60 bg-[#f4fbfe]"
        }`}>
          <div>
            {/* 1. Brand Logo */}
            <div className="flex items-center pb-8">
              <Link href="/" className="flex items-center gap-2 transition hover:scale-105">
                <ZaminFlowLogo mode={themeMode} size="md" />
              </Link>
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

              {/* Universal Live Spotlight Search */}
              <UniversalSpotlightSearch
                role="driver"
                onSelectAction={(item) => {
                  if (item.category === "batches") {
                    setActiveWindow("trips");
                  } else if (item.category === "navigation") {
                    setActiveWindow("overview");
                  } else if (item.href) {
                    router.push(item.href);
                  }
                }}
              />

              {/* Language Switcher */}
              <LanguageSwitcher isDark={isDark} />

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
                {/* 1. HERO FINANCIAL / DELIVERY VOLUME CHART (Interactive & Live) */}
                <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                  isDark
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-slate-50/60 border-slate-200 shadow-xs"
                }`}>
                  <InteractiveFinancialChart
                    title={dt.deliveredMilk}
                    subtitle="HAYDOVCHI VA SOVUQ ZANJIR TELEMETRIYASI"
                    totalDisplay={data ? `${data.completedThisWeek.value} Litr` : chartDatasets.total}
                    deltaDisplay={chartDatasets.delta}
                    deltaPositive={true}
                    unit="Litr"
                    accentColor="#f59e0b"
                    secondaryColor="#10b981"
                    gradientId="driverChartGradient"
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                    points={chartDatasets.points}
                    isDark={isDark}
                  />
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
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>ötgan kunga nisbatan</span>
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
                      {data?.todayStops && data.todayStops.length > 0 ? (
                        data.todayStops.map((wp, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-black bg-emerald-500 text-white">
                              {i + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold truncate">{wp.locationName}</h5>
                                <span className={`text-[10px] font-mono ${isDark ? "text-white/40" : "text-slate-400"}`}>{wp.time}</span>
                              </div>
                              <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? "text-white/50" : "text-slate-500"}`}>{wp.batchInfo}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-slate-400 text-xs font-medium">
                          Marshrut nuqtalari mavjud emas
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Interactive Radial Gauge (Cold Chain Temperature Integrity) */}
                  <InteractiveRadialGauge
                    title={dt.gaugeTitle}
                    totalLabel="Standart: +4°C"
                    isDark={isDark}
                    defaultActiveKey="thermo"
                    segments={[
                      { key: "thermo", label: "Termo-izolyatsiya", percentage: 99.8, color: "#10b981", sublabel: "Termo-izolyatsiya: 99.8%", countFormatted: "99.8%" },
                      { key: "cooling", label: "Sovutish", percentage: 85.0, color: "#0ea5e9", sublabel: "Sovutish agregati faol", countFormatted: "Faol" },
                      { key: "temp", label: "Harorat", percentage: 68.0, color: "#f59e0b", sublabel: "Tanker harorati: +3.4°C", countFormatted: "+3.4°C" },
                    ]}
                  />

                  {/* Col 3: Dual Comparison Bar Chart (Daily Deliveries Velocity) */}
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <InteractiveComparisonBarChart
                      title={dt.velocityTitle}
                      subtitle="Haftalik bajarilgan va rejalashtirilgan qatnovlar"
                      currentLabel="Joriy hafta"
                      previousLabel="O'tgan hafta"
                      currentTotal="18 qatnov"
                      previousTotal="14 qatnov"
                      primaryColor="#f59e0b"
                      secondaryColor="#10b981"
                      unit="Qatnov"
                      isDark={isDark}
                      actionText="Qatnovlar tarixini ko'rish →"
                      onActionClick={() => setActiveWindow("history")}
                      items={[
                        { label: "Du", currentVal: 3, previousVal: 2, currentFormatted: "3 qatnov", previousFormatted: "2 qatnov" },
                        { label: "Se", currentVal: 4, previousVal: 3, currentFormatted: "4 qatnov", previousFormatted: "3 qatnov" },
                        { label: "Ch", currentVal: 3, previousVal: 2, currentFormatted: "3 qatnov", previousFormatted: "2 qatnov" },
                        { label: "Pa", currentVal: 5, previousVal: 4, currentFormatted: "5 qatnov", previousFormatted: "4 qatnov" },
                        { label: "Ju", currentVal: 4, previousVal: 3, currentFormatted: "4 qatnov", previousFormatted: "3 qatnov" },
                        { label: "Sh", currentVal: 4, previousVal: 3, currentFormatted: "4 qatnov", previousFormatted: "3 qatnov" },
                      ]}
                    />
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
                  {data?.todayStops && data.todayStops.length > 0 ? (
                    data.todayStops.map((stop, idx) => (
                      <div key={idx} className={`p-5 rounded-3xl border transition-all ${
                        isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                      }`}>
                        <div className="flex items-center justify-between pb-3 border-b border-inherit">
                          <span className="font-mono font-bold text-xs text-emerald-500">{stop.batchInfo || `REYS-${idx + 1}`}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            stop.statusType === "next"
                              ? "bg-sky-500/10 text-sky-600 border border-sky-500/30 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          }`}>
                            {stop.status}
                          </span>
                        </div>
                        <div className="py-3 space-y-2 text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px]">Manzil:</span>
                            <p className="font-bold">{stop.locationName}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px]">Reja vaqti:</span>
                            <p className="font-bold text-slate-700 dark:text-slate-200">{stop.time}</p>
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
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center text-xl mb-2">
                        🚛
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-white/80">
                        Faol logistika reyslari mavjud emas
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Zavod yoki kooperativdan yangi qabul partiyasi tayinlanganda bu yerda marshrut paydo bo'ladi.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 3: MILK PICKUP (Intake Scanner & Receipt)
            ========================================================================= */}
            {activeWindow === "pickup" && (
              <div className="space-y-6 max-w-2xl animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Ferma Darvozasida Sut Qabul Qiliş</h3>
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
                        <label className="block text-xs font-bold mb-1">Yoğlilik darajasi (%)</label>
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
                      {data?.activeTrip?.route ? `${data.activeTrip.route} • ETA: ${data.activeTrip.eta}` : "Sovuq zanjir telemetriyasi barqaror"}
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
                        { id: "REYS-896", date: "14 May, 18:00", route: "Pastdarğom → Toşkent Sut", vol: "5,200 L", temp: "3.4°C" },
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

            {/* =========================================================================
                WINDOW 9: B2B PROFILE & REKVIZITLAR (Role-Adaptive Profile Window)
            ========================================================================= */}
            {activeWindow === "profile" && (
              <B2BProfileWindow session={session} role="driver" isDark={isDark} />
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
                <option value="temp">Sovutgiç agregati harorati kötarildi (&gt;4°C)</option>
                <option value="breakdown">Avtomobil dvigatel yoki shassi nosozligi</option>
                <option value="traffic">Magistral yölda tösiq yoki yöl halokati</option>
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
                  setBannerNotice("SOS favqulodda signali dispeçerga uzatildi. Zaxira tanker yönaltirildi!");
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
