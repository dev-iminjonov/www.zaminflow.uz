"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredSession, signOut, AuthSession } from "@/lib/auth";
import {
  AdminDashboardData,
  fetchAdminDashboardData,
} from "@/lib/roleDashboardService";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, ThemeToggleButton } from "@/context/ThemeContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { resolveUserAvatar } from "@/lib/userAvatar";
import UniversalSpotlightSearch from "@/components/search/UniversalSpotlightSearch";
import B2BProfileWindow from "@/components/profile/B2BProfileWindow";
import InteractiveFinancialChart from "@/components/dashboard/InteractiveFinancialChart";
import InteractiveComparisonBarChart from "@/components/dashboard/InteractiveComparisonBarChart";
import InteractiveRadialGauge from "@/components/dashboard/InteractiveRadialGauge";

type AdminWindow =
  | "overview"
  | "verifications"
  | "users"
  | "disputes"
  | "audit"
  | "analytics"
  | "settings"
  | "profile";

const ADMIN_I18N = {
  uz: {
    badge: "Boshqaruv & Xavfsizlik",
    subtitle: "PLATFORMA BOSHQARUVI VA ARBITRAJ",
    welcome: "Xush kelibsiz",
    desc: "Milliy agro-ekotizim: fermerlar, sut korxonalari va bank kliring nazorati",
    metricUsers: "Tasdiqlangan subyektlar",
    metricVolume: "Kunlik sut hajmi",
    metricEscrow: "Eskrou likvidligi",
    metricQueue: "Kutilayotgan arizalar",
    dossiersTitle: "KYC & STIR Muvofiqlik",
    demographicsTitle: "Ekotizim Subyektlari",
    approvalsTitle: "Haftalik Faollik Dinamikasi",
    newNoticeBtn: "Ekotizim Bildirishnomasi",
    btnApprove: "Tasdiqlash",
    btnReject: "Rad etish",
    btnReview: "Dossyeni köriş",
    advisorTitle: "Tizim Xavfsizlik Sertifikati",
    advisorDesc: "Platformadagi barça tranzaksiyalar va STIR ma'lumotlari CBU va Soliq Qömitasi bazasi bilan himoyalangan.",
  },
  ru: {
    badge: "Управление и Безопасность",
    subtitle: "АДМИНИСТРАТИВНЫЙ ПОРТАЛ И АРБИТРАЖ",
    welcome: "Добро пожаловать",
    desc: "Национальная агро-экосистема: мониторинг фермеров, заводов и банковского клиринга",
    metricUsers: "Верифицировано участников",
    metricVolume: "Суточный объем молока",
    metricEscrow: "Ликвидность эскроу",
    metricQueue: "Заявки на проверку",
    dossiersTitle: "Комплаенс KYC и ИНН",
    demographicsTitle: "Субъекты экосистемы",
    approvalsTitle: "Еженедельная активность",
    newNoticeBtn: "Системное оповещение",
    btnApprove: "Одобрить",
    btnReject: "Отклонить",
    btnReview: "Просмотр досье",
    advisorTitle: "Сертификат безопасности",
    advisorDesc: "Все транзакции и данные ИНН криптографически защищены по стандартам ЦБ и ГНК РУз.",
  },
  en: {
    badge: "Governance & Security",
    subtitle: "ECOSYSTEM GOVERNANCE & ARBITRATION",
    welcome: "Welcome",
    desc: "National dairy marketplace: farmer cooperatives, dairy processors, and bank settlement",
    metricUsers: "Verified Entities",
    metricVolume: "Daily Milk Turnover",
    metricEscrow: "Escrow Pool Liquidity",
    metricQueue: "Pending Dossiers",
    dossiersTitle: "KYC & Tax ID Compliance",
    demographicsTitle: "Ecosystem Demographics",
    approvalsTitle: "Weekly Activity Dynamics",
    newNoticeBtn: "System Broadcast Notice",
    btnApprove: "Verify",
    btnReject: "Reject",
    btnReview: "Review Dossier",
    advisorTitle: "Security & Governance",
    advisorDesc: "All transactions and legal tax records are continuously audited under Central Bank compliance.",
  },
};

