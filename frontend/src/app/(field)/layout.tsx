"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";

export default function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((res) => res.json())
      .then((data) => setMe(data))
      .catch(() => {});
  }, []);

  const isFarmer = pathname.startsWith("/farmer");
  const isDriver = pathname.startsWith("/driver");
  const isGate = pathname.startsWith("/gate-scanner");

  const workspaceName = isFarmer
    ? "Farmer workspace"
    : isDriver
    ? "Driver workspace"
    : "Gate & Lab terminal";

  let tabs = [
    { href: "/farmer/dashboard", label: "Home", icon: "🏠" },
    { href: "/farmer/contracts", label: "Contracts", icon: "📋" },
    { href: "/farmer/qr-pickup", label: "Pickup QR", icon: "📱" },
    { href: "/farmer/profile", label: "Profile", icon: "👤" },
  ];

  if (isDriver) {
    tabs = [
      { href: "/driver/queue", label: "Queue", icon: "🚚" },
      { href: "/driver/scan", label: "Scan Pickup", icon: "📷" },
      { href: "/driver/gate-handover", label: "Handover", icon: "🏭" },
    ];
  } else if (isGate) {
    tabs = [
      { href: "/gate-scanner", label: "Intake Gate", icon: "🔬" },
      { href: "/gate-scanner/account", label: "Account", icon: "👤" },
    ];
  }

  const handleSignOut = async () => {
    await fetch("/api/v1/auth/sign-out", { method: "POST" });
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-between font-sans selection:bg-emerald-500/20 antialiased">
      {/* Centered Column container up to 560px on tablet/desktop per Section 10 */}
      <div className="w-full max-w-[560px] mx-auto min-h-screen flex flex-col justify-between bg-[#F8FAFC] shadow-xl relative border-x border-slate-200/80">
        {/* 56px Top Bar (Section 10) */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between shadow-xs">
          <Link href="/" className="flex items-center gap-2.5">
            <ZaminFlowLogo mode="light" size="sm" />
            <span className="text-[10px] text-teal-700 font-mono font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              {workspaceName}
            </span>
          </Link>

          <div className="flex items-center gap-2 relative">
            <NotificationBell />

            {/* Avatar Menu with Account and Sign Out */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center hover:opacity-90 cursor-pointer"
            >
              {me?.user?.full_name ? me.user.full_name.charAt(0) : "U"}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-10 w-44 bg-white rounded-xl border border-slate-200 shadow-float py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <div className="font-bold text-slate-900 truncate">{me?.user?.full_name || "User"}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{me?.user?.email}</div>
                </div>
                <Link
                  href={isFarmer ? "/farmer/account" : isDriver ? "/driver/account" : "/gate-scanner/account"}
                  onClick={() => setShowUserMenu(false)}
                  className="block px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Account Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area (usable at 360px width) */}
        <main className="flex-1 pb-24 px-4 pt-4 w-full">
          {children}
        </main>

        {/* 64px Mobile Bottom Tab Navigation with safe-area padding (Section 10) */}
        <nav className="fixed bottom-0 max-w-[560px] w-full z-50 bg-white border-t border-slate-200 shadow-float px-2 py-1 flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 h-12 min-h-[44px] min-w-[44px] rounded-xl transition ${
                  isActive ? "text-emerald-700 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                <span className="text-[10px] mt-1">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
