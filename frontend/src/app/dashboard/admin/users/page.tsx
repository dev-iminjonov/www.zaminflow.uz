"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getAdminUsers, AdminUserRecord } from "@/lib/adminStore";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setUsers(getAdminUsers());
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/signin");
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.legalName.toLowerCase().includes(q) ||
        u.taxId.includes(q) ||
        u.region.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-[940px] bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)] text-[#17352c] font-[family-name:var(--font-inter,sans-serif)]">
      <div className="max-w-[1180px] mx-auto px-6 pt-6 pb-14 flex flex-col gap-7">
        
        {/* Floating Top Pill Nav */}
        <nav className="bg-white rounded-[40px] px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_10px_40px_rgba(20,80,60,0.08)]">
          <Link href="/dashboard/admin" className="text-[26px] font-extrabold tracking-[-0.02em] text-[#12303a]">
            zamin<span className="text-[#0f9d8a]">flow</span>
          </Link>
          <div className="flex flex-wrap items-center gap-7 text-[15px] font-semibold">
            <Link href="/dashboard/admin" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Overview
            </Link>
            <Link href="/dashboard/admin/users" className="text-[#087a3c] border-b-2 border-[#22d36b] pb-0.5">
              Users
            </Link>
            <Link href="/dashboard/admin/verification" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Verification
            </Link>
            <Link href="/dashboard/admin/disputes" className="text-[#17352c] hover:text-[#087a3c] transition pb-0.5">
              Disputes
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#d9f7e5] text-[#087a3c] rounded-lg px-2 py-1 whitespace-nowrap">
              Admin
            </span>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="bg-white text-[#12303a] border-[1.5px] border-[#12303a] rounded-full px-5 min-h-[44px] font-bold text-[15px] hover:bg-[#12303a] hover:text-white transition cursor-pointer"
            >
              {isSigningOut ? "..." : "Sign out"}
            </button>
          </div>
        </nav>

        {/* Header Row */}
        <header className="flex flex-wrap items-end justify-between gap-5 pt-4">
          <div>
            <div className="text-xs font-bold tracking-[0.08em] text-[#087a3c] uppercase mb-1">
              Platform Directory • Gap #19 Built
            </div>
            <h1 className="m-0 text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] text-[#17352c]">
              Users & Enterprise <span className="text-[#087a3c]">Access Directory</span>
            </h1>
          </div>
          <Link
            href="/dashboard/admin/verification"
            className="inline-flex items-center justify-center bg-[#12303a] text-white rounded-full px-6 min-h-[44px] font-bold text-xs hover:bg-[#087a3c] transition shadow-md"
          >
            Review Pending Dossiers →
          </Link>
        </header>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Roles (2,140)" },
              { id: "farmer", label: "Farmers (1,480)" },
              { id: "dairy", label: "Dairy Industry (212)" },
              { id: "driver", label: "Drivers (436)" },
              { id: "admin", label: "Operators (12)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  roleFilter === tab.id
                    ? "bg-[#12303a] text-white"
                    : "bg-white text-[#17352c] border border-white hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name, legal entity, TIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-full bg-white border border-[#17352c]/20 px-4 text-xs font-semibold text-[#17352c] focus:outline-none focus:ring-2 focus:ring-[#22d36b]"
            />
          </div>
        </div>

        {/* Users Table */}
        <section className="bg-[rgba(255,255,255,0.76)] border border-white rounded-[24px] shadow-[0_10px_40px_rgba(20,80,60,0.08)] p-6 sm:p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#17352c]/10 text-xs text-[#4d6a60] uppercase tracking-wider">
                  <th className="py-3 px-4">Organization / User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">TIN / INN</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">KYB Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17352c]/10">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/50 transition">
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#12303a]">{u.legalName}</div>
                      <div className="text-xs text-[#4d6a60]">{u.fullName}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#087a3c] bg-[#d9f7e5] px-2.5 py-1 rounded-lg">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-[family-name:var(--font-jetbrains-mono,monospace)] font-bold text-[#17352c]">
                      {u.taxId}
                    </td>
                    <td className="py-4 px-4 font-medium text-[#17352c]">
                      {u.region}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 whitespace-nowrap ${
                          u.kybStatus === "VERIFIED"
                            ? "bg-[#d9f7e5] text-[#087a3c]"
                            : "bg-[#fdf0d2] text-[#7a4b00]"
                        }`}
                      >
                        {u.kybStatus === "VERIFIED" ? "✓ Verified" : "● Pending Review"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-bold text-[#087a3c] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#22d36b]" />
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {u.kybStatus !== "VERIFIED" ? (
                        <Link
                          href={`/dashboard/admin/verification/${encodeURIComponent(u.role + "-" + u.region)}`}
                          className="bg-[#12303a] text-white rounded-full px-4 py-1.5 text-xs font-bold hover:bg-[#087a3c] transition inline-block"
                        >
                          Review Dossier
                        </Link>
                      ) : (
                        <button className="text-xs font-bold text-[#4d6a60] hover:text-red-700 underline">
                          Manage Account
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
