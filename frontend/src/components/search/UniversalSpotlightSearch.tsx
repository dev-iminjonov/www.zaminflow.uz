"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { getKybDossiers, getAdminUsers } from "@/lib/adminStore";
import { INITIAL_MOCK_USERS } from "@/lib/mocks/users/mockUsersData";

export interface SearchResultItem {
  id: string;
  category: "organizations" | "dossiers" | "users" | "batches" | "navigation";
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon?: string;
  action?: () => void;
  href?: string;
}

interface UniversalSpotlightSearchProps {
  placeholder?: string;
  role?: "farmer" | "dairy" | "driver" | "bank" | "admin";
  onSelectAction?: (item: SearchResultItem) => void;
  className?: string;
}

export default function UniversalSpotlightSearch({
  placeholder,
  role = "admin",
  onSelectAction,
  className = "",
}: UniversalSpotlightSearchProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const { locale } = useLanguage();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default localized placeholders
  const defaultPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;

    if (locale === "ru") {
      if (role === "admin") return "Поиск организаций, ИНН, досье...";
      if (role === "bank") return "Поиск по эскроу, ИНН, расчетам...";
      if (role === "dairy") return "Поиск партий, договоров, ферм...";
      if (role === "driver") return "Поиск маршрутов, цистерн, накладных...";
      return "Поиск партий молока, выплат, анализов...";
    }

    if (locale === "uz") {
      if (role === "admin") return "Tashkilotlar, STIR, dosyelarni qidirish...";
      if (role === "bank") return "Eskrou, STIR, hisob-kitoblarni qidirish...";
      if (role === "dairy") return "Partiyalar, shartnomalar, fermalarni qidirish...";
      if (role === "driver") return "Marshrutlar, sisternalar, yuk xatlarini qidirish...";
      return "Sut partiyalari, tölovlar, laboratoriya tahlillari...";
    }

    if (role === "admin") return "Search organizations, STIR, dossiers...";
    if (role === "bank") return "Search ledger, STIR, facilities, escrow...";
    if (role === "dairy") return "Search batches, contracts, trucks, farms...";
    if (role === "driver") return "Search routes, tankers, waybills, factories...";
    return "Search milk batches, payouts, lab tests...";
  }, [placeholder, role, locale]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Built-in searchable data pool
  const searchableData: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. Navigation items based on role
    const navConfigs: Record<string, Array<{ title: string; subtitle: string; href: string; badge: string; icon: string }>> = {
      admin: [
        { title: "Foydalanuvchilar va Maʼmurlar", subtitle: "Barcha foydalanuvchilar, rollar va boshqaruv", href: "/users", badge: "Modul", icon: "👥" },
        { title: "Yangi Foydalanuvçi Qöşiş", subtitle: "Tizimga yangi xodim yoki mijoz kiritish", href: "/users/new", badge: "Yangi", icon: "➕" },
        { title: "KYB Korxona Tekshiruvlari", subtitle: "Yuridik shaxslar litsenziyasi va STIR tekshiruvi", href: "/dashboard/admin", badge: "Nazorat", icon: "📑" },
        { title: "AgroBank Eskrou & Kliring", subtitle: "Xavfsiz hisob-kitoblar va depozitlar", href: "/dashboard/bank", badge: "Moliya", icon: "🏦" },
        { title: "Sut Korxonalari Boshqaruvi", subtitle: "Qayta ishlash zavodlari monitoringi", href: "/dashboard/dairy", badge: "Zavod", icon: "🏭" },
      ],
      farmer: [
        { title: "Fermer Boshqaruv Paneli", subtitle: "Asosiy köriniş va jonli statistika", href: "/dashboard/farmer", badge: "Asosiy", icon: "🌾" },
        { title: "Mening Sutim & Partiyalar", subtitle: "Kunlik soğim va sotuvga qöyilgan partiyalar", href: "/dashboard/farmer/my-milk", badge: "Mahsulot", icon: "🥛" },
        { title: "Yetkazib Berishlar & Logistika", subtitle: "Sut tashuvchi mashinalar va marshrutlar", href: "/dashboard/farmer/deliveries", badge: "Logistika", icon: "🚚" },
        { title: "Hisob-kitob & Tölovlar", subtitle: "AgroBank hamyoni va tuşgan mablağlar", href: "/dashboard/farmer/payouts", badge: "Moliya", icon: "💳" },
      ],
      dairy: [
        { title: "Zavod Boshqaruv Paneli", subtitle: "Asosiy köriniş va xomaşyo oqimi", href: "/dashboard/dairy", badge: "Asosiy", icon: "🏭" },
        { title: "Fermer Shartnomalari", subtitle: "B2B taʼminot shartnomalari va buyurtmalar", href: "/dashboard/dairy", badge: "Shartnoma", icon: "📝" },
        { title: "Sut Sifat Laboratoriyasi", subtitle: "Yoğlilik, ziçlik va mikrobiologik tahlillar", href: "/dashboard/dairy", badge: "Laboratoriya", icon: "🔬" },
      ],
      driver: [
        { title: "Haydovchi Marshrutlari", subtitle: "Kunlik qabul va yetkazish nuqtalari", href: "/dashboard/driver", badge: "Marshrut", icon: "🚚" },
        { title: "Raqamli Yuk Xatlari (Waybill)", subtitle: "GPS va IoT harorat datchiklari nazorati", href: "/dashboard/driver", badge: "Yuk xati", icon: "📋" },
      ],
      bank: [
        { title: "AgroBank Moliya Portali", subtitle: "Eskrou hisoblar va avtomatik tölovlar", href: "/dashboard/bank", badge: "Eskrou", icon: "🏦" },
        { title: "Tranzaksiyalar & Audit Jurnali", subtitle: "Blokçeyn asosidagi şaffof ötkazmalar", href: "/dashboard/bank", badge: "Kliring", icon: "📊" },
      ],
    };

    const roleNavs = navConfigs[role] || navConfigs.admin;
    roleNavs.forEach((n, idx) => {
      items.push({
        id: `nav-${idx}`,
        category: "navigation",
        title: n.title,
        subtitle: n.subtitle,
        badge: n.badge,
        badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: n.icon,
        href: n.href,
      });
    });

    // 2. Dossiers from store
    try {
      const dossiers = getKybDossiers();
      dossiers.forEach((d) => {
        items.push({
          id: `dos-${d.id}`,
          category: "dossiers",
          title: d.organizationName,
          subtitle: `STIR: ${d.taxId} • ${d.directorName} • ${d.region}`,
          badge: d.status.toUpperCase(),
          badgeColor:
            d.status === "approved"
              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
              : d.status === "rejected"
              ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
              : "bg-amber-500/15 text-amber-600 border-amber-500/30",
          icon: "📑",
          href: `/dashboard/admin/verification/${d.applicantKey}`,
        });
      });
    } catch {}

    // 3. Admin Users / Directory
    try {
      const users = getAdminUsers();
      users.forEach((u) => {
        items.push({
          id: `adm-${u.id}`,
          category: "organizations",
          title: u.legalName,
          subtitle: `Vakil: ${u.fullName} • STIR: ${u.taxId} • ${u.region}`,
          badge: u.role.toUpperCase(),
          badgeColor: "bg-purple-500/15 text-purple-600 border-purple-500/30",
          icon: "🏢",
          href: `/users?q=${encodeURIComponent(u.legalName)}`,
        });
      });
    } catch {}

    // 4. Platform User Directory (Directly opens User Details card)
    INITIAL_MOCK_USERS.forEach((u) => {
      items.push({
        id: `usr-${u.id}`,
        category: "users",
        title: `${u.firstName} ${u.lastName}`,
        subtitle: `@${u.username} • ${u.email} • ${u.role}`,
        badge: u.role,
        badgeColor: u.isAdmin
          ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
          : "bg-slate-500/15 text-slate-600 border-slate-500/30",
        icon: "👤",
        href: `/users/${u.id}`,
      });
    });

    return items;
  }, [role]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchableData
      .filter((item) => {
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchBadge = item.badge?.toLowerCase().includes(q);
        return matchTitle || matchSubtitle || matchBadge;
      })
      .slice(0, 8); // Top 8 matches
  }, [query, searchableData]);

  const handleSelect = (item: SearchResultItem) => {
    if (onSelectAction) {
      onSelectAction(item);
    } else if (item.href) {
      router.push(item.href);
    } else {
      router.push(`/users?q=${encodeURIComponent(item.title)}`);
    }
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      } else if (query.trim().length > 0) {
        router.push(`/users?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setQuery("");
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 1. MASTER PILL INPUT (Matches User's Reference Screenshot) */}
      <div
        className={`flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full border text-xs transition-all duration-200 cursor-text ${
          isDark
            ? "bg-white/[0.06] border-white/15 text-white focus-within:border-emerald-500 focus-within:bg-black/40 focus-within:ring-2 focus-within:ring-emerald-500/20"
            : "bg-slate-100/90 border-slate-200 text-slate-800 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-xs"
        }`}
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        {/* Emerald Search Icon */}
        <svg
          className={`w-4 h-4 shrink-0 transition-colors ${
            isDark ? "text-emerald-400" : "text-emerald-600"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Real Live Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={defaultPlaceholder}
          className="bg-transparent border-none outline-none text-xs w-48 sm:w-64 md:w-72 lg:w-80 max-w-full placeholder-slate-400 font-medium min-w-0 flex-1"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuery("");
              setIsOpen(false);
            }}
            className="w-4 h-4 rounded-full bg-slate-300 dark:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center text-[10px] hover:opacity-80 transition cursor-pointer"
            title="Tozalash"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. INSTANT SPOTLIGHT DROPDOWN RESULTS PALETTE */}
      {isOpen && query.trim().length > 0 && (
        <div
          className={`absolute left-0 right-0 sm:right-auto sm:w-[420px] top-full mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-fadeIn ${
            isDark
              ? "bg-[#141a22]/95 border-white/15 text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
              : "bg-white/95 border-slate-200 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-b flex items-center justify-between ${
              isDark ? "border-white/10 text-white/40" : "border-slate-100 text-slate-400"
            }`}
          >
            <span>Qidiruv Natijalari ({filteredResults.length})</span>
            <span>Tanlash: [Enter] • Yopish: [Esc]</span>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto py-1">
            {filteredResults.length > 0 ? (
              filteredResults.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-4 py-2.5 text-left flex items-start gap-3 transition cursor-pointer ${
                      isSelected
                        ? isDark
                          ? "bg-white/10"
                          : "bg-emerald-50 text-slate-900"
                        : isDark
                        ? "hover:bg-white/5"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{item.icon || "🔍"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${
                              item.badgeColor || "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isDark ? "text-white/50" : "text-slate-500"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center">
                <div className="text-2xl mb-1">🔍</div>
                <div className="text-xs font-bold">"{query}" boʻyicha natija topilmadi</div>
                <p className={`text-[11px] mt-1 ${isDark ? "text-white/40" : "text-slate-400"}`}>
                  Kompaniya nomi, STIR (TIN), partiya raqami yoki boshqaruv boʻlimlarini qidirib koʻring
                </p>
              </div>
            )}
          </div>

          {/* View in Users Directory Action */}
          {query.trim().length > 0 && (
            <div className={`p-2 border-t ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-100 bg-slate-50/50"}`}>
              <button
                type="button"
                onClick={() => {
                  router.push(`/users?q=${encodeURIComponent(query.trim())}`);
                  setIsOpen(false);
                  setQuery("");
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  isDark
                    ? "bg-white/10 hover:bg-white/15 text-white"
                    : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs"
                }`}
              >
                <span>"{query}" boʻyicha barcha foydalanuvchilarni koʻrish</span>
                <span className="text-emerald-500 font-bold">➔</span>
              </button>
            </div>
          )}

          {/* Footer Ribbon */}
          <div
            className={`px-4 py-2 border-t text-[10px] flex items-center justify-between ${
              isDark ? "border-white/10 bg-black/30 text-white/40" : "border-slate-100 bg-slate-50 text-slate-400"
            }`}
          >
            <span>ZaminFlow Global Qidiruv Shlyuzi</span>
            <span className="font-mono">CBU & Soliq.uz Indekslangan</span>
          </div>
        </div>
      )}
    </div>
  );
}
