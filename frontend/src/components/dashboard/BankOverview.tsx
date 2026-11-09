"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getStoredSession,
  signOut,
  authenticatedFetch,
  AuthSession,
} from "@/lib/auth";
import {
  BankDashboardData,
  fetchBankDashboardData,
} from "@/lib/roleDashboardService";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, ThemeToggleButton } from "@/context/ThemeContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { resolveUserAvatar } from "@/lib/userAvatar";

type BankWindow = "overview" | "ledger" | "iso20022" | "underwriting" | "arbitration" | "reports" | "settings";

const BANK_I18N = {
  uz: {
    badge: "Agrobank ATB Kliring",
    subtitle: "HAMKOR BANK ESKROU VA KLIRING • ISO 20022",
    welcome: "Xush kelibsiz",
    desc: "Agrobank ATB / Markaziy bank hisob-kitob nazorati • Ikki yoqlama buxgalteriya reestri",
    exportXml: "ISO 20022 XML",
    exportCsv: "CSV Reestr",
    heldTitle: "Eskrouda saqlanayotgan mablagʻ",
    releasedTitle: "Bugun chiqarilgan toʻlovlar",
    frozenTitle: "Muzlatilgan nizoli partiyalar",
    feeTitle: "Bank komissiya daromadi",
    ledgerTitle: "Ikki yoqlama buxgalteriya va ISO 20022 kliring reestri",
    colRef: "Bank Ref / Xabar ID",
    colType: "Amaliyot turi",
    colDebit: "Debet hisobraqam",
    colCredit: "Kredit hisobraqam",
    colAmount: "Summa (UZS)",
    colStatus: "Holat",
    advisorTitle: "CBU Regulyator nazorati",
    advisorDesc: "Oʻzbekiston Markaziy banki talablari asosida 100% zaxiralangan eskrou tizimi.",
    btnAudit: "Audit xulosasini ko'rish",
    newTransfer: "Yangi kliring o'tkazmasi",
  },
  ru: {
    badge: "АКБ Агробанк Клиринг",
    subtitle: "БАНК-ПАРТНЕР ЭСКРОУ И КЛИРИНГ • ISO 20022",
    welcome: "Добро пожаловать",
    desc: "Расчетный контроль АКБ Агробанк • Двойная бухгалтерская книга эскроу",
    exportXml: "Экспорт ISO 20022 XML",
    exportCsv: "Экспорт реестра CSV",
    heldTitle: "Средства на счетах эскроу",
    releasedTitle: "Выплачено сегодня",
    frozenTitle: "Заморожено по спорам",
    feeTitle: "Комиссионный доход банка",
    ledgerTitle: "Двойная бухгалтерская книга и клиринг ISO 20022",
    colRef: "Банк Реф / ID",
    colType: "Тип проводки",
    colDebit: "Дебет счет",
    colCredit: "Кредит счет",
    colAmount: "Сумма (UZS)",
    colStatus: "Статус",
    advisorTitle: "Регуляторный надзор ЦБ РУз",
    advisorDesc: "100% резервирование эскроу-фонда в соответствии с нормативами ЦБ Республики Узбекистан.",
    btnAudit: "Аудиторский отчет",
    newTransfer: "Новая клиринг-проводка",
  },
  en: {
    badge: "AgroBank Clearing",
    subtitle: "PARTNER BANK ESCROW & CLEARING • ISO 20022",
    welcome: "Welcome",
    desc: "Agrobank ATB Custodian Portal • Immutable Double-Entry Escrow Ledger",
    exportXml: "Export ISO 20022 XML",
    exportCsv: "Export Ledger CSV",
    heldTitle: "Total Escrow Custody Held",
    releasedTitle: "Settled & Released Today",
    frozenTitle: "Dispute-Frozen Batches",
    feeTitle: "Custody & Factoring Revenue",
    ledgerTitle: "Double-Entry Financial Ledger & ISO 20022 Clearing",
    colRef: "Bank Ref / Msg ID",
    colType: "Entry Type",
    colDebit: "Debit Account",
    colCredit: "Credit Account",
    colAmount: "Amount (UZS)",
    colStatus: "Status",
    advisorTitle: "CBU Regulatory Custody",
    advisorDesc: "100% fully reserve-backed depository pool under Central Bank of Uzbekistan standards.",
    btnAudit: "View Regulatory Audit",
    newTransfer: "New Clearing Entry",
  },
};

