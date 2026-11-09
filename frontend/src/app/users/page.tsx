"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  UserStatus,
  UserQueryParams,
  PaginatedUsersResponse,
} from "@/lib/services/users/userTypes";
import {
  getUsers,
  updateUserStatus,
  deleteUser,
  bulkUpdateStatus,
  bulkDeleteUsers,
} from "@/lib/services/users/usersService";
import UserStatusBadge from "@/components/users/UserStatusBadge";
import UserPagination from "@/components/users/UserPagination";
import UserActionMenu from "@/components/users/UserActionMenu";
import UserBulkActionBar from "@/components/users/UserBulkActionBar";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggleButton, useTheme } from "@/context/ThemeContext";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function UserAdminListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dashT } = useLanguage();
  const { themeMode, isDark } = useTheme();
  const uT = dashT.userMgmt;

  // URL state synchronization
  const currentTab = (searchParams.get("tab") as "user" | "admin") || "user";
  const currentStatus =
    (searchParams.get("status") as "all" | "active" | "muted" | "deactivated") ||
    "all";
  const currentSearch = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  // Local state
  const [data, setData] = useState<PaginatedUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [timeRange, setTimeRange] = useState("This Month");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to push URL query changes
  const updateQuery = useCallback(
    (updates: Partial<UserQueryParams>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.tab !== undefined) params.set("tab", updates.tab);
      if (updates.status !== undefined) params.set("status", updates.status);
      if (updates.q !== undefined) {
        if (updates.q) params.set("q", updates.q);
        else params.delete("q");
      }
      if (updates.page !== undefined) params.set("page", updates.page.toString());
      router.push(`/users?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch users data
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getUsers({
        tab: currentTab,
        status: currentStatus,
        q: currentSearch,
        page: currentPage,
        pageSize: 6,
      });
      setData(res);
      setSelectedIds([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [currentTab, currentStatus, currentSearch, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateQuery({ q: searchInput, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, updateQuery]);

  // Handle single row selection
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Handle Select All
  const handleSelectAll = (checked: boolean) => {
    if (!data) return;
    if (checked) {
      setSelectedIds(data.users.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Status toggle handler
  const handleStatusChange = async (id: string, newStatus: UserStatus) => {
    try {
      await updateUserStatus(id, newStatus);
      showToast(`User status updated to ${newStatus}.`);
      loadUsers();
    } catch {
      showToast("Failed to update status.");
    }
  };

  // Delete user handler
  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      showToast("User deleted successfully.");
      loadUsers();
    } catch {
      showToast("Failed to delete user.");
    }
  };

  // Bulk status update
  const handleBulkStatusChange = async (status: UserStatus) => {
    try {
      await bulkUpdateStatus(selectedIds, status);
      showToast(`Updated ${selectedIds.length} users to ${status}.`);
      loadUsers();
    } catch {
      showToast("Bulk status update failed.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected users?`)) {
      return;
    }
    try {
      await bulkDeleteUsers(selectedIds);
      showToast(`Deleted ${selectedIds.length} users.`);
      loadUsers();
    } catch {
      showToast("Bulk delete failed.");
    }
  };

  const isAllSelected =
    data !== null &&
    data.users.length > 0 &&
    data.users.every((u) => selectedIds.includes(u.id));

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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#14181d] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold border border-[#00ffc8]/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="text-[#00ffc8]">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

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
              User Management
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggleButton size="sm" />
            <Link
              href="/dashboard"
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isDark
                  ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  : "border-[#ade8f4] bg-white hover:bg-[#ade8f4]/20 text-[#03045e]"
              }`}
            >
              <span>←</span>
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        
        {/* HEADER ROW: Title + Date Filter + "+ Add new" Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {uT.title}
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-gray-400" : "text-[#0077b6]"}`}>
              {uT.addUserSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Date-range dropdown */}
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`appearance-none rounded-full px-4 py-2 pr-8 text-xs font-bold border transition cursor-pointer ${
                  isDark
                    ? "bg-[#14181d] border-white/15 text-white focus:border-[#00d3e0]"
                    : "bg-white border-[#ade8f4] text-[#03045e] focus:border-[#00d3e0]"
                }`}
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">{uT.thisMonth}</option>
                <option value="This Year">This Year</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ▼
              </span>
            </div>

            {/* "+ Add new" primary button */}
            <Link
              href="/users/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] text-xs sm:text-sm font-black shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-base leading-none font-black">+</span>
              <span>{uT.addNew}</span>
            </Link>
          </div>
        </div>

        {/* TABS: "User" | "Admin" Pills */}
        <div className="flex items-center gap-2 mb-6 border-b border-black/5 dark:border-white/10 pb-4">
          <button
            type="button"
            onClick={() => updateQuery({ tab: "user", page: 1 })}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-black transition cursor-pointer ${
              currentTab === "user"
                ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] shadow-md"
                : isDark
                ? "text-gray-400 hover:text-white hover:bg-white/5"
                : "text-gray-600 hover:text-[#03045e] hover:bg-[#ade8f4]/20"
            }`}
          >
            {uT.userTab}
          </button>

          <button
            type="button"
            onClick={() => updateQuery({ tab: "admin", page: 1 })}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-black transition cursor-pointer ${
              currentTab === "admin"
                ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] shadow-md"
                : isDark
                ? "text-gray-400 hover:text-white hover:bg-white/5"
                : "text-gray-600 hover:text-[#03045e] hover:bg-[#ade8f4]/20"
            }`}
          >
            {uT.adminTab}
          </button>
        </div>

        {/* TOOLBAR: Master Checkbox + Bulk Bar (Left) | Search + Filter (Right) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <UserBulkActionBar
            selectedCount={selectedIds.length}
            totalCount={data?.users.length || 0}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkDelete={handleBulkDelete}
          />

          {/* Right: Search & Filter */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={uT.searchPlaceholder}
                className={`w-48 sm:w-64 pl-10 pr-8 py-2 rounded-full text-xs font-medium border transition outline-none ${
                  isDark
                    ? "bg-[#14181d] border-white/15 text-white placeholder-gray-500 focus:border-[#00d3e0] focus:ring-1 focus:ring-[#00d3e0]/20"
                    : "bg-white border-[#ade8f4] text-[#03045e] placeholder-gray-400 focus:border-[#00d3e0] focus:ring-1 focus:ring-[#00d3e0]/20 shadow-xs"
                }`}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={currentStatus}
                onChange={(e) =>
                  updateQuery({
                    status: e.target.value as any,
                    page: 1,
                  })
                }
                className={`appearance-none rounded-full px-4 py-2 pr-8 text-xs font-bold border transition cursor-pointer ${
                  isDark
                    ? "bg-[#14181d] border-white/15 text-white focus:border-[#00d3e0]"
                    : "bg-white border-[#ade8f4] text-[#03045e] focus:border-[#00d3e0] shadow-xs"
                }`}
              >
                <option value="all">{uT.allUser}</option>
                <option value="muted">{uT.mutedUsers}</option>
                <option value="active">{uT.activatedUsers}</option>
                <option value="deactivated">{uT.deactivatedUsers}</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* TABLE: Floating Row Cards Style */}
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className={`grid grid-cols-12 gap-3 px-5 py-2.5 text-xs font-bold uppercase tracking-wider min-w-[760px] ${
            isDark ? "text-gray-400" : "text-[#0077b6]"
          }`}>
            <div className="col-span-1 flex items-center">
              <span>{uT.select}</span>
            </div>
            <div className="col-span-2">{uT.firstName}</div>
            <div className="col-span-2">{uT.lastName}</div>
            <div className="col-span-3">{uT.email}</div>
            <div className="col-span-2">{uT.status}</div>
            <div className="col-span-2 text-right pr-2">{uT.lastAccess}</div>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-3 mt-1 min-w-[760px]">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-4 border animate-pulse flex items-center justify-between ${
                    isDark ? "bg-[#14181d]/80 border-white/10" : "bg-white border-[#ade8f4]/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3 w-1/3">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-white/10 rounded" />
                    <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-white/10" />
                    <div className="h-4 bg-gray-300 dark:bg-white/10 rounded w-24" />
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-white/10 rounded w-28" />
                  <div className="h-4 bg-gray-300 dark:bg-white/10 rounded w-16" />
                  <div className="h-4 bg-gray-300 dark:bg-white/10 rounded w-20" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className={`rounded-3xl p-8 text-center border my-4 ${
              isDark ? "bg-[#14181d] border-rose-500/30 text-rose-400" : "bg-white border-rose-200 text-rose-600 shadow-sm"
            }`}>
              <p className="text-xs sm:text-sm font-bold">{error}</p>
              <button
                type="button"
                onClick={loadUsers}
                className="mt-4 px-5 py-2 rounded-full bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] text-xs font-black cursor-pointer shadow-md"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && data && data.users.length === 0 && (
            <div className={`rounded-3xl p-12 text-center border my-4 ${
              isDark ? "bg-[#14181d] border-white/10" : "bg-white border-[#ade8f4]/60 shadow-sm"
            }`}>
              <div className="w-12 h-12 rounded-full bg-[#00d3e0]/10 text-[#00d3e0] mx-auto flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold">{uT.noUsersFound}</h3>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No {currentTab} accounts match your current status and search filters.
              </p>
              {(currentSearch || currentStatus !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateQuery({ q: "", status: "all", page: 1 });
                  }}
                  className="mt-4 px-5 py-2 rounded-full border border-[#00d3e0] text-xs font-black text-[#00d3e0] hover:bg-[#00d3e0]/10 transition cursor-pointer"
                >
                  {uT.clearFilters}
                </button>
              )}
            </div>
          )}

          {/* Floating Row Cards */}
          {!isLoading && !error && data && data.users.length > 0 && (
            <div className="space-y-2.5 mt-1 min-w-[760px]">
              {data.users.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-12 gap-3 items-center px-5 py-3.5 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? isDark
                          ? "bg-[#14181d] border-[#00ffc8] shadow-[0_0_20px_rgba(0,255,200,0.15)]"
                          : "bg-white border-[#00d3e0] shadow-[0_4px_20px_rgba(0,211,224,0.18)]"
                        : isDark
                        ? "bg-[#14181d]/80 border-white/10 hover:border-white/20 hover:bg-[#14181d]"
                        : "bg-white border-[#ade8f4]/60 hover:border-[#ade8f4] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                    }`}
                  >
                    {/* Checkbox + Avatar */}
                    <div className="col-span-1 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(user.id, e.target.checked)}
                        className="w-4 h-4 rounded-md border-slate-300 dark:border-white/20 text-[#00d3e0] focus:ring-[#00d3e0] accent-[#00d3e0] cursor-pointer"
                        aria-label={`Select ${user.firstName} ${user.lastName}`}
                      />
                      <img
                        src={user.avatarUrl || "/images/team-muhammadaziz.webp"}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-[#00ffc8]/30 shrink-0"
                      />
                    </div>

                    {/* First Name (Clickable link to details) */}
                    <div className="col-span-2">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-xs sm:text-sm font-bold hover:text-[#00d3e0] transition truncate block"
                      >
                        {user.firstName}
                      </Link>
                    </div>

                    {/* Last Name */}
                    <div className={`col-span-2 text-xs sm:text-sm font-medium truncate ${
                      isDark ? "text-gray-300" : "text-[#03045e]"
                    }`}>
                      {user.lastName}
                    </div>

                    {/* Email (Cyan Link, Mailto) */}
                    <div className="col-span-3 truncate">
                      <a
                        href={`mailto:${user.email}`}
                        className="text-xs sm:text-sm font-medium text-[#00d3e0] hover:underline truncate block"
                      >
                        {user.email}
                      </a>
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-2">
                      <UserStatusBadge status={user.status} />
                    </div>

                    {/* Last Access + Row Action Menu */}
                    <div className="col-span-2 flex items-center justify-end gap-3 pr-1">
                      <span className={`text-[11px] font-medium truncate ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {user.lastAccessAt}
                      </span>
                      <UserActionMenu
                        user={user}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteUser}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PAGINATION: Centered Indicator */}
        {!isLoading && data && data.totalPages > 1 && (
          <UserPagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={(page) => updateQuery({ page })}
          />
        )}
      </main>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d1013] flex items-center justify-center p-8">
          <div className="w-10 h-10 rounded-full border-3 border-[#00ffc8] border-t-transparent animate-spin" />
        </div>
      }
    >
      <UserAdminListContent />
    </Suspense>
  );
}
