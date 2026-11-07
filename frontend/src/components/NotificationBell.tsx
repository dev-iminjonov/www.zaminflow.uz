"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/v1/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      // Ignore network errors in preview
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/v1/notifications?limit=10");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/v1/notifications/read-all", { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        type="button"
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
        aria-label="View notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold font-mono text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-800"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 text-xs transition ${
                    n.read_at ? "bg-white text-slate-600" : "bg-cyan-50/40 text-slate-900 font-medium"
                  }`}
                >
                  <div className="font-bold text-slate-900">{n.title}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{n.body}</div>
                  {n.link_path && (
                    <Link
                      href={n.link_path}
                      onClick={() => setIsOpen(false)}
                      className="inline-block mt-1.5 text-cyan-700 font-semibold text-[11px] underline"
                    >
                      View Details &rarr;
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
