"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, ThemeToggleButton } from "@/context/ThemeContext";
import { AuthSession, getStoredSession, signOut } from "@/lib/auth";
import { resolveUserAvatar } from "@/lib/userAvatar";
import UniversalSpotlightSearch from "@/components/search/UniversalSpotlightSearch";

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
  const { themeMode, isDark } = useTheme();
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
    farmer: "FARMER PORTAL",
    dairy: "DAIRY INDUSTRY PORTAL",
    driver: "LOGISTICS DRIVER",
    admin: "SYSTEM ADMINISTRATION",
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
        matchPrefixes: [
          "/dashboard/admin/verification",
          "/dashboard/admin/verifications",
        ],
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
      {
        href: "/dashboard/admin/audit",
        label: "Audit Vault",
        matchPrefixes: ["/dashboard/admin/audit"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/admin/analytics",
        label: "Analytics",
        matchPrefixes: ["/dashboard/admin/analytics"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
    <div className={`min-h-screen py-5 px-3 sm:px-6 relative overflow-x-hidden font-sans antialiased select-none transition-colors duration-300 ${
      isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f4fbfe] text-[#03045e]"
    }`}>
      {/* 1. AMBIENT DREAMLAND BACKDROP AURORAS */}
      <div className="absolute top-10 -left-40 w-[550px] h-[550px] pointer-events-none z-0">
        <div
          className={`w-full h-full rounded-full blur-[140px] animate-pulse ${
            isDark ? "opacity-25" : "opacity-35"
          }`}
          style={{ background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 40%, transparent 70%)" }}
        />
      </div>
      <div className="absolute bottom-10 -right-40 w-[550px] h-[550px] pointer-events-none z-0">
        <div
          className={`w-full h-full rounded-full blur-[140px] animate-pulse ${
            isDark ? "opacity-20" : "opacity-25"
          }`}
          style={{ background: "radial-gradient(circle, #00d3e0 0%, #0099ff 50%, transparent 70%)" }}
        />
      </div>

      {/* Subtle Dot Grid Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00d3e0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Unified Luxury Floating Master Canvas */}
      <div className={`relative z-10 max-w-[1380px] mx-auto rounded-[36px] border p-4 sm:p-8 flex flex-col gap-6 transition-colors duration-300 ${
        isDark
          ? "bg-[#14181d]/90 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,153,255,0.18)] border-white/10 text-[#E8F1F2]"
          : "bg-white/95 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,153,255,0.06)] border-[#ade8f4] text-[#03045e]"
      }`}>
        {/* 1. TOP NAV BAR */}
        <header className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
          isDark ? "border-white/10" : "border-[#ade8f4]/60"
        }`}>
          {/* Brand Logo */}
          <Link href={`/dashboard/${role}`} className="flex items-center shrink-0 transition-transform hover:scale-105">
            <ZaminFlowLogo mode={themeMode} size="md" />
          </Link>

          {/* Navigation Pill Tabs */}
          <nav className={`hidden lg:flex items-center gap-1.5 p-1 rounded-full border text-xs font-semibold backdrop-blur-md ${
            isDark ? "bg-white/5 border-white/10" : "bg-[#f4fbfe] border-[#ade8f4]"
          }`}>
            {navItems.map((item) => {
              const active = isNavItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "px-4 py-1.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] shadow-md font-black transition"
                      : isDark
                      ? "px-4 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition"
                      : "px-4 py-1.5 rounded-full text-[#0077b6] hover:text-[#03045e] hover:bg-white shadow-xs transition"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={`/dashboard/${role}/profile`}
              className={`px-4 py-1.5 rounded-full transition ${
                isDark ? "text-white/70 hover:text-white hover:bg-white/5" : "text-[#0077b6] hover:text-[#03045e] hover:bg-white shadow-xs"
              }`}
            >
              Profile
            </Link>
          </nav>

          {/* Right Section: Search, Language Switcher, User Menu */}
          <div className="flex items-center gap-3">
            {/* Live Interactive Search Pill */}
            <UniversalSpotlightSearch
              placeholder={searchPlaceholders[role]}
              role={role}
              className="hidden sm:block"
            />

            {/* Language Selector */}
            <div className={`flex rounded-full p-1 border text-[11px] font-bold ${
              isDark ? "border-white/10 bg-white/5" : "border-[#ade8f4] bg-[#f4fbfe]"
            }`} role="group" aria-label="Language selector">
              {(["uz", "ru", "en"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  aria-label={`Select language ${loc.toUpperCase()}`}
                  className={`px-2.5 py-0.5 rounded-full uppercase transition cursor-pointer ${
                    locale === loc
                      ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black shadow-xs"
                      : isDark ? "text-white/60 hover:text-white" : "text-slate-600 hover:text-slate-900"
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
              className="flex items-center gap-2 pl-2 hover:opacity-90 transition group"
            >
              {(() => {
                const avatar = resolveUserAvatar(
                  session?.user?.fullName || firstName,
                  session?.user?.email
                );
                return (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-[#00ffc8]/50">
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
                <span className={`text-xs font-bold leading-tight transition ${
                  isDark ? "text-white group-hover:text-[#00ffc8]" : "text-slate-900 group-hover:text-emerald-700"
                }`}>
                  {firstName}
                </span>
                <span className={`text-[10px] font-mono ${
                  isDark ? "text-[#00d3e0]" : "text-emerald-700 font-bold"
                }`}>
                  {roleBadgeLabels[role]}
                </span>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              title={t.nav.signOut}
              className={`p-2 rounded-full border transition cursor-pointer ${
                isDark ? "border-white/10 text-white/50 hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/10" : "border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* 2. PORTAL EYEBROW + MOBILE PILL NAV */}
        <div className="flex flex-wrap items-center justify-between gap-2 -mb-2">
          <div className={`text-[11px] font-black tracking-widest uppercase ${
            isDark ? "bg-gradient-to-r from-[#00ffc8] to-[#00d3e0] bg-clip-text text-transparent" : "text-emerald-800 font-extrabold"
          }`}>
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
                      ? "px-3 py-1 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] text-xs font-black shadow-xs"
                      : isDark
                      ? "px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold"
                      : "px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
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
          <aside className={`hidden xl:flex flex-col items-center gap-4 py-5 px-2.5 rounded-full border shrink-0 select-none shadow-xs backdrop-blur-md ${
            isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}>
            {navItems.map((item) => {
              const active = isNavItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "w-10 h-10 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] flex items-center justify-center shadow-md font-black transition"
                      : isDark
                      ? "w-10 h-10 rounded-full text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
                      : "w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                  }
                  title={item.label}
                >
                  {item.icon}
                </Link>
              );
            })}

            <div className={`w-6 h-px my-1 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

            <button
              onClick={handleSignOut}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${
                isDark ? "text-white/40 hover:text-red-400 hover:bg-red-500/10" : "text-slate-400 hover:text-red-600 hover:bg-red-50"
              }`}
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

      {/* Unified Sub-Page Style Normalization (Adaptive Dark & Light) */}
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

        /* 2. Dark Mode Specific Normalization */
        html.dark .zf-unified-subpage h1 {
          font-size: clamp(1.5rem, 2.4vw, 2rem) !important;
          line-height: 1.15 !important;
          color: #ffffff !important;
        }
        html.dark .zf-unified-subpage [class*="bg-[rgba(255,255,255"],
        html.dark .zf-unified-subpage [class*="bg-white/80"],
        html.dark .zf-unified-subpage [class*="bg-white/90"],
        html.dark .zf-unified-subpage .bg-white {
          background-color: rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #E8F1F2 !important;
        }
        html.dark .zf-unified-subpage [class*="text-[#17352c]"],
        html.dark .zf-unified-subpage [class*="text-[#12303a]"],
        html.dark .zf-unified-subpage [class*="text-slate-900"],
        html.dark .zf-unified-subpage [class*="text-slate-800"] {
          color: #f8fafc !important;
        }
        html.dark .zf-unified-subpage [class*="text-[#4d6a60]"],
        html.dark .zf-unified-subpage [class*="text-[#33473f]"],
        html.dark .zf-unified-subpage [class*="text-slate-500"],
        html.dark .zf-unified-subpage [class*="text-slate-600"] {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        html.dark .zf-unified-subpage input,
        html.dark .zf-unified-subpage select,
        html.dark .zf-unified-subpage textarea {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          color: #f8fafc !important;
        }
        html.dark .zf-unified-subpage input:focus,
        html.dark .zf-unified-subpage select:focus,
        html.dark .zf-unified-subpage textarea:focus {
          border-color: #00d3e0 !important;
          box-shadow: 0 0 15px rgba(0, 211, 224, 0.25) !important;
        }
        html.dark .zf-unified-subpage table th,
        html.dark .zf-unified-subpage table td,
        html.dark .zf-unified-subpage tr {
          border-color: rgba(255, 255, 255, 0.08) !important;
        }

        /* 3. Light Mode Specific Normalization */
        html.light .zf-unified-subpage h1 {
          font-size: clamp(1.5rem, 2.4vw, 2rem) !important;
          line-height: 1.15 !important;
          color: #03045e !important;
        }
        html.light .zf-unified-subpage [class*="bg-[rgba(255,255,255"],
        html.light .zf-unified-subpage [class*="bg-white/80"],
        html.light .zf-unified-subpage [class*="bg-white/90"],
        html.light .zf-unified-subpage .bg-white,
        html.light .zf-unified-subpage [class*="bg-white/[0.03]"],
        html.light .zf-unified-subpage [class*="bg-white/[0.02]"] {
          background-color: #ffffff !important;
          border-color: #ade8f4 !important;
          color: #03045e !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03) !important;
        }
        html.light .zf-unified-subpage [class*="text-white"] {
          color: #03045e !important;
        }
        html.light .zf-unified-subpage [class*="text-white/80"],
        html.light .zf-unified-subpage [class*="text-white/70"] {
          color: #0077b6 !important;
        }
        html.light .zf-unified-subpage [class*="text-white/50"],
        html.light .zf-unified-subpage [class*="text-white/40"] {
          color: #00b4d8 !important;
        }
        html.light .zf-unified-subpage input,
        html.light .zf-unified-subpage select,
        html.light .zf-unified-subpage textarea {
          background-color: #ffffff !important;
          border-color: #ade8f4 !important;
          color: #03045e !important;
        }
        html.light .zf-unified-subpage input:focus,
        html.light .zf-unified-subpage select:focus,
        html.light .zf-unified-subpage textarea:focus {
          border-color: #0077b6 !important;
          box-shadow: 0 0 12px rgba(45, 106, 79, 0.2) !important;
        }
        html.light .zf-unified-subpage table th,
        html.light .zf-unified-subpage table td,
        html.light .zf-unified-subpage tr {
          border-color: #ade8f4 !important;
          color: #03045e !important;
        }

        /* 4. Common Brand Gradients */
        .zf-unified-subpage [class*="bg-[#087a3c]"],
        .zf-unified-subpage [class*="bg-emerald-600"] {
          background: linear-gradient(135deg, #00ffc8 0%, #00d3e0 50%, #0099ff 100%) !important;
          color: #070B14 !important;
          font-weight: 800 !important;
          border: none !important;
        }
        .zf-unified-subpage [class*="bg-[#d9f7e5]"],
        .zf-unified-subpage [class*="bg-emerald-100"] {
          background-color: rgba(0, 255, 200, 0.12) !important;
          color: #00876c !important;
          border-color: rgba(0, 255, 200, 0.25) !important;
        }
        .zf-unified-subpage [class*="bg-[#fdf0d2]"] {
          background-color: rgba(245, 158, 11, 0.16) !important;
          color: #b45309 !important;
        }
      `}</style>
    </div>
  );
}
