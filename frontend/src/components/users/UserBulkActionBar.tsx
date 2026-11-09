"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserStatus } from "@/lib/services/users/userTypes";
import { useTheme } from "@/context/ThemeContext";

interface UserBulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: (selected: boolean) => void;
  onBulkStatusChange: (status: UserStatus) => void;
  onBulkDelete: () => void;
}

export default function UserBulkActionBar({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onBulkStatusChange,
  onBulkDelete,
}: UserBulkActionBarProps) {
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

  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center gap-3 select-none" ref={menuRef}>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={isAllSelected && totalCount > 0}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="w-4 h-4 rounded-md border-slate-300 dark:border-white/20 text-[#00d3e0] focus:ring-[#00d3e0] accent-[#00d3e0] cursor-pointer"
          aria-label="Select all rows"
        />
        <span className={`text-xs font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          Select {hasSelection && <span className="text-[#00d3e0] font-black">({selectedCount})</span>}
        </span>
      </label>

      {/* Bulk Action Trigger */}
      <div className="relative">
        <button
          type="button"
          disabled={!hasSelection}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-7 h-7 flex items-center justify-center rounded-full transition cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
            isDark
              ? "border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
              : "border border-[#b7e4c7] text-[#081c15] hover:bg-[#b7e4c7]/30"
          }`}
          aria-label="Bulk actions menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="font-black text-xs tracking-wider leading-none">⋯</span>
        </button>

        {isOpen && (
          <div
            className={`absolute left-0 mt-2 w-44 rounded-2xl border py-1.5 z-40 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 ${
              isDark
                ? "bg-[#14181d]/95 border-white/15 text-white"
                : "bg-white/95 border-[#b7e4c7] text-[#081c15] shadow-[0_10px_35px_rgba(0,153,255,0.12)]"
            }`}
            role="menu"
          >
            <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#00d3e0] border-b border-black/5 dark:border-white/5">
              Bulk Actions ({selectedCount})
            </div>
            <button
              type="button"
              onClick={() => {
                onBulkStatusChange("active");
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
              role="menuitem"
            >
              ✓ Activate Selected
            </button>
            <button
              type="button"
              onClick={() => {
                onBulkStatusChange("muted");
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition cursor-pointer"
              role="menuitem"
            >
              ⚠ Mute Selected
            </button>
            <button
              type="button"
              onClick={() => {
                onBulkStatusChange("deactivated");
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-gray-400 hover:bg-gray-500/10 transition cursor-pointer"
              role="menuitem"
            >
              ✕ Deactivate Selected
            </button>
            <div className="my-1 border-t border-black/5 dark:border-white/5" />
            <button
              type="button"
              onClick={() => {
                onBulkDelete();
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
              role="menuitem"
            >
              🗑 Delete Selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
