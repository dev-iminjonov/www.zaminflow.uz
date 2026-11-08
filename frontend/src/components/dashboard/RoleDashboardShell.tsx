"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggleButton } from "@/context/ThemeContext";
import { AuthSession, getStoredSession, signOut } from "@/lib/auth";
import { resolveUserAvatar } from "@/lib/userAvatar";

type RolePortalKey = "farmer" | "dairy" | "driver" | "admin";

interface NavItem {
  href: string;
  label: string;
  matchPrefixes: string[];
  icon: React.ReactNode;
}

export default function RoleDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { locale, setLocale, dashT: t } = useLanguage();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
  }, [pathname]);

  // Root overview routes and profile routes already render their own Floating Master Canvas shell
  const cleanPath = pathname.replace(/\/+$/, "");
  const isSelfShelledRoute =
    cleanPath === "/dashboard" ||
    cleanPath === "/dashboard/farmer" ||
    cleanPath === "/dashboard/dairy" ||
    cleanPath === "/dashboard/driver" ||
    cleanPath === "/dashboard/bank" ||
    cleanPath === "/dashboard/admin" ||
    cleanPath.endsWith("/profile");

  if (isSelfShelledRoute) {
    return <>{children}</>;
  }

  // Determine active role from URL path
  let role: RolePortalKey = "farmer";
  if (cleanPath.startsWith("/dashboard/dairy")) {
    role = "dairy";
  } else if (cleanPath.startsWith("/dashboard/driver")) {
    role = "driver";
  } else if (cleanPath.startsWith("/dashboard/admin")) {
    role = "admin";
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const defaultNames: Record<RolePortalKey, string> = {
    farmer: "Muhammadaziz",
    dairy: "Malika",
    driver: "Bobur",
    admin: "Admin",
  };

  const roleBadgeLabels: Record<RolePortalKey, string> = {
    farmer: "Dairy Farmer ↗",
    dairy: "Dairy Partner ↗",
    driver: "Fleet Driver ↗",
    admin: "Super Admin ↗",
  };

  const portalEyebrows: Record<RolePortalKey, string> = {
    farmer: "FARMER PORTAL • FERMER BOSHQARUVI",
    dairy: "DAIRY INDUSTRY PORTAL • QAYTA ISHLASH KORXONASI",
    driver: "LOGISTICS DRIVER • HAYDOVCHI LOGISTIKA",
    admin: "SYSTEM ADMINISTRATION • TIZIM BOSHQARUVI",
  };

  const searchPlaceholders: Record<RolePortalKey, string> = {
    farmer: "Search batches, lab tests...",
    dairy: "Search batches, trucks...",
    driver: "Search routes, waybills...",
    admin: "Search organizations, dossiers...",
  };

  const firstName = session?.user?.fullName
    ? session.user.fullName.trim().split(" ").slice(-1)[0]
    : defaultNames[role];

  const navConfigs: Record<RolePortalKey, NavItem[]> = {
    farmer: [
      {
        href: "/dashboard/farmer",
        label: t.nav.overview,
        matchPrefixes: ["/dashboard/farmer"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/farmer/my-milk",
        label: t.nav.myMilk,
        matchPrefixes: [
          "/dashboard/farmer/my-milk",
          "/dashboard/farmer/list-supply",
          "/dashboard/farmer/batches",
        ],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
      {
        href: "/dashboard/farmer/deliveries",
        label: t.nav.deliveries,
        matchPrefixes: ["/dashboard/farmer/deliveries"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        ),
      },
      {
        href: "/dashboard/farmer/payouts",
        label: t.nav.payouts,
        matchPrefixes: ["/dashboard/farmer/payouts"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/farmer/dispute",
        label: "Arbitration",
        matchPrefixes: ["/dashboard/farmer/dispute"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        ),
      },
    ],
    dairy: [
      {
        href: "/dashboard/dairy",
        label: t.nav.overview,
        matchPrefixes: ["/dashboard/dairy"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/dairy/orders",
        label: t.nav.orders,
        matchPrefixes: [
          "/dashboard/dairy/orders",
          "/dashboard/dairy/place-order",
        ],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
      {
        href: "/dashboard/dairy/shipments",
        label: t.nav.shipments,
        matchPrefixes: [
          "/dashboard/dairy/shipments",
          "/dashboard/dairy/receive-batch",
        ],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        ),
      },
      {
        href: "/dashboard/dairy/escrow",
        label: t.nav.escrow,
        matchPrefixes: ["/dashboard/dairy/escrow"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/dairy/regional-pricing",
        label: "Economics",
        matchPrefixes: ["/dashboard/dairy/regional-pricing"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ],
    driver: [
      {
        href: "/dashboard/driver",
        label: t.nav.overview,
        matchPrefixes: ["/dashboard/driver"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/driver/my-trips",
        label: t.nav.myTrips,
        matchPrefixes: [
          "/dashboard/driver/my-trips",
          "/dashboard/driver/start-trip",
          "/dashboard/driver/confirm-pickup",
        ],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        ),
      },
      {
        href: "/dashboard/driver/route",
        label: t.nav.route,
        matchPrefixes: [
          "/dashboard/driver/route",
          "/dashboard/driver/report-issue",
        ],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        ),
      },
      {
        href: "/dashboard/driver/history",
        label: t.nav.history,
        matchPrefixes: ["/dashboard/driver/history"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
    admin: [
      {
        href: "/dashboard/admin",
        label: t.nav.overview,
        matchPrefixes: ["/dashboard/admin"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/admin/users",
        label: t.nav.users,
        matchPrefixes: ["/dashboard/admin/users"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/admin/verification",
        label: t.nav.verification,
        matchPrefixes: ["/dashboard/admin/verification"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/admin/disputes",
        label: t.nav.disputes,
        matchPrefixes: ["/dashboard/admin/disputes"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        ),
      },
    ],
  };

  const navItems = navConfigs[role];

  const isNavItemActive = (item: NavItem) => {
    if (item.href === `/dashboard/${role}`) {
      return cleanPath === `/dashboard/${role}`;
    }
    return item.matchPrefixes.some(
      (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
    );
  };

  return (
    <div className="min-h-screen bg-[#EAEFF0] dark:bg-[#0A1318] py-5 px-3 sm:px-6 transition-colors font-sans antialiased">
      {/* Unified Floating Master Canvas (matches FarmerOverview / DairyOverview / DriverOverview / AdminOverview) */}
      <div className="max-w-[1380px] mx-auto bg-white dark:bg-[#101E27] rounded-[36px] shadow-[0_20px_50px_rgba(15,40,30,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-white/5 p-4 sm:p-8 flex flex-col gap-6">
        {/* 1. TOP NAV BAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
          {/* Brand Logo */}
          <Link href={`/dashboard/${role}`} className="flex items-center shrink-0">
            <ZaminFlowLogo size="md" />
          </Link>

          {/* Navigation Pill Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-semibold">
            {navItems.map((item) => {
              const active = isNavItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "px-4 py-1.5 rounded-full bg-[#087a3c] text-white shadow-xs font-bold transition"
                      : "px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={`/dashboard/${role}/profile`}
              className="px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
            >
              Profile
            </Link>
          </nav>

          {/* Right Section: Search, Language Switcher, User Menu */}
          <div className="flex items-center gap-3">
            {/* Search Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-slate-400">{searchPlaceholders[role]}</span>
            </div>

            {/* Language Selector */}
            <div className="flex rounded-full p-0.5 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-bold">
              {(["uz", "ru", "en"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={`px-2 py-0.5 rounded-full uppercase transition cursor-pointer ${
                    locale === loc
                      ? "bg-[#12303a] text-white dark:bg-[#1B98E0] dark:text-[#13293D]"
                      : "text-slate-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* Theme Mode Toggle */}
            <ThemeToggleButton size="sm" />

            {/* User Profile Pill */}
            <Link
              href={`/dashboard/${role}/profile`}
              title="View Trading Profile"
              className="flex items-center gap-2 pl-2 hover:opacity-85 transition group"
            >
              {(() => {
                const avatar = resolveUserAvatar(
                  session?.user?.fullName || firstName,
                  session?.user?.email
                );
                return (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:ring-2 ring-emerald-500/50">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={firstName}
                        className="w-full h-full object-cover object-[center_18%]"
                      />
                    ) : (
                      <span>{firstName.charAt(0)}</span>
                    )}
                  </div>
                );
              })()}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {firstName}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                  {roleBadgeLabels[role]}
                </span>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              title={t.nav.signOut}
              className="p-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* 2. PORTAL EYEBROW + MOBILE PILL NAV */}
        <div className="flex flex-wrap items-center justify-between gap-2 -mb-2">
          <div className="text-[11px] font-bold tracking-widest text-[#087a3c] dark:text-[#22d36b] uppercase">
            {portalEyebrows[role]}
          </div>
          <div className="flex lg:hidden flex-wrap items-center gap-1.5">
            {navItems.map((item) => {
              const active = isNavItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "px-3 py-1 rounded-full bg-[#087a3c] text-white text-xs font-bold"
                      : "px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. MAIN DASHBOARD CONTENT WITH LEFT FLOATING DOCK */}
        <div className="flex gap-6 items-start">
          {/* Left Vertical Icon Dock */}
          <aside className="hidden xl:flex flex-col items-center gap-4 py-5 px-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shrink-0 select-none shadow-xs">
            {navItems.map((item) => {
              const active = isNavItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "w-10 h-10 rounded-full bg-[#087a3c] text-white flex items-center justify-center shadow-xs transition"
                      : "w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center justify-center transition"
                  }
                  title={item.label}
                >
                  {item.icon}
                </Link>
              );
            })}

            <div className="w-6 h-px bg-slate-200 dark:bg-white/10 my-1" />

            <button
              onClick={handleSignOut}
              className="w-10 h-10 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition cursor-pointer"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </aside>

          {/* Sub-Page Content Slot normalized into the Master Canvas */}
          <div className="zf-unified-subpage flex-1 w-full min-w-0">
            {children}
          </div>
        </div>
      </div>

      {/* Unified Sub-Page Style Normalization (Light + Dark Mode) */}
      <style jsx global>{`
        /* 1. Strip the legacy outer light-green gradient wrapper & duplicate top pill nav */
        .zf-unified-subpage > div {
          min-height: 0 !important;
          background: transparent !important;
          color: inherit !important;
        }
        .zf-unified-subpage > div > div {
          max-width: 100% !important;
          padding: 0 !important;
        }
        .zf-unified-subpage > div > div > nav:first-of-type {
          display: none !important;
        }
        .zf-unified-subpage > div > div > header:first-of-type {
          padding-top: 0 !important;
        }
        .zf-unified-subpage h1 {
          font-size: clamp(1.5rem, 2.4vw, 2rem) !important;
          line-height: 1.15 !important;
        }

        /* 2. Light Mode card & surface normalization (match Overview bg-slate-50 border-slate-200/70) */
        .zf-unified-subpage [class*="bg-[rgba(255,255,255"] {
          background-color: #f8fafc !important;
          border-color: rgba(226, 232, 240, 0.85) !important;
          box-shadow: 0 4px 20px rgba(15, 40, 30, 0.03) !important;
        }

        /* 3. Dark Mode card, typography, input, badge, and table normalization */
        html.dark .zf-unified-subpage [class*="bg-[rgba(255,255,255"],
        html.dark .zf-unified-subpage [class*="bg-white/80"],
        html.dark .zf-unified-subpage [class*="bg-white/90"] {
          background-color: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.09) !important;
          box-shadow: none !important;
          color: #f1f5f9 !important;
        }

        html.dark .zf-unified-subpage .bg-white {
          background-color: rgba(255, 255, 255, 0.06) !important;
          border-color: rgba(255, 255, 255, 0.14) !important;
          color: #f1f5f9 !important;
        }

        html.dark .zf-unified-subpage [class*="text-[#17352c]"],
        html.dark .zf-unified-subpage [class*="text-[#12303a]"] {
          color: #f8fafc !important;
        }

        html.dark .zf-unified-subpage [class*="text-[#4d6a60]"],
        html.dark .zf-unified-subpage [class*="text-[#33473f]"] {
          color: #94a3b8 !important;
        }

        html.dark .zf-unified-subpage [class*="text-[#087a3c]"] {
          color: #34d399 !important;
        }

        html.dark .zf-unified-subpage [class*="bg-[#12303a]"] {
          background-color: #087a3c !important;
          border-color: #10b981 !important;
          color: #ffffff !important;
        }

        html.dark .zf-unified-subpage [class*="bg-[#d9f7e5]"] {
          background-color: rgba(16, 185, 129, 0.16) !important;
          color: #6ee7b7 !important;
        }

        html.dark .zf-unified-subpage [class*="bg-[#fdf0d2]"] {
          background-color: rgba(245, 158, 11, 0.16) !important;
          color: #fcd34d !important;
        }

        html.dark .zf-unified-subpage [class*="bg-[#e6ecea]"],
        html.dark .zf-unified-subpage [class*="bg-[#f0f7f4]"] {
          background-color: rgba(255, 255, 255, 0.06) !important;
          color: #cbd5e1 !important;
        }

        html.dark .zf-unified-subpage input,
        html.dark .zf-unified-subpage select,
        html.dark .zf-unified-subpage textarea {
          background-color: rgba(15, 23, 42, 0.65) !important;
          border-color: rgba(255, 255, 255, 0.14) !important;
          color: #f8fafc !important;
        }

        html.dark .zf-unified-subpage table th,
        html.dark .zf-unified-subpage table td,
        html.dark .zf-unified-subpage tr {
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
      `}</style>
    </div>
  );
}
