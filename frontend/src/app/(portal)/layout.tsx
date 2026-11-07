"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [me, setMe] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );

    fetch("/api/v1/me")
      .then((res) => res.json())
      .then((data) => setMe(data))
      .catch(() => {});
  }, []);

  const orgRole = me?.organization?.role || (pathname.startsWith("/bank") ? "BANK" : pathname.startsWith("/admin") ? "ADMIN" : "INDUSTRY");
  const isVerified = me?.organization?.kyb_status === "VERIFIED" || orgRole === "ADMIN";

  // Build role-specific navigation strictly per Section 11, 12, 13
  let navItems: { href: string; label: string; locked?: boolean; icon: string }[] = [];

  if (orgRole === "BANK" || pathname.startsWith("/bank")) {
    navItems = [
      { href: "/bank/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/bank/underwriting", label: "Underwriting", locked: !isVerified, icon: "📋" },
      { href: "/bank/ledger", label: "Ledger", locked: !isVerified, icon: "🏛️" },
      { href: "/bank/profile", label: "Profile", icon: "🏢" },
    ];
  } else if (orgRole === "ADMIN" || pathname.startsWith("/admin")) {
    navItems = [
      { href: "/admin/dashboard", label: "Dashboard", icon: "🌐" },
      { href: "/admin/kyb-review", label: "KYB Review", icon: "🛡️" },
      { href: "/admin/disputes", label: "Disputes", icon: "⚖️" },
      { href: "/admin/invitations", label: "Invitations", icon: "✉️" },
      { href: "/admin/settings", label: "Settings", icon: "⚙️" },
    ];
  } else {
    // Industry (Default)
    navItems = [
      { href: "/industry/dashboard", label: "Dashboard", icon: "📈" },
      { href: "/industry/discover", label: "Discover", locked: !isVerified, icon: "🧭" },
      { href: "/industry/contracts", label: "Contracts", locked: !isVerified, icon: "📝" },
      { href: "/industry/team", label: "Team", locked: !isVerified, icon: "👥" },
      { href: "/industry/profile", label: "Profile", icon: "🏭" },
    ];
  }

  // Format breadcrumb from pathname
  const breadcrumb = pathname.replace(/^\//, "").split("/").join(" / ");

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased overflow-hidden">
      {/* 216px Navy Sidebar (Section 11) */}
      <aside className="w-[216px] flex-shrink-0 bg-[#0F172A] text-slate-300 flex flex-col justify-between border-r border-slate-800 select-none">
        <div>
          {/* Brand Header */}
          <div className="h-14 flex items-center px-4 border-b border-slate-800">
            <Link href="/" className="flex items-center">
              <ZaminFlowLogo mode="dark" size="sm" />
            </Link>
          </div>

          {/* Workspace Block */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
              WORKSPACE / {orgRole}
            </span>
            <div className="text-xs font-bold text-white truncate mt-0.5">
              {me?.organization?.legal_name || "Toshkent Dairy JSC"}
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Uzbekistan</span>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              if (item.locked) {
                return (
                  <div
                    key={item.href}
                    title="Available after verification"
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 opacity-60 cursor-not-allowed select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm opacity-50">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[11px]">🔒</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-[#20382F] text-emerald-400 font-bold shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Help Center & User Block */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          <a
            href="mailto:support@zaminflow.uz"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <span>💬</span>
            <span>Help center</span>
          </a>

          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center">
              {me?.user?.full_name ? me.user.full_name.charAt(0) : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {me?.user?.full_name || "User"}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {me?.user?.sub_role || orgRole}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 56px Top Bar */}
        <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
              {breadcrumb || "PORTAL"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-slate-500 hidden sm:inline-block">
              {currentDate}
            </span>
            <NotificationBell />
            <Link
              href="/farmer/dashboard"
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100"
            >
              Field View &rarr;
            </Link>
          </div>
        </header>

        {/* Scrollable Content Container (content padding 32px desktop, max width 1224px) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-[1224px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
