"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, UserStatus } from "@/lib/services/users/userTypes";
import { useTheme } from "@/context/ThemeContext";

interface UserActionMenuProps {
  user: User;
  onStatusChange: (id: string, status: UserStatus) => void;
  onDelete: (id: string) => void;
}

export default function UserActionMenu({
  user,
  onStatusChange,
  onDelete,
}: UserActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleMute = () => {
    onStatusChange(user.id, user.status === "muted" ? "active" : "muted");
    setIsOpen(false);
  };

  const toggleActivate = () => {
    onStatusChange(user.id, user.status === "active" ? "deactivated" : "active");
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      onDelete(user.id);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-7 h-7 flex items-center justify-center rounded-full transition cursor-pointer ${
          isDark
            ? "text-gray-400 hover:text-white hover:bg-white/10"
            : "text-gray-500 hover:text-gray-900 hover:bg-[#b7e4c7]/30"
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Actions for ${user.firstName} ${user.lastName}`}
      >
        <span className="font-bold text-sm tracking-widest leading-none">⋯</span>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-44 rounded-2xl border py-1.5 z-40 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${
            isDark
              ? "bg-[#14181d]/95 border-white/15 text-white"
              : "bg-white/95 border-[#b7e4c7] text-[#081c15] shadow-[0_10px_35px_rgba(0,153,255,0.12)]"
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          <Link
            href={`/users/${user.id}`}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#00d3e0] hover:bg-[#00d3e0]/10 transition"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View Details</span>
          </Link>

          <button
            type="button"
            onClick={toggleMute}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition text-left cursor-pointer"
            role="menuitem"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <span>{user.status === "muted" ? "Unmute User" : "Mute User"}</span>
          </button>

          <button
            type="button"
            onClick={toggleActivate}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition text-left cursor-pointer"
            role="menuitem"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{user.status === "active" ? "Deactivate" : "Activate"}</span>
          </button>

          <div className="my-1 border-t border-black/5 dark:border-white/5" />

          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition text-left cursor-pointer"
            role="menuitem"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete User</span>
          </button>
        </div>
      )}
    </div>
  );
}
