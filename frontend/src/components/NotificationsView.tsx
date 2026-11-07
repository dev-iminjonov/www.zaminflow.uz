"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link_path?: string;
  read_at?: string | null;
  created_at: string;
}

export default function NotificationsView() {
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      type: "KYB_APPROVAL",
      title: "KYB Verification Approved",
      body: "Your organization credentials have been verified by Central Bank compliance.",
      link_path: "/industry/dashboard",
      read_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: "n-2",
      type: "PICKUP_INCOMING",
      title: "Milk Tanker En Route",
      body: "Driver Jasur Aliyev is 15 minutes away from collection stop at Baraka Farm.",
      link_path: "/driver/queue",
      read_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    },
    {
      id: "n-3",
      type: "ESCROW_LOCKED",
      title: "Escrow Deposit Confirmed",
      body: "4,675,000 UZS locked in partner bank escrow for contract #CTR-0982.",
      link_path: "/industry/contracts",
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  };

  const handleMarkItemRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read_at;
    return true;
  });

  const todayItems = filtered.filter((n) => {
    const d = new Date(n.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const earlierItems = filtered.filter((n) => {
    const d = new Date(n.created_at);
    const now = new Date();
    return d.toDateString() !== now.toDateString();
  });

  const formatRelativeTime = (iso: string) => {
    const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / (1000 * 60));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  };

  const renderGroup = (items: NotificationItem[], groupTitle: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
          {groupTitle}
        </h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkItemRead(item.id)}
              className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                !item.read_at
                  ? "bg-white border-slate-300 shadow-xs ring-1 ring-emerald-500/10"
                  : "bg-slate-50/70 border-slate-200 opacity-80"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center text-sm flex-shrink-0">
                  🔔
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs text-slate-900">{item.title}</h4>
                    {!item.read_at && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">{item.body}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="font-mono text-[10px] text-slate-400">
                  {formatRelativeTime(item.created_at)}
                </span>
                {item.link_path && (
                  <Link
                    href={item.link_path}
                    className="text-[11px] font-semibold text-teal-700 hover:underline"
                  >
                    Open &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, contract state transitions, and compliance updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Control: All vs Unread */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-md transition ${
                filter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={`px-3 py-1.5 rounded-md transition ${
                filter === "UNREAD" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Unread
            </button>
          </div>

          <button
            onClick={markAllRead}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto">
            ✓
          </div>
          <h3 className="font-extrabold text-sm text-slate-900">You are all caught up.</h3>
          <p className="text-xs text-slate-500">No new alerts or pending notices at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderGroup(todayItems, "Today")}
          {renderGroup(earlierItems, "Earlier")}
        </div>
      )}
    </div>
  );
}