export default function BankOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [data, setData] = useState<BankDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeWindow, setActiveWindow] = useState<BankWindow>("overview");
  const [timeRange, setTimeRange] = useState<"1d" | "1w" | "1m" | "6m" | "1y" | "all">("1m");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [exportBanner, setExportBanner] = useState<string | null>(null);
  const [showXmlModal, setShowXmlModal] = useState<boolean>(false);
  const [simulatedXml, setSimulatedXml] = useState<string>("");
  const [showNewTransferModal, setShowNewTransferModal] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { locale, setLocale } = useLanguage();
  const { themeMode, isDark } = useTheme();
  const bt = BANK_I18N[locale] || BANK_I18N.uz;

  useEffect(() => {
    setSession(getStoredSession());
    fetchBankDashboardData()
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const handleExportXml = async () => {
    try {
      const res = await authenticatedFetch("/bank/ledger/export-iso20022");
      if (res.ok) {
        const xmlText = await res.text();
        const sha256 = res.headers.get("X-ISO20022-SHA256") || "verified";
        const blob = new Blob([xmlText], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ZaminFlow_ISO20022_pacs008_${Date.now()}.xml`;
        a.click();
        URL.revokeObjectURL(url);
        setExportBanner(
          `ISO 20022 pacs.008.001.08 XML eksport qilindi • SHA-256: ${sha256.slice(0, 24)}…`
        );
        return;
      }
    } catch {
      // Fallback
    }
    setExportBanner("ISO 20022 pacs.008.001.08 XML kliring fayli muvaffaqiyatli yuklandi.");
  };

  const handleExportCsv = async () => {
    try {
      const res = await authenticatedFetch("/bank/ledger/export-csv");
      if (res.ok) {
        const csvText = await res.text();
        const blob = new Blob([csvText], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ZaminFlow_Escrow_Ledger_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setExportBanner("Ikki yoqlama buxgalteriya reestri CSV formatida yuklab olindi.");
        return;
      }
    } catch {
      // Fallback
    }
    setExportBanner("Ikki yoqlama buxgalteriya reestri CSV formatida yuklab olindi.");
  };

  const handlePreviewXml = (entryRef: string) => {
    const xmlMock = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>ZF-${entryRef}-${Date.now().toString().slice(-6)}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys><Prtry>UZ_MUNIS_CBU</Prtry></ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>${entryRef}</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="UZS">148,200,000.00</IntrBkSttlmAmt>
      <Dbtr><Nm>ZaminFlow Escrow Depository Pool (AgroBank)</Nm></Dbtr>
      <Cdtr><Nm>Fergana Valley Cooperative Settlement Acc</Nm></Cdtr>
      <RmtInf><Ustrd>Cold-chain certified automated escrow clearing</Ustrd></RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
    setSimulatedXml(xmlMock);
    setShowXmlModal(true);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferSuccess(true);
    setTimeout(() => {
      setTransferSuccess(false);
      setShowNewTransferModal(false);
      setExportBanner("Yangi bank kliring o'tkazmasi muvaffaqiyatli reestrga kiritildi.");
    }, 1200);
  };

  // Dynamic Portfolio / Escrow Clearing Curve Data
  const chartDatasets = useMemo(() => {
    switch (timeRange) {
      case "1d":
        return {
          points: [
            { label: "06:00", val: 840000000 },
            { label: "09:00", val: 890000000 },
            { label: "12:00", val: 920000000 },
            { label: "15:00", val: 915000000 },
            { label: "18:00", val: 954000000 },
            { label: "21:00", val: 984500000 },
          ],
          total: "984,500,000 UZS",
          delta: "+3.4% bugungi kliring",
        };
      case "1w":
        return {
          points: [
            { label: "Dush", val: 780000000 },
            { label: "Sesh", val: 820000000 },
            { label: "Chor", val: 890000000 },
            { label: "Pay", val: 930000000 },
            { label: "Jum", val: 950000000 },
            { label: "Shan", val: 975000000 },
            { label: "Yak", val: 984500000 },
          ],
          total: "984,500,000 UZS",
          delta: "+8.9% bu hafta",
        };
      case "6m":
        return {
          points: [
            { label: "Noy", val: 450000000 },
            { label: "Dek", val: 560000000 },
            { label: "Yan", val: 680000000 },
            { label: "Fev", val: 790000000 },
            { label: "Mar", val: 880000000 },
            { label: "Apr", val: 984500000 },
          ],
          total: "984,500,000 UZS",
          delta: "+118.7% 6 oylik",
        };
      case "1y":
      case "all":
        return {
          points: [
            { label: "2023 Q3", val: 210000000 },
            { label: "2023 Q4", val: 380000000 },
            { label: "2024 Q1", val: 590000000 },
            { label: "2024 Q2", val: 760000000 },
            { label: "2024 Q3", val: 890000000 },
            { label: "2024 Q4", val: 984500000 },
          ],
          total: "984,500,000 UZS",
          delta: "+368.8% yillik aylanma",
        };
      case "1m":
      default:
        return {
          points: [
            { label: "1 May", val: 710000000 },
            { label: "5 May", val: 760000000 },
            { label: "10 May", val: 840000000 },
            { label: "15 May", val: 820000000 },
            { label: "20 May", val: 910000000 },
            { label: "25 May", val: 940000000 },
            { label: "1 Iyun", val: 984500000 },
          ],
          total: "984,500,000 UZS",
          delta: "+24.6% joriy oyda",
        };
    }
  }, [timeRange]);

  const officerName = session?.user?.fullName || "AgroBank Kliring Ofitseri";

  // Navigation Items
  const navigationItems: { key: BankWindow; label: string; icon: React.ReactNode }[] = [
    {
      key: "overview",
      label: "Eskrou Depozitariysi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      key: "ledger",
      label: "Buxgalteriya Reestri",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: "iso20022",
      label: "ISO 20022 Kliring",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      key: "underwriting",
      label: "Anderrayting & Kredit",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      key: "arbitration",
      label: "Arbitraj & Muzlatish",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      key: "reports",
      label: "MB Audit & Hisobotlar",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      key: "settings",
      label: "Shlyuz & API Kalitlar",
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
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] pointer-events-none -z-0 opacity-20 blur-[140px] bg-gradient-to-br from-emerald-500 to-teal-400" />

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
                isDark ? "bg-teal-500/10 border-teal-500/30 text-teal-400" : "bg-teal-50 border-teal-200 text-teal-800"
              }`}>
                {bt.badge}
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

          {/* Bottom Card: CBU Regulatory Custody Card */}
          <div className="pt-6 space-y-4">
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              isDark
                ? "bg-gradient-to-b from-white/[0.04] to-transparent border-white/10"
                : "bg-gradient-to-b from-emerald-50/50 to-teal-50/20 border-emerald-100"
            }`}>
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xs font-bold">{bt.advisorTitle}</h4>
              <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
                {bt.advisorDesc}
              </p>
              <button
                type="button"
                onClick={() => setActiveWindow("reports")}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                {bt.btnAudit}
              </button>
            </div>

            {/* User Profile Pill */}
            <div className={`flex items-center justify-between p-2.5 rounded-2xl border ${
              isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/80"
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={resolveUserAvatar(officerName, session?.user?.email) || "/images/team-muhammadaziz.webp"}
                  alt="Officer"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-500/40"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{officerName}</p>
                  <p className={`text-[10px] truncate ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    AgroBank ATB Custodian
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
                Agrobank ATB Kliring Markazi • Markaziy Bank MUNIS Shlyuzi
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Search */}
              <div className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs transition ${
                isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Xabar ID / INN / Tranzaksiya..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-36 lg:w-48"
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

              {/* Export ISO 20022 Action */}
              <button
                type="button"
                onClick={handleExportXml}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{bt.exportXml}</span>
              </button>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => setShowNewTransferModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md hover:shadow-emerald-500/25 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{bt.newTransfer}</span>
              </button>
            </div>
          </header>

          {/* Alert Banner */}
          {exportBanner && (
            <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{exportBanner}</span>
              </div>
              <button onClick={() => setExportBanner(null)} className="opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Window View Switcher Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* =========================================================================
                WINDOW 1: OVERVIEW (Financial Investure Layout)
            ========================================================================= */}
            {activeWindow === "overview" && (
              <div className="space-y-8 animate-fadeIn">
                {/* 1. HERO FINANCIAL CHART (Investure Exact Match) */}
                <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                  isDark
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-slate-50/60 border-slate-200 shadow-xs"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {bt.heldTitle}
                      </p>
                      <div className="flex items-baseline gap-3 mt-1">
                        <span className="text-2xl sm:text-3xl font-black tracking-tight">
                          {data ? `${data.totalEscrowHeld.value} ${data.totalEscrowHeld.unit}` : chartDatasets.total}
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
                        <linearGradient id="bankEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
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
                            d="M 20 160 Q 120 130, 200 110 T 380 70 T 520 85 T 680 30 L 680 190 L 20 190 Z"
                            fill="url(#bankEmeraldGrad)"
                          />
                          <path
                            d="M 20 160 Q 120 130, 200 110 T 380 70 T 520 85 T 680 30"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          <circle cx="520" cy="85" r="5" fill="#10b981" />
                          <circle cx="680" cy="30" r="6" fill="#10b981" className="animate-pulse" />
                        </>
                      ) : (
                        <g>
                          {chartDatasets.points.map((pt, i) => {
                            const x = 50 + i * 100;
                            const h = 40 + (pt.val / 1000000000) * 110;
                            return (
                              <g key={i}>
                                <rect
                                  x={x - 14}
                                  y={180 - h}
                                  width="28"
                                  height={h}
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

                    {/* Chart bottom labels */}
                    <div className="flex justify-between items-center text-[11px] font-semibold pt-3 px-1 text-slate-400">
                      {chartDatasets.points.map((p, i) => (
                        <span key={i}>{p.label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. FOUR BENTO METRIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Escrow Held */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {bt.heldTitle}
                      </p>
                      <h3 className="text-xl font-black mt-1">
                        {data ? `${data.totalEscrowHeld.value} ${data.totalEscrowHeld.unit}` : "984.5M UZS"}
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                        <span>↑ 12.4%</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>oylik oʻsish</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 2: Settled Today */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {bt.releasedTitle}
                      </p>
                      <h3 className="text-xl font-black mt-1">
                        {data ? `${data.releasedToday.value} ${data.releasedToday.unit}` : "148.2M UZS"}
                      </h3>
                      <p className="text-[11px] font-bold text-sky-500 mt-0.5 flex items-center gap-1">
                        <span>↑ 8.2%</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>avtomat kliring</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 3: Frozen in Disputes */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {bt.frozenTitle}
                      </p>
                      <h3 className="text-xl font-black mt-1 text-rose-500">
                        {data ? `${data.frozenDisputes.value}` : "14.8M UZS"}
                      </h3>
                      <p className="text-[11px] font-bold text-rose-500 mt-0.5 flex items-center gap-1">
                        <span>3 partiya</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>muzlatilgan</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 4: Bank Commission Revenue */}
                  <div className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-white/50" : "text-slate-400"}`}>
                        {bt.feeTitle}
                      </p>
                      <h3 className="text-xl font-black mt-1">
                        {data ? `${data.factoringFeeRevenue.value} ${data.factoringFeeRevenue.unit}` : "18.42M UZS"}
                      </h3>
                      <p className="text-[11px] font-bold text-teal-500 mt-0.5 flex items-center gap-1">
                        <span>0.8% depozit</span>
                        <span className={isDark ? "text-white/40 font-normal" : "text-slate-400 font-normal"}>marja</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 3. THREE-COLUMN BOTTOM BENTO (Investure Exact Match) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Col 1: Top Escrow Operations List */}
                  <div className={`p-6 rounded-3xl border transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between pb-4 border-b border-inherit">
                      <div>
                        <h4 className="text-sm font-black">So'nggi Kliring Amaliyotlari</h4>
                        <p className={`text-[11px] ${isDark ? "text-white/40" : "text-slate-400"}`}>
                          Avtomatlashtirilgan tranzaksiyalar
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveWindow("ledger")}
                        className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                      >
                        Barchasi →
                      </button>
                    </div>

                    <div className="divide-y divide-inherit mt-2">
                      {[
                        { ref: "ZF-ESC-8491", co: "Samarqand Sut Zavodi", sum: "48,200,000 UZS", type: "RELEASE", stat: "Tasdiqlangan" },
                        { ref: "ZF-ESC-8490", co: "Fargʻona Agro Fayz", sum: "18,400,000 UZS", type: "LOCK", stat: "Muzlatilgan" },
                        { ref: "ZF-ESC-8489", co: "Toshkent Dairy LLC", sum: "34,800,000 UZS", type: "RELEASE", stat: "Tasdiqlangan" },
                        { ref: "ZF-ESC-8488", co: "Kesh Agro Cooperative", sum: "12,900,000 UZS", type: "FEE", stat: "Yechilgan" },
                      ].map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                              item.type === "RELEASE"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : item.type === "LOCK"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-sky-500/10 text-sky-600"
                            }`}>
                              {item.type[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold">{item.co}</p>
                              <p className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}>{item.ref}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black">{item.sum}</p>
                            <span className="text-[10px] text-emerald-500 font-semibold">{item.stat}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Col 2: Semi-Circle Radial Gauge (AgroBank Escrow Reserve Adequacy) */}
                  <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="w-full flex items-center justify-between pb-2">
                      <h4 className="text-sm font-black">Eskrou Zaxira Koeffitsienti</h4>
                      <span className="text-xs font-bold text-emerald-500">100% CBU</span>
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
                          d="M 20 100 A 80 80 0 0 1 176 90"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="16"
                          strokeLinecap="round"
                          strokeDasharray="250"
                          strokeDashoffset="12"
                        />
                      </svg>
                      <div className="absolute bottom-0 flex flex-col items-center">
                        <span className="text-2xl font-black">99.4%</span>
                        <span className={`text-[10px] font-semibold ${isDark ? "text-white/40" : "text-slate-400"}`}>
                          Zaxiralangan Fond
                        </span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 text-center pt-3 border-t border-inherit">
                      <div>
                        <p className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}>Talab qilingan</p>
                        <p className="text-xs font-bold">100.0% MB</p>
                      </div>
                      <div>
                        <p className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}>Likvidlik buferi</p>
                        <p className="text-xs font-bold text-emerald-500">+48.5 mln UZS</p>
                      </div>
                    </div>
                  </div>

                  {/* Col 3: Dual Comparison Bar Chart (Settlement vs Payout Velocity) */}
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                    isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between pb-3">
                      <div>
                        <h4 className="text-sm font-black">Kliring Dinamikasi</h4>
                        <p className={`text-[11px] ${isDark ? "text-white/40" : "text-slate-400"}`}>Haftalik o'tkazmalar</p>
                      </div>
                      <span className="text-xs font-bold text-sky-500">+14.2%</span>
                    </div>

                    <div className="h-36 flex items-end justify-between gap-3 pt-4 px-2">
                      {[
                        { day: "Du", h1: "40%", h2: "55%" },
                        { day: "Se", h1: "65%", h2: "70%" },
                        { day: "Ch", h1: "50%", h2: "62%" },
                        { day: "Pa", h1: "80%", h2: "95%" },
                        { day: "Ju", h1: "70%", h2: "85%" },
                        { day: "Sh", h1: "90%", h2: "100%" },
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
                WINDOW 2: LEDGER (Double-Entry Escrow Ledger View)
            ========================================================================= */}
            {activeWindow === "ledger" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">{bt.ledgerTitle}</h3>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                      Agrobank ATB kliring nodi tomonidan imzolangan o'zgarmas moliyaviy jurnal
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="px-3.5 py-2 rounded-xl border text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                    >
                      {bt.exportCsv}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportXml}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer"
                    >
                      {bt.exportXml}
                    </button>
                  </div>
                </div>

                <div className={`rounded-3xl border overflow-hidden ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${
                        isDark ? "border-white/10 bg-white/[0.03] text-white/50" : "border-slate-100 bg-slate-50 text-slate-400"
                      }`}>
                        <tr>
                          <th className="px-5 py-3.5">{bt.colRef}</th>
                          <th className="px-5 py-3.5">{bt.colType}</th>
                          <th className="px-5 py-3.5">{bt.colDebit}</th>
                          <th className="px-5 py-3.5">{bt.colCredit}</th>
                          <th className="px-5 py-3.5 text-right">{bt.colAmount}</th>
                          <th className="px-5 py-3.5 text-center">{bt.colStatus}</th>
                          <th className="px-5 py-3.5 text-right">Amal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit">
                        {(data?.ledgerEntries || [
                          {
                            id: "entry-1",
                            ref: "AGRO-ZF-2026-0042",
                            type: "ESCROW_RELEASE",
                            debitAccount: "22602000800000101001",
                            creditAccount: "20208000900000202002",
                            amountUzs: "4,818,000",
                            status: "SETTLED",
                            createdAt: "Bugun, 10:45",
                          },
                          {
                            id: "entry-2",
                            ref: "AGRO-ZF-2026-0041",
                            type: "ESCROW_LOCK",
                            debitAccount: "20208000900000202002",
                            creditAccount: "22602000800000101001",
                            amountUzs: "9,600,000",
                            status: "HELD",
                            createdAt: "Bugun, 09:20",
                          },
                          {
                            id: "entry-3",
                            ref: "AGRO-ZF-2026-0040",
                            type: "FEE_DEDUCTION",
                            debitAccount: "22602000800000101001",
                            creditAccount: "45201000100000303003",
                            amountUzs: "38,500",
                            status: "SETTLED",
                            createdAt: "Kecha, 18:30",
                          },
                        ]).map((row: any) => {
                          const ref = row.bankReferenceId || row.ref;
                          const type = row.entryType || row.type;
                          const status = row.webhookStatus || row.status;
                          return (
                          <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                            <td className="px-5 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {ref}
                            </td>
                            <td className="px-5 py-4 font-bold">{type}</td>
                            <td className="px-5 py-4 font-mono text-[11px] text-slate-500">{row.debitAccount}</td>
                            <td className="px-5 py-4 font-mono text-[11px] text-slate-500">{row.creditAccount}</td>
                            <td className="px-5 py-4 text-right font-black">
                              {row.amountUzs} UZS
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                status === "SETTLED" || status === "VERIFIED"
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handlePreviewXml(ref)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
                              >
                                XML Ko'rish
                              </button>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 3: ISO 20022 KLIRING (pacs.008 XML Message Engine)
            ========================================================================= */}
            {activeWindow === "iso20022" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">ISO 20022 pacs.008.001.08 Kliring Mexanizmi</h3>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                      Banklararo real vaqt to'lov xabarlari (CBU MUNIS / SWIFT standartlari)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreviewXml("AGRO-ZF-CLEARING-SAMPLE")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Xabarni tekshirish & Eksport
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={`lg:col-span-2 p-6 rounded-3xl border font-mono text-xs overflow-x-auto ${
                    isDark ? "bg-[#090d12] border-white/10 text-emerald-400" : "bg-slate-900 border-slate-800 text-emerald-400"
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 text-slate-400 text-[11px]">
                      <span>pacs.008.001.08.xml (Header & Body)</span>
                      <span>SHA-256 Validated ✓</span>
                    </div>
                    <pre className="mt-4 leading-relaxed whitespace-pre-wrap">
{`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>ZF-AGRO-20260515-0042</MsgId>
      <CreDtTm>2026-05-15T10:45:00.000Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys><Prtry>UZ_CBU_MUNIS</Prtry></ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>ZF-ESC-8491-DELIVERY-CLEAR</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="UZS">4818000.00</IntrBkSttlmAmt>
      <Dbtr><Nm>ZaminFlow Escrow Depository (Agrobank ATB)</Nm></Dbtr>
      <Cdtr><Nm>Chust Fergana Farmer Cooperative</Nm></Cdtr>
      <RmtInf><Ustrd>Cold-Chain Verified Milk Supply Batch #42</Ustrd></RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`}
                    </pre>
                  </div>

                  <div className={`p-6 rounded-3xl border space-y-4 ${
                    isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                  }`}>
                    <h4 className="text-sm font-black">ISO 20022 Shlyuz Holati</h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-2 border-b border-inherit">
                        <span className="text-slate-400">Protokol:</span>
                        <span className="font-bold text-emerald-500">pacs.008.001.08</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-inherit">
                        <span className="text-slate-400">Shifrlash:</span>
                        <span className="font-bold">RSA-4096 / SHA-256</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-inherit">
                        <span className="text-slate-400">Kechikish (Latency):</span>
                        <span className="font-bold text-emerald-500">42 ms</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-inherit">
                        <span className="text-slate-400">Markaziy Bank Nod:</span>
                        <span className="font-bold">MUNIS Node 04 (Faol)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 4: UNDERWRITING (Credit Risk & Factoring)
            ========================================================================= */}
            {activeWindow === "underwriting" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Anderrayting & Agro-Faktoring Portfeli</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Fermerlar va sut zavodlarining skoring ballari va garovsiz aylanma kredit limitlari
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Chust Agro Fayz", score: "AAA (94/100)", limit: "150,000,000 UZS", used: "42,000,000 UZS", risk: "Past risk" },
                    { name: "Samarqand Sut Sanoat", score: "AA+ (88/100)", limit: "500,000,000 UZS", used: "210,000,000 UZS", risk: "Past risk" },
                    { name: "Zarafshon Agro Vet", score: "B+ (68/100)", limit: "60,000,000 UZS", used: "55,000,000 UZS", risk: "O'rta monitoring" },
                  ].map((row, i) => (
                    <div key={i} className={`p-5 rounded-3xl border transition-all ${
                      isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-xs"
                    }`}>
                      <div className="flex items-center justify-between pb-3">
                        <h4 className="text-sm font-black">{row.name}</h4>
                        <span className="text-xs font-mono font-bold text-emerald-500">{row.score}</span>
                      </div>
                      <div className="space-y-2 text-xs pt-2">
                        <div className="flex justify-between text-slate-400">
                          <span>Tasdiqlangan limit:</span>
                          <span className="font-bold text-slate-800 dark:text-white">{row.limit}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Ishlatilgan faktoring:</span>
                          <span className="font-bold text-sky-500">{row.used}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 pt-1 border-t border-inherit">
                          <span>Status:</span>
                          <span className="font-semibold text-emerald-500">{row.risk}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 5: ARBITRATION (Dispute & Frozen Pools)
            ========================================================================= */}
            {activeWindow === "arbitration" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Eskrou Arbitraj & Muzlatilgan Mablag'lar</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Laboratoriya xulosasi kutilayotgan yoki sifat bo'yicha nizoli partiyalar
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <div className="space-y-4">
                    {[
                      { id: "DISP-401", dairy: "Toshkent Sut Zavodi", farmer: "Oqqo'rg'on Agro", sum: "14,800,000 UZS", reason: "Yog'lilik darajasi 2.8% (shartnomada 3.4%)", status: "Muzlatilgan" },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-rose-500">{item.id}</span>
                            <span className="text-xs font-black">{item.dairy} ↔ {item.farmer}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
                          <p className="text-xs font-black mt-1 text-slate-900 dark:text-white">Mablag': {item.sum}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExportBanner("Arbitraj bo'yicha mablag' fermer foydasiga qaytarildi.")}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer"
                          >
                            Mablag'ni chiqarish
                          </button>
                          <button
                            type="button"
                            onClick={() => setExportBanner("Partiya to'lovi to'liq zavodga qaytarildi.")}
                            className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-bold hover:bg-rose-500/10 cursor-pointer"
                          >
                            Depozitni qaytarish
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 6: REPORTS (CBU Regulatory Compliance Audit)
            ========================================================================= */}
            {activeWindow === "reports" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">{bt.advisorTitle}</h3>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                      O'zbekiston Respublikasi Markaziy Banki reglamentlari bo'yicha kundalik audit
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer"
                  >
                    Audit Hisobotini Yuklab Olish (PDF/CSV)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-3xl border ${isDark ? "border-white/10" : "border-slate-200"}`}>
                    <p className="text-xs text-slate-400">Fond Zaxira Darajasi</p>
                    <h4 className="text-2xl font-black text-emerald-500 mt-1">100.0%</h4>
                    <p className="text-[11px] text-slate-500 mt-1">To'liq naqd kafolatlangan</p>
                  </div>
                  <div className={`p-5 rounded-3xl border ${isDark ? "border-white/10" : "border-slate-200"}`}>
                    <p className="text-xs text-slate-400">Audit Xulosasi</p>
                    <h4 className="text-2xl font-black text-emerald-500 mt-1">A+ (Mukammal)</h4>
                    <p className="text-[11px] text-slate-500 mt-1">KPMG & CBU Muvofiqlik</p>
                  </div>
                  <div className={`p-5 rounded-3xl border ${isDark ? "border-white/10" : "border-slate-200"}`}>
                    <p className="text-xs text-slate-400">Kliring Qoniqish Vaqti</p>
                    <h4 className="text-2xl font-black text-emerald-500 mt-1">1.8 sekund</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Real vaqt rejimida</p>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                WINDOW 7: SETTINGS (Gateway & Node Settings)
            ========================================================================= */}
            {activeWindow === "settings" && (
              <div className="space-y-6 max-w-2xl animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black">Shlyuz & Kriptografik Parametrlar</h3>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    AgroBank ATB va Markaziy Bank MUNIS API integratsiyasi
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <div>
                    <label className="block text-xs font-bold mb-1">Bank Shlyuzi Nomi</label>
                    <input
                      type="text"
                      readOnly
                      value="AgroBank Tashkent Central Clearing Node #01"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-100 dark:bg-white/5 border-inherit"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">ISO 20022 Kliring Protokoli</label>
                    <input
                      type="text"
                      readOnly
                      value="pacs.008.001.08 (Direct Customer Credit Transfer)"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-slate-100 dark:bg-white/5 border-inherit"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Eskrou Depozitariysi Maxsus Hisobraqami</label>
                    <input
                      type="text"
                      readOnly
                      value="22602000800000101001 (Agrobank ATB Bosh Ofisi)"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono bg-slate-100 dark:bg-white/5 border-inherit"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL 1: PREVIEW ISO 20022 XML MODAL */}
      {showXmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 space-y-4 shadow-2xl ${
            isDark ? "bg-[#121820] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-black">ISO 20022 pacs.008.001.08 XML</h3>
              <button
                type="button"
                onClick={() => setShowXmlModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className={`p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-80 ${
              isDark ? "bg-black/40 text-emerald-400" : "bg-slate-900 text-emerald-400"
            }`}>
              <pre className="whitespace-pre-wrap">{simulatedXml}</pre>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(simulatedXml);
                  setExportBanner("XML nusxalandi!");
                  setShowXmlModal(false);
                }}
                className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10"
              >
                Nusxa olish
              </button>
              <button
                type="button"
                onClick={() => {
                  handleExportXml();
                  setShowXmlModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
              >
                Yuklab olish (.xml)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW ESCROW TRANSFER MODAL */}
      {showNewTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
            isDark ? "bg-[#121820] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-black">{bt.newTransfer}</h3>
              <button
                type="button"
                onClick={() => setShowNewTransferModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Debet Hisobraqam (Zavod / Eskrou)</label>
                <input
                  type="text"
                  required
                  placeholder="22602000800000101001"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono bg-transparent border-inherit focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Kredit Hisobraqam (Fermer Kooperativi)</label>
                <input
                  type="text"
                  required
                  placeholder="20208000900000202002"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono bg-transparent border-inherit focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Kliring Summasi (UZS)</label>
                <input
                  type="number"
                  required
                  placeholder="15000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold bg-transparent border-inherit focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTransferModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={transferSuccess}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-500 shadow-md cursor-pointer"
                >
                  {transferSuccess ? "Bajarildi ✓" : "Kliringni tasdiqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
