"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  UserActivity,
  UserOrderDetails,
} from "@/lib/services/users/userTypes";
import {
  getUserById,
  getUserActivities,
  getUserOrders,
} from "@/lib/services/users/usersService";
import UserStatusBadge from "@/components/users/UserStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggleButton, useTheme } from "@/context/ThemeContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const userId = resolvedParams.id;
  const { dashT } = useLanguage();
  const { themeMode, isDark } = useTheme();
  const uT = dashT.userMgmt;

  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [orders, setOrders] = useState<UserOrderDetails | null>(null);
  const [activeTab, setActiveTab] = useState<"activities" | "order">("activities");
  const [monthFilter, setMonthFilter] = useState("Month");
  const [orderFilter, setOrderFilter] = useState("All Orders");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const u = await getUserById(userId);
        if (!u) throw new Error("User not found.");
        const acts = await getUserActivities(userId);
        const ords = await getUserOrders(userId);

        if (isMounted) {
          setUser(u);
          setActivities(acts);
          setOrders(ords);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load user details.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-8 ${
        isDark ? "bg-[#0d1013]" : "bg-[#f4fbfe]"
      }`}>
        <div className="w-10 h-10 rounded-full border-3 border-[#00ffc8] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`min-h-screen p-8 flex items-center justify-center ${
        isDark ? "bg-[#0d1013]" : "bg-[#f4fbfe]"
      }`}>
        <div className={`max-w-md w-full rounded-3xl p-8 text-center border ${
          isDark ? "bg-[#14181d] border-white/10" : "bg-white border-[#ade8f4] shadow-xl"
        }`}>
          <p className="text-sm font-bold text-rose-500 mb-4">{error || "User not found"}</p>
          <Link
            href="/users"
            className="inline-flex px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] text-xs font-black shadow-md cursor-pointer"
          >
            Back to Users List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans antialiased pb-20 relative overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-[#0d1013] text-[#E8F1F2]" : "bg-[#f4fbfe] text-[#03045e]"
      }`}
    >
      {/* 1. AMBIENT TURQUOISE DREAMLAND BACKDROP AURORAS */}
      <div className="absolute top-10 -left-40 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-25 animate-pulse"
          style={{ background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 40%, transparent 70%)" }}
        />
      </div>
      <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle, #00d3e0 0%, #0099ff 50%, transparent 70%)" }}
        />
      </div>

      {/* Subtle Dot Grid Canvas Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00d3e0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Frosted ZaminFlow Global Top Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-300 ${
          isDark ? "bg-[#0d1013]/80 border-white/10" : "bg-white/80 border-[#ade8f4]/60"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center transition-transform hover:scale-105">
              <ZaminFlowLogo size="md" mode={themeMode} />
            </Link>
            <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isDark ? "border-white/10 text-gray-400 bg-white/5" : "border-[#ade8f4] text-[#0077b6] bg-[#eaf7f0]"
            }`}>
              User Details
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggleButton size="sm" />
            <Link
              href="/users"
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isDark
                  ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  : "border-[#ade8f4] bg-white hover:bg-[#ade8f4]/20 text-[#03045e]"
              }`}
            >
              <span>←</span>
              <span>{uT.title}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        
        {/* Header: Back Arrow + Title */}
        <div className="flex items-center gap-3 pb-6">
          <Link
            href="/users"
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition shadow-xs ${
              isDark
                ? "border-white/15 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
                : "border-[#ade8f4] bg-white text-[#03045e] hover:bg-[#ade8f4]/20"
            }`}
            aria-label="Back to users list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-[#0077b6]"}`}>
              @{user.username} • {user.role}
            </p>
          </div>
        </div>

        {/* Two-Column Responsive Layout (≈ 70/30) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT CARD: Activities & Orders (≈ 70%) */}
          <div
            className={`lg:col-span-8 rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all ${
              isDark
                ? "bg-[#14181d]/90 border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.5)]"
                : "bg-white/95 border-[#ade8f4]/80 shadow-[0_10px_35px_rgba(0,153,255,0.08)]"
            }`}
          >
            {/* Top Row: Title + Month Dropdown */}
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
              <h2 className="text-sm sm:text-base font-black tracking-tight">
                {uT.activitiesLog}
              </h2>

              <div className="relative">
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className={`appearance-none rounded-full px-4 py-1.5 pr-8 text-xs font-bold border transition cursor-pointer outline-none ${
                    isDark
                      ? "bg-[#0d1013] border-white/15 text-white focus:border-[#00d3e0]"
                      : "bg-[#f4fbfe] border-[#ade8f4] text-[#03045e] focus:border-[#00d3e0]"
                  }`}
                >
                  <option value="Month">{uT.thisMonth}</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                  ▼
                </span>
              </div>
            </div>

            {/* Inner Tabs: "Activities" | "Order" */}
            <div className="flex gap-2 pt-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("activities")}
                className={`px-5 py-2 rounded-full text-xs font-black transition cursor-pointer ${
                  activeTab === "activities"
                    ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] shadow-md"
                    : isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-[#03045e] hover:bg-[#ade8f4]/20"
                }`}
              >
                {uT.activities}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("order")}
                className={`px-5 py-2 rounded-full text-xs font-black transition cursor-pointer ${
                  activeTab === "order"
                    ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] shadow-md"
                    : isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-[#03045e] hover:bg-[#ade8f4]/20"
                }`}
              >
                {uT.order}
              </button>
            </div>

            {/* TAB 1: ACTIVITIES TIMELINE */}
            {activeTab === "activities" && (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {activities.map((act) => (
                  <div key={act.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <img
                        src={act.avatarUrl || user.avatarUrl}
                        alt={act.actorName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#00ffc8]/30 mt-0.5 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm leading-snug">
                          <span className="font-black">{act.actorName}</span>{" "}
                          <span className={isDark ? "text-gray-300" : "text-gray-700"}>{act.action}</span>
                        </p>
                        <p className={`text-xs mt-0.5 truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {act.description}
                        </p>
                        <span className={`text-[10px] font-medium block mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {act.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-7 h-7 flex items-center justify-center rounded-full transition cursor-pointer shrink-0 ${
                        isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-[#ade8f4]/30"
                      }`}
                      aria-label="Activity item menu"
                    >
                      ⋯
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: ORDER DETAILS */}
            {activeTab === "order" && orders && (
              <div className="space-y-6">
                
                {/* 1. Three Stat Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Total Order (Dark Obsidian) */}
                  <div className={`rounded-2xl p-4 text-center border ${
                    isDark ? "bg-[#0d1013] border-white/10 text-white" : "bg-[#070B14] text-white border-transparent shadow-sm"
                  }`}>
                    <div className="text-3xl font-black tracking-tight">{orders.totalOrders}</div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                      {uT.totalOrder}
                    </div>
                  </div>

                  {/* Received Order (Mint / Emerald) */}
                  <div className={`rounded-2xl p-4 text-center border ${
                    isDark ? "bg-emerald-500/10 border-emerald-500/30 text-[#00ffc8]" : "bg-[#E7F8EE] text-[#137333] border-[#D7FCDA]"
                  }`}>
                    <div className="text-3xl font-black tracking-tight">{orders.receivedOrders}</div>
                    <div className="text-[11px] font-bold uppercase tracking-wider mt-1 opacity-80">
                      {uT.receivedOrder}
                    </div>
                  </div>

                  {/* Cancelled Order (Rose) */}
                  <div className={`rounded-2xl p-4 text-center border ${
                    isDark ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-[#FDF2F4] text-[#C5221F] border-[#F9D9DE]"
                  }`}>
                    <div className="text-3xl font-black tracking-tight">{orders.cancelledOrders}</div>
                    <div className="text-[11px] font-bold uppercase tracking-wider mt-1 opacity-80">
                      {uT.cancelledOrder}
                    </div>
                  </div>
                </div>

                {/* 2. Billing & Shipping Address Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`rounded-2xl p-4 border ${
                    isDark ? "bg-[#0d1013] border-white/10" : "bg-[#f4fbfe] border-[#ade8f4]/60"
                  }`}>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#00d3e0] mb-2">
                      {uT.billingAddress}
                    </h4>
                    <p className="text-xs font-semibold leading-relaxed">
                      {orders.billingAddress.address}
                    </p>
                    <p className={`text-xs font-bold mt-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {orders.billingAddress.phone}
                    </p>
                  </div>

                  <div className={`rounded-2xl p-4 border ${
                    isDark ? "bg-[#0d1013] border-white/10" : "bg-[#f4fbfe] border-[#ade8f4]/60"
                  }`}>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#00d3e0] mb-2">
                      {uT.shippingAddress}
                    </h4>
                    <p className="text-xs font-semibold leading-relaxed">
                      {orders.shippingAddress.address}
                    </p>
                    <p className={`text-xs font-bold mt-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {orders.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                {/* 3. Orders Product Table */}
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider">Order Items</h4>
                    <div className="relative">
                      <select
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value)}
                        className={`appearance-none rounded-full px-3 py-1 pr-7 text-xs font-bold border transition cursor-pointer outline-none ${
                          isDark
                            ? "bg-[#0d1013] border-white/15 text-white focus:border-[#00d3e0]"
                            : "bg-[#f4fbfe] border-[#ade8f4] text-[#03045e] focus:border-[#00d3e0]"
                        }`}
                      >
                        <option value="All Orders">All Orders</option>
                        <option value="Recent">Recent</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                        ▼
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-black/5 dark:divide-white/5 border-t border-black/5 dark:border-white/5">
                    {orders.products.map((prod) => (
                      <div key={prod.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.thumbnailUrl}
                            alt={prod.name}
                            className="w-11 h-11 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10 shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-bold truncate">
                            {prod.name}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-[#00d3e0] shrink-0">
                          {prod.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* RIGHT CARD: Profile (≈ 30%) */}
          <div
            className={`lg:col-span-4 rounded-3xl border p-6 sm:p-7 backdrop-blur-xl transition-all ${
              isDark
                ? "bg-[#14181d]/90 border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.5)]"
                : "bg-white/95 border-[#ade8f4]/80 shadow-[0_10px_35px_rgba(0,153,255,0.08)]"
            }`}
          >
            <h2 className="text-sm sm:text-base font-black tracking-tight pb-4 border-b border-black/5 dark:border-white/10">
              {uT.profile}
            </h2>

            {/* Large Circular Avatar & Name */}
            <div className="flex flex-col items-center pt-6 pb-5">
              <div className="relative">
                <img
                  src={user.avatarUrl || "/images/team-muhammadaziz.webp"}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-22 h-22 rounded-full object-cover ring-4 ring-[#00ffc8]/40 shadow-md"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#14181d]" />
              </div>

              <h3 className="text-base font-black mt-3 text-center">
                {user.firstName} {user.lastName}
              </h3>
              <p className={`text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                @{user.username}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <UserStatusBadge status={user.status} />
                <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${
                  isDark ? "border-white/15 bg-white/5 text-gray-300" : "border-[#ade8f4] bg-[#eaf7f0] text-[#0077b6]"
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="h-px bg-black/5 dark:bg-white/10 mb-4" />

            {/* Label / Value Rows */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>{uT.firstName}:</span>
                <span className="font-bold">{user.firstName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>{uT.lastName}:</span>
                <span className="font-bold">{user.lastName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>{uT.email}:</span>
                <a
                  href={`mailto:${user.email}`}
                  className="font-bold text-[#00d3e0] hover:underline truncate max-w-[170px]"
                >
                  {user.email}
                </a>
              </div>

              {user.phone && (
                <div className="flex items-center justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>Contact:</span>
                  <span className="font-bold">{user.phone}</span>
                </div>
              )}

              {user.webAddress && (
                <div className="flex items-center justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>Website:</span>
                  <a
                    href={user.webAddress}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[#00d3e0] hover:underline truncate max-w-[170px]"
                  >
                    {user.webAddress.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Last Access:</span>
                <span className="font-semibold">{user.lastAccessAt}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-5 border-t border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => router.push(`/users`)}
                className={`w-full py-2.5 rounded-full border text-xs font-black transition cursor-pointer ${
                  isDark
                    ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                    : "border-[#ade8f4] bg-white hover:bg-[#ade8f4]/20 text-[#03045e]"
                }`}
              >
                Back to All Users
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