export default function AdminOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeWindow, setActiveWindow] = useState<AdminWindow>("overview");
  const [timeRange, setTimeRange] = useState<"1d" | "1w" | "1m" | "6m" | "1y" | "all">("1m");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [searchQuery, setSearchQuery] = useState("");
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Modals
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [selectedDossier, setSelectedDossier] = useState<any | null>(null);

  const { locale, setLocale } = useLanguage();
  const { themeMode, isDark } = useTheme();
  const at = ADMIN_I18N[locale] || ADMIN_I18N.uz;

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const result = await fetchAdminDashboardData();
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

  const handleQuickApprove = (id: string, name: string) => {
    setApprovedIds((prev) => [...prev.filter((x) => x !== id), id]);
    setRejectedIds((prev) => prev.filter((x) => x !== id));
    setBannerNotice(`${name} arizasi muvaffaqiyatli tasdiqlandi va akkreditatsiyadan o'tkazildi.`);
  };

  const handleQuickReject = (id: string, name: string) => {
    setRejectedIds((prev) => [...prev.filter((x) => x !== id), id]);
    setApprovedIds((prev) => prev.filter((x) => x !== id));
    setBannerNotice(`${name} arizasi rad etildi va qo'shimcha hujjat so'rovi yuborildi.`);
  };

  const adminName = session?.user?.fullName || "Muhammadaziz (Super Admin)";

  // Dynamic Platform Growth & Transaction Curve Data
  const chartDatasets = useMemo(() => {
    switch (timeRange) {
      case "1d":
        return {
          points: [
            { label: "06:00", val: 18000000 },
            { label: "09:00", val: 32000000 },
            { label: "12:00", val: 48000000 },
            { label: "15:00", val: 65000000 },
            { label: "18:00", val: 82000000 },
            { label: "21:00", val: 96400000 },
          ],
          total: "96,400,000 UZS",
          delta: "+6.8% bugun",
        };
      case "1w":
        return {
          points: [
            { label: "Dush", val: 320000000 },
            { label: "Sesh", val: 410000000 },
            { label: "Chor", val: 390000000 },
            { label: "Pay", val: 580000000 },
            { label: "Jum", val: 620000000 },
            { label: "Shan", val: 710000000 },
            { label: "Yak", val: 790000000 },
          ],
          total: "790,000,000 UZS",
          delta: "+14.2% bu hafta",
        };
      case "6m":
      case "1y":
      case "all":
        return {
          points: [
            { label: "Dek", val: 1200000000 },
            { label: "Yan", val: 1650000000 },
            { label: "Fev", val: 2100000000 },
            { label: "Mar", val: 2800000000 },
            { label: "Apr", val: 3400000000 },
            { label: "May", val: 4250000000 },
          ],
          total: "4,250,000,000 UZS",
          delta: "+254% jami GMV",
        };
      case "1m":
      default:
        return {
          points: [
            { label: "1 May", val: 420000000 },
            { label: "5 May", val: 680000000 },
            { label: "10 May", val: 950000000 },
            { label: "15 May", val: 1350000000 },
            { label: "20 May", val: 1820000000 },
            { label: "25 May", val: 2450000000 },
            { label: "1 Iyun", val: 3120000000 },
          ],
          total: "3,120,000,000 UZS",
          delta: "+32.4% bu oy",
        };
    }
  }, [timeRange]);

  // Navigation Items
  const navigationItems: { key: AdminWindow; label: string; icon: React.ReactNode }[] = [
    {
      key: "overview",
      label: "Boshqaruv Paneli",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      key: "verifications",
      label: "KYC & STIR Dossyelar",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      key: "users",
      label: "Foydalanuvchilar Reestri",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      key: "disputes",
      label: "Markaziy Arbitraj",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      key: "audit",
      label: "Xavfsizlik Jurnali",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: "analytics",
      label: "Milliy Agro Tahlil",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      key: "settings",
      label: "Platforma Parametrlari",
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
      isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f6fbf8] text-[#081c15]"
    }`}>
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] pointer-events-none -z-0 opacity-20 blur-[140px] bg-gradient-to-br from-teal-500 to-sky-400" />

      {/* Master Container: Fixed Left Sidebar + Dynamic In-Place Content Area (Investure Architecture) */}
      <div className={`relative z-10 max-w-[1520px] mx-auto rounded-[32px] border shadow-2xl flex flex-col lg:flex-row overflow-hidden transition-all ${
        isDark
          ? "bg-[#14181d] border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.6)] text-[#E8F1F2]"
          : "bg-white border-[#b7e4c7] shadow-[0_10px_35px_rgba(0,153,255,0.06)] text-[#081c15]"
      }`}>

        {/* =========================================================================
            LEFT NAVIGATION SIDEBAR (Exact Investure Layout)
        ========================================================================= */}
        <aside className={`w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r p-6 flex flex-col justify-between transition-colors ${
          isDark ? "border-white/10 bg-[#0e1319]" : "border-slate-100 bg-[#fafcff]"
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

          {/* Bottom Card: Governance / Security Status Card */}
          <div className="pt-6 space-y-4">
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              isDark
                ? "bg-gradient-to-b from-white/[0.04] to-transparent border-white/10"
                : "bg-gradient-to-b from-teal-50/50 to-sky-50/20 border-teal-100"
            }`}>
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xs font-bold">{at.advisorTitle}</h4>
              <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
                {at.advisorDesc}
              </p>
              <button
                type="button"
                onClick={() => setActiveWindow("audit")}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Audit Jurnalini Ko'rish
              </button>
            </div>

            {/* User Profile Pill */}
            <div className={`flex items-center justify-between p-2.5 rounded-2xl border ${
              isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/80"
            }`}>
              <button
                type="button"
                onClick={() => setActiveWindow("profile")}
                className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition cursor-pointer"
              >
                <img
                  src={resolveUserAvatar(adminName, session?.user?.email) || "/images/team-muhammadaziz.webp"}
                  alt="Admin"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-500/40"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate hover:text-emerald-500 transition">{adminName}</p>
                  <p className={`text-[10px] truncate ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    Super Administrator
                  </p>
                </div>
              </button>
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
                ZaminFlow Milliy Ekotizim Boshqaruv Markazi • CBU & Soliq Nazorati
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Universal Live Spotlight Search */}
              <UniversalSpotlightSearch
                role="admin"
                onSelectAction={(item) => {
                  if (item.category === "dossiers") {
                    setActiveWindow("verifications");
                  } else if (item.category === "organizations" || item.category === "users") {
                    if (item.href) {
                      router.push(item.href);
                    } else {
                      setActiveWindow("users");
                    }
                  } else if (item.category === "batches") {
                    setActiveWindow("overview");
                  } else if (item.href) {
                    router.push(item.href);
                  }
                }}
              />

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

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => setShowNoticeModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md hover:shadow-emerald-500/25 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{at.newNoticeBtn}</span>
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
                WINDOW 1: OVERVIEW (Financial Investure Layout)
            ========================================================================= */}
            {activeWindow === "overview" && (
              <div className="space-y-8 animate-fadeIn">
                {/* 1. HERO FINANCIAL / GMV CURVE CHART (Interactive & Live) */}
                <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                  isDark
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-slate-50/60 border-slate-200 shadow-xs"
                }`}>
                  <InteractiveFinancialChart
                    title="Platforma Jami Aylanmasi (GMV)"
                    subtitle="PLATFORMA BOSHQARUVI VA ARBITRAJ"
                    totalDisplay={data ? `${data.escrowTotal.value} ${data.escrowTotal.unit}` : chartDatasets.total}
                    deltaDisplay={chartDatasets.delta}
                    deltaPositive={true}
                    unit="UZS"
                    accentColor="#10b981"
                    secondaryColor="#00ffc8"
                    gradientId="adminChartGradient"
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
                  {/* Card 1: Verified Entities */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {at.metricUsers}
                      </p>
                      <h3 className="text-xl font-black mt-1">
                        {data?.activeUsers ? data.activeUsers.value : "1,720"}
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                        <span>↑ 1,420 fermer</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>84 zavod</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 2: Daily Milk Turnover */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {at.metricVolume}
                      </p>
                      <h3 className="text-xl font-black mt-1">
                        142,500 L
                      </h3>
                      <p className="text-[11px] font-bold text-sky-500 mt-0.5 flex items-center gap-1">
                        <span>↑ 18.5%</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>respublika böyiça</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 3: Escrow Liquidity */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {at.metricEscrow}
                      </p>
                      <h3 className="text-xl font-black mt-1">
                        {data ? `${data.escrowTotal.value} ${data.escrowTotal.unit}` : "984.5M UZS"}
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                        <span>100% zaxira</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>AgroBank CBU</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 4: Pending Dossiers Queue */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {at.metricQueue}
                      </p>
                      <h3 className="text-xl font-black mt-1 text-amber-500">
                        {data ? `${data.pendingVerification.value} Dossye` : "4 Dossye"}
                      </h3>
                      <p className="text-[11px] font-bold text-amber-500 mt-0.5 flex items-center gap-1">
                        <span>Navbatda</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>tekshiruv</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 3. THREE-COLUMN BOTTOM BENTO (Investure Exact Match) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Col 1: Pending KYC & STIR Verification Dossiers */}
                  <div className={`p-6 rounded-3xl border transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between pb-4 border-b border-inherit">
                      <div>
                        <h4 className="text-sm font-black">{at.dossiersTitle}</h4>
                        <p className={`text-[11px] ${isDark ? "text-white/40" : "text-slate-400"}`}>
                          Akkreditatsiya kutayotgan subyektlar
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveWindow("verifications")}
                        className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                      >
                        Barchasi →
                      </button>
                    </div>

                    <div className="divide-y divide-inherit mt-2">
                      {[
                        { id: "DOS-101", name: "Zarafshon Agro Fayz", stir: "308192041", role: "Fermer Kooperativi", date: "Bugun 11:30" },
                        { id: "DOS-102", name: "Maroqand Sut Sanoat LLC", stir: "201948512", role: "Sut Zavodi", date: "Bugun 09:15" },
                        { id: "DOS-103", name: "Chust Chorva Trans", stir: "309148201", role: "Logistika Haydovchi", date: "Kecha 17:00" },
                      ].map((item, idx) => {
                        const isApproved = approvedIds.includes(item.id);
                        const isRejected = rejectedIds.includes(item.id);
                        return (
                          <div key={idx} className="py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-xs font-black">
                                {item.role[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold">{item.name}</p>
                                <p className={`text-[10px] font-mono ${isDark ? "text-white/40" : "text-slate-400"}`}>
                                  STIR: {item.stir} • {item.role}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isApproved ? (
                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                  Tasdiqlandi ✓
                                </span>
                              ) : isRejected ? (
                                <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                  Rad etildi ✕
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickApprove(item.id, item.name)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition"
                                  >
                                    Tasdiq
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickReject(item.id, item.name)}
                                    className="px-2 py-1 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-[11px] font-bold cursor-pointer transition"
                                  >
                                    Rad
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Col 2: Interactive Radial Gauge (Ecosystem Demographics) */}
                  <InteractiveRadialGauge
                    title={at.demographicsTitle}
                    totalLabel="1,720 Jami"
                    isDark={isDark}
                    defaultActiveKey="farmers"
                    segments={[
                      { key: "farmers", label: "Fermer", count: 1420, countFormatted: "1,420 (82%)", percentage: 82.5, color: "#10b981", sublabel: "Fermerlar ulushi" },
                      { key: "dairies", label: "Zavod", count: 84, countFormatted: "84 (5%)", percentage: 4.9, color: "#0ea5e9", sublabel: "Sut zavodlari ulushi" },
                      { key: "drivers", label: "Haydovçi", count: 216, countFormatted: "216 (13%)", percentage: 12.6, color: "#f59e0b", sublabel: "Logistika parki ulushi" },
                    ]}
                  />

                  {/* Col 3: Dual Comparison Bar Chart (Weekly Activity Dynamics) */}
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <InteractiveComparisonBarChart
                      title={at.approvalsTitle}
                      subtitle="Haftalik faollik va tasdiqlash dinamikasi"
                      currentLabel="Joriy hafta"
                      previousLabel="O'tgan hafta"
                      currentTotal="2,480 ta"
                      previousTotal="1,960 ta"
                      primaryColor="#10b981"
                      unit="Arizalar"
                      isDark={isDark}
                      actionText="Arbitraj audit jurnali →"
                      onActionClick={() => setActiveWindow("audit")}
                      items={[
                        { label: "Du", currentVal: 340, previousVal: 280, currentFormatted: "340 ta", previousFormatted: "280 ta" },
                        { label: "Se", currentVal: 420, previousVal: 310, currentFormatted: "420 ta", previousFormatted: "310 ta" },
                        { label: "Ch", currentVal: 390, previousVal: 290, currentFormatted: "390 ta", previousFormatted: "290 ta" },
                        { label: "Pa", currentVal: 560, previousVal: 410, currentFormatted: "560 ta", previousFormatted: "410 ta" },
                        { label: "Ju", currentVal: 480, previousVal: 380, currentFormatted: "480 ta", previousFormatted: "380 ta" },
                        { label: "Sh", currentVal: 290, previousVal: 290, currentFormatted: "290 ta", previousFormatted: "290 ta" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 2: VERIFICATIONS (KYC & STIR Review)
            ========================================================================= */}
            {activeWindow === "verifications" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">KYC va Yuridik STIR Verifikatsiyasi</h3>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                      Yangi fermer kooperativlari, sut zavodlari va haydovchilar akkreditatsiyasi
                    </p>
                  </div>
                </div>

                <div className={`rounded-3xl border overflow-hidden ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${
                      isDark ? "border-white/10 bg-white/[0.03] text-white/50" : "border-slate-100 bg-slate-50 text-slate-400"
                    }`}>
                      <tr>
                        <th className="px-5 py-3.5">Dossye ID</th>
                        <th className="px-5 py-3.5">Subyekt Nomi</th>
                        <th className="px-5 py-3.5">STIR / INN</th>
                        <th className="px-5 py-3.5">Rol</th>
                        <th className="px-5 py-3.5">Mulkchilik / Viloyat</th>
                        <th className="px-5 py-3.5 text-center">Status</th>
                        <th className="px-5 py-3.5 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-inherit">
                      {[
                        { id: "DOS-101", name: "Zarafshon Agro Fayz", stir: "308192041", role: "Fermer Kooperativi", region: "Samarqand viloyati", status: "Kutilmoqda" },
                        { id: "DOS-102", name: "Maroqand Sut Sanoat LLC", stir: "201948512", role: "Sut Zavodi", region: "Toshkent shahri", status: "Kutilmoqda" },
                        { id: "DOS-103", name: "Chust Chorva Trans", stir: "309148201", role: "Logistika Haydovchi", region: "Namangan viloyati", status: "Kutilmoqda" },
                        { id: "DOS-100", name: "Siyob Agro Vet", stir: "304812903", role: "Fermer Kooperativi", region: "Samarqand viloyati", status: "Tasdiqlangan" },
                      ].map((row, i) => {
                        const isApproved = approvedIds.includes(row.id) || row.status === "Tasdiqlangan";
                        const isRejected = rejectedIds.includes(row.id) || row.status === "Rad etilgan";
                        return (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                            <td className="px-5 py-4 font-mono font-bold text-emerald-500">{row.id}</td>
                            <td className="px-5 py-4 font-bold">{row.name}</td>
                            <td className="px-5 py-4 font-mono text-slate-500">{row.stir}</td>
                            <td className="px-5 py-4">{row.role}</td>
                            <td className="px-5 py-4 text-slate-500">{row.region}</td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isApproved
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                                  : isRejected
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                                  : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                              }`}>
                                {isApproved ? "Tasdiqlangan" : isRejected ? "Rad etilgan" : row.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {isApproved ? (
                                <span className="text-emerald-500 font-bold">Faol ✓</span>
                              ) : isRejected ? (
                                <span className="text-rose-500 font-bold">Rad etildi ✕</span>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickApprove(row.id, row.name)}
                                    className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer transition shadow-xs"
                                  >
                                    Tasdiq
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickReject(row.id, row.name)}
                                    className="px-2 py-1 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-bold hover:bg-rose-500/10 cursor-pointer transition shadow-xs"
                                  >
                                    Rad
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 3: USERS (User Registry)
            ========================================================================= */}
            {activeWindow === "users" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Platforma Foydalanuvchilar Reestri</h3>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                      Tizimda ro'yxatdan o'tgan barcha subyektlar va ularning faoliyat holati
                    </p>
                  </div>
                  <Link
                    href="/users"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] text-xs font-black shadow-md hover:opacity-95 active:scale-95 transition"
                  >
                    <span>Töliq User & Admin Moduliga Ötiş</span>
                    <span>→</span>
                  </Link>
                </div>

                <div className={`rounded-3xl border overflow-hidden ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${
                      isDark ? "border-white/10 bg-white/[0.03] text-white/50" : "border-slate-100 bg-slate-50 text-slate-500"
                    }`}>
                      <tr>
                        <th className="px-5 py-3.5">F.I.SH / Tashkilot</th>
                        <th className="px-5 py-3.5">Email / Boğlaniş</th>
                        <th className="px-5 py-3.5">Rol</th>
                        <th className="px-5 py-3.5">Röyxatdan ötgan sana</th>
                        <th className="px-5 py-3.5 text-center">Holat</th>
                        <th className="px-5 py-3.5 text-right">Boşqaruv</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-inherit">
                      {[
                        { name: "Iminjonov Muhammadaziz", email: "dev.iminjonov@gmail.com", role: "ADMIN", date: "2026.01.10", status: "FAOL" },
                        { name: "Sevinchoy Soporboyeva", email: "sevinchinoyatovna005@gmail.com", role: "ADMIN", date: "2026.01.12", status: "FAOL" },
                        { name: "Abdumanov Akrom", email: "abdumanovjamshid1@gmail.com", role: "ADMIN", date: "2026.01.14", status: "FAOL" },
                        { name: "Chorva Baraka LLC (Muhammadayub)", email: "iminjonovmuhammadayub@zaminflow.uz", role: "FARMER", date: "2026.02.01", status: "FAOL" },
                      ].map((u, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                          <td className="px-5 py-4 text-slate-500">{u.email}</td>
                          <td className="px-5 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{u.role}</td>
                          <td className="px-5 py-4 text-slate-400">{u.date}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                              {u.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              href="/users"
                              className="text-xs font-bold text-[#00d3e0] hover:underline"
                            >
                              Boşqariş →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 4: DISPUTES (Arbitration Desk)
            ========================================================================= */}
            {activeWindow === "disputes" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Markaziy Nizolarni Körib Çiqiş (Arbitraj)</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Sifat, harorat yoki og'irlik bo'yicha yuzaga kelgan partiyalar nizolarini hal qilish
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="font-mono font-bold text-xs text-rose-500">NIZO-704</span>
                      <h4 className="text-sm font-black mt-0.5">Toşkent Sut Zavodi ↔ Yangiyöl Ferma Fayz</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Sut partiyasi: 2,400 litr • E'tiroz: Qabul paytida harorat +6.2°C bo'lgan. Muzlatilgan eskrou: 14,800,000 UZS
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBannerNotice("Nizo fermer foydasiga hal qilindi. Mablag' chiqarildi.")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer"
                      >
                        Fermer foydasiga
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerNotice("Nizo zavod foydasiga hal qilindi. Mablag' depozitga qaytarildi.")}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-bold hover:bg-rose-500/10 cursor-pointer"
                      >
                        Zavod foydasiga
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 5: AUDIT (Security & Audit Logs)
            ========================================================================= */}
            {activeWindow === "audit" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Xavfsizlik & Tizim Audit Jurnali</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    O'zgarmas kriptografik xavfsizlik jurnali va ISO 20022 shlyuzi hodisalari
                  </p>
                </div>

                <div className={`rounded-3xl border overflow-hidden ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <div className="p-4 space-y-2 font-mono text-xs">
                    {[
                      { time: "Bugun 11:42:01", ip: "195.158.24.12", event: "ISO20022_PACS008_DISPATCH", hash: "sha256:8f41b9...c014", stat: "SUCCESS" },
                      { time: "Bugun 11:30:15", ip: "84.54.82.90", event: "USER_KYC_VERIFICATION_SUBMIT", hash: "sha256:3a19e2...d872", stat: "PENDING" },
                      { time: "Bugun 10:15:40", ip: "195.158.24.12", event: "ESCROW_SETTLEMENT_BATCH_RELEASE", hash: "sha256:e4901b...77f1", stat: "SUCCESS" },
                      { time: "Bugun 09:00:12", ip: "10.0.4.1", event: "SYSTEM_HEALTH_CHECK_CRON", hash: "sha256:91bc01...aa31", stat: "OK" },
                    ].map((log, i) => (
                      <div key={i} className="flex flex-wrap items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{log.time}</span>
                          <span className="font-bold text-emerald-500">{log.event}</span>
                          <span className="text-slate-500">{log.ip}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">{log.hash}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 font-bold">
                            {log.stat}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 6: ANALYTICS (National Milk Flow)
            ========================================================================= */}
            {activeWindow === "analytics" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Milliy Agro & Sut Oqimi Tahlili</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Viloyatlar kesimida sut yetkazib berish hajmlari va o'rtacha narxlar
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { region: "Samarqand viloyati", vol: "58,400 L/kun", price: "5,400 UZS/L", trend: "+14.2%" },
                    { region: "Toshkent viloyati", vol: "42,100 L/kun", price: "5,600 UZS/L", trend: "+8.9%" },
                    { region: "Farg'ona vodiysi", vol: "28,200 L/kun", price: "5,350 UZS/L", trend: "+19.5%" },
                    { region: "Qashqadaryo", vol: "13,800 L/kun", price: "5,200 UZS/L", trend: "+6.1%" },
                  ].map((r, i) => (
                    <div key={i} className={`p-5 rounded-3xl border ${
                      isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                    }`}>
                      <h4 className="text-sm font-black">{r.region}</h4>
                      <p className="text-2xl font-black text-emerald-500 mt-2">{r.vol}</p>
                      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-inherit mt-2">
                        <span>Örtaça: {r.price}</span>
                        <span className="text-emerald-500 font-bold">{r.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 7: SETTINGS (Platform Parameters)
            ========================================================================= */}
            {activeWindow === "settings" && (
              <div className="space-y-6 max-w-2xl animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Platforma Sozlamalari & Standartlar</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Sifat chegaralari, komissiya stavkalari va avtomat kliring muddatlari
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <div>
                    <label className="block text-xs font-bold mb-1">Minimal Ruxsat Etilgan Yoğlilik Darajasi (%)</label>
                    <input
                      type="text"
                      defaultValue="3.2%"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Maksimal Sovuq Zanjir Harorati (°C)</label>
                    <input
                      type="text"
                      defaultValue="+4.0°C"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">AgroBank Eskrou Tranzaksiya Komissiyasi (%)</label>
                    <input
                      type="text"
                      defaultValue="0.8%"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerNotice("Platforma parametrlari muvaffaqiyatli saqlandi.")}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer transition shadow-md"
                  >
                    Parametrlarni Saqlash
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 8: B2B PROFILE & REKVIZITLAR (Role-Adaptive Profile Window)
            ========================================================================= */}
            {activeWindow === "profile" && (
              <B2BProfileWindow session={session} role="admin" isDark={isDark} />
            )}
          </div>
        </main>
      </div>

      {/* MODAL: BROADCAST NOTICE */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
            isDark ? "bg-[#121820] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-black">{at.newNoticeBtn}</h3>
              <button
                type="button"
                onClick={() => setShowNoticeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">E'lon Mavzusi</label>
                <input
                  type="text"
                  placeholder="Masalan: Yangi sut qabul qilish sanitariya qoidalari"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Kimlarga Yuborish</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit outline-none">
                  <option value="all">Barça iştirokçilar (Fermer, Zavod, Haydovçi, Bank)</option>
                  <option value="farmers">Faqat Fermerlar</option>
                  <option value="dairies">Faqat Sut Zavodlari</option>
                  <option value="drivers">Faqat Haydovchilar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Matn</label>
                <textarea
                  rows={4}
                  placeholder="Ekotizim ishtirokchilariga yuboriladigan xabar matni..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-transparent border-inherit focus:border-emerald-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNoticeModal(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  setBannerNotice("Tizim bildirishnomasi barcha tanlangan foydalanuvchilarga yuborildi.");
                  setShowNoticeModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-500 shadow-md cursor-pointer"
              >
                E'lonni chop etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
